import { OpenDialogOptions, window } from "vscode";
import { WebviewFile } from "../controllers/webview";
import { IConfig, Rpo } from "../interfaces/config";
import { Utils } from "../utils/utils";
import { ConfigModel } from "./config";

export class RpoModel {
    public static removeRpo(
        dados: IConfig,
        versao: string,
        pathToConfig: string
    ) {
        if (versao == "32") {
            this.remove32(dados, pathToConfig);
        } else {
            this.remove64(dados, pathToConfig);
        }
    }

    public static async AdicionaRpo(
        dados: IConfig,
        versao: string,
        pathToConfig: string
    ) {
        const config = new ConfigModel(pathToConfig);
        const nome = await Utils.selecionaNomes(
            "Nome do RPO ",
            "Ex: 12.1.2209"
        );
        const pasta = await this.selecionarArquivo(
            `Caminho onde se encontra o rpo ${versao} no servidor`
        );
        const rpovalues = {
            folder: pasta,
            name: nome,
        };
        if (this.validacaminhoRpo(pasta)) {
            if (versao == "32") {
                dados.rpo_rede.push(rpovalues);
            } else {
                dados.rpo_rede_64.push(rpovalues);
            }
            dados = config.save(dados);
            WebviewFile.Reload(dados);
        }
    }

    public static async remove32(dados: IConfig, pathToConfig: string) {
        const config = new ConfigModel(pathToConfig);
        const options: string[] = [];
        const placeHolder: string = "Selecione o RPO 32 bits para remover";
        dados.rpo_rede.forEach((element) => {
            options.push(element.name);
        });

        const selecionado = await Utils.selecionaDados(options, placeHolder);

        dados.rpo_rede = this.searchRpo(selecionado, dados.rpo_rede);

        dados = config.save(dados);
        WebviewFile.Reload(dados);
    }

    public static async remove64(dados: IConfig, pathToConfig: string) {
        const config = new ConfigModel(pathToConfig);
        const options: string[] = [];

        const placeHolder: string = "Selecione o RPO 64 bits para remover";
        dados.rpo_rede_64.forEach((element) => {
            options.push(element.name);
        });

        const selecionado = await Utils.selecionaDados(options, placeHolder);

        dados.rpo_rede_64 = this.searchRpo(selecionado, dados.rpo_rede_64);

        dados = config.save(dados);
        WebviewFile.Reload(dados);
    }

    public static searchRpo(selecionado: string, rpo: Rpo[]): Rpo[] {
        const index = rpo.findIndex((rpo) => rpo.name == selecionado);
        const rpos = rpo.splice(index);
        return rpos;
    }

    public static validacaminhoRpo(pasta: string) {
        if (!pasta.match(".rpo")) {
            Utils.MostraMensagemErro(" Caminho precisa conter o arquivo .RPO");
            return false;
        }
        return true;
    }

    public static async selecionarArquivo(message: string): Promise<string> {
        let file: string;
        const options: OpenDialogOptions = {
            canSelectMany: false,
            canSelectFiles: true,
            openLabel: message,
            filters: {
                rpo: ["rpo"],
            },
        };

        await window.showOpenDialog(options).then((fileUri) => {
            if (fileUri && fileUri[0]) {
                file = fileUri[0].fsPath;
            } else {
                file = null;
            }
        });
        return file;
    }
}

import * as path from "path";
import * as vscode from "vscode";

export class Webview {
    // There can be only one:
    public static current: Webview | undefined;

    public static readonly viewType = "glslPreview";

    private readonly panel: vscode.WebviewPanel;
    private readonly extensionPath: string;
    private disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionPath: string) {
        const column = vscode.ViewColumn.Beside;

        if (Webview.current) {
            Webview.current.panel.reveal(column);
            return;
        }

        console.log("creating webview");
        const panel = vscode.window.createWebviewPanel(Webview.viewType, "GLSL Preview", column, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(extensionPath, "resources"))],
        });

        Webview.current = new Webview(panel, extensionPath);
    }

    private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
        this.panel = panel;
        this.extensionPath = extensionPath;

        this.renderHTML();

        this.disposables.push(this.panel);
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    }

    public dispose() {
        Webview.current = undefined;
        vscode.Disposable.from(...this.disposables).dispose();
}

    private renderHTML() {
        console.log("renderHTML", this.extensionPath);
        this.panel.webview.html = getHTML(this.extensionPath);
    }
}

function getHTML(extensionPath: string): string {
    const nonce = getNonce();
    const scriptPath = path.join(extensionPath, "resources", "webview-main.js");
    const scriptUri = vscode.Uri.file(scriptPath).with({scheme: "vscode-resource"});
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta
                http-equiv="Content-Security-Policy"
                content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';"
            >
            <title>GLSL Preview</title>
        </head>
        <body>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>
    `;
}

function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

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
        const viewColumn = vscode.ViewColumn.Beside;

        if (Webview.current) {
            Webview.current.panel.reveal(viewColumn);
            return;
        }

        const panel = vscode.window.createWebviewPanel(Webview.viewType, "GLSL Preview", {
            viewColumn,
            preserveFocus: true, // remain focused on the editor when opening this
        }, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(extensionPath, "out", "resources"))],
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
        this.panel.webview.html = getHTML(this.extensionPath);
    }

    public updateShader(source: string) {
        this.panel.webview.postMessage({
            command: "updateShader",
            source,
        });
    }
}

function getHTML(extensionPath: string): string {
    const styleNonce = getNonce();

    const scriptNonce = getNonce();
    const scriptPath = path.join(extensionPath, "out", "resources", "bundle.js");
    const scriptUri = vscode.Uri.file(scriptPath).with({scheme: "vscode-resource"});

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta
                http-equiv="Content-Security-Policy"
                content="
                    default-src 'none';
                    img-src vscode-resource: https:;
                    script-src 'nonce-${scriptNonce}';
                    style-src 'nonce-${styleNonce}';
                "
            >
            <style nonce="${styleNonce}">
                body {
                    margin: 0;
                    padding: 0;
                }
            </style>
            <title>GLSL Preview</title>
        </head>
        <body>
            <script nonce="${scriptNonce}" src="${scriptUri}"></script>
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

import * as vscode from "vscode";

import {Webview} from "./webview";

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "GLSL Preview" is now active!');

    const disposable = vscode.commands.registerCommand("glslPreview.show", () => {
        console.log("glslPreview.show");
        Webview.createOrShow(context.extensionPath);
    });

    context.subscriptions.push(disposable);
}

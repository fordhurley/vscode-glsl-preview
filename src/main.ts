import * as vscode from "vscode";

import {Webview} from "./webview";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("glslPreview.show", () => {
        Webview.createOrShow(context.extensionPath);
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(onDidChangeTextDocument));
}

function onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent) {
    console.log("changed:", e.document.uri.toString());
    if (Webview.current) {
        Webview.current.updateShader(e.document.getText());
    }
}

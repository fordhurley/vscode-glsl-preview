import * as vscode from "vscode";

import {Webview} from "./webview";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("glslPreview.show", () => {
        Webview.createOrShow(context.extensionPath);
        updateShader();
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(updateShader));
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateShader));
}

function updateShader() {
    const source = getShaderSource();
    if (source && Webview.current) {
        Webview.current.updateShader(source);
    }
}

function getShaderSource(): string | undefined {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    if (editor.document.languageId !== "glsl") {
        return;
    }
    return editor.document.getText();
}

'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { EmmetActions } from './emmetActions';
import { EditProcessor } from './editProcessor';

export function activate(context: vscode.ExtensionContext) {
    let emmetActions;
    // let disposable = vscode.commands.registerCommand('extension.emmetMe', () => {
    //     let editProcessor = new EditProcessor(vscode.window.activeTextEditor);
    //     emmetActions = new EmmetActions(vscode.window.activeTextEditor, null, editProcessor);
    //     emmetActions.emmetMe()
    // });

    let subscriptions: vscode.Disposable[] = [];
    vscode.workspace.onDidChangeTextDocument(event => {
        let editProcessor = new EditProcessor(vscode.window.activeTextEditor);
        let contentChange = event.contentChanges.length ? event.contentChanges[0] : null;

        if (!editProcessor.isTypescript(event.document.languageId)) {
            return;
        }

        emmetActions = new EmmetActions(
            vscode.window.activeTextEditor, 
            contentChange, 
            editProcessor
        );
        emmetActions.emmetMe();
    }, this, subscriptions);

    context.subscriptions.push(emmetActions);
    //context.subscriptions.push(disposable);
}
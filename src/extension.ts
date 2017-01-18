'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { EmmetActions } from './emmetActions';


export function activate(context: vscode.ExtensionContext) {
    let emmetActions;
    let disposable = vscode.commands.registerCommand('extension.emmetMe', () => {
        try {
            emmetActions = new EmmetActions(vscode.window.activeTextEditor);
            emmetActions.emmetMe();
        } catch(e) {}
    });

    context.subscriptions.push(emmetActions);
    context.subscriptions.push(disposable);
}
import * as vscode from 'vscode';
import { EditProcessor, ILineInfo } from './editProcessor';

// emmet
var utils = require('emmet/lib/utils/common');
var tabStops = require('emmet/lib/assets/tabStops');
var parser = require('emmet/lib/parser/abbreviation');


/**
 * After user hit tab key and currently open file is typescript try to transform term into html like syntax.
 * In case of err or any other reason insert a tab in usual manner. 
 */
export class EmmetActions {
    lang = 'typescript';
    editProcessor: EditProcessor;

    constructor(public textEditor: vscode.TextEditor) { 
        this.editProcessor = new EditProcessor(this.textEditor);
    }

    /**
     * Try to change abbreviation to html like syntax inside Angular's 2 typecript file.
     * In case of failure or for other reason handle tab key stroke event as default. 
     */
    emmetMe() {        
        //let editor = vscode.window.activeTextEditor;
        
        if (!this.textEditor) {
            return;
        }

        let lineInfo: ILineInfo = this.editProcessor.lineInfo;
        // just add tab
        if (!lineInfo.abbr) {
            this.editProcessor.addTab(lineInfo);
            return;
        }

        if (this.textEditor.document.languageId === this.lang) {
            try {
                // try to get content from abbrevation
                let options = { syntax: 'html' };

                let content = parser.expand(lineInfo.abbr, options);                
                content = this.editProcessor.sanitizeContent(content);
                content = tabStops.processText(content, {
                    tabstop: function(data) {
                        return data.placeholder || '';
                    }
                });
                this.editProcessor.replaceText(content, lineInfo);
            } catch(e) {
                this.editProcessor.addTab(lineInfo);
            }
        }
    }

    dispose() {
        
    }
}
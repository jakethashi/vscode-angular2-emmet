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

    constructor() { 
        this.editProcessor = new EditProcessor();
    }

    /**
     * Try to change abbreviation to html like syntax inside Angular's 2 typecript file.
     * In case of failure or for other reason handle tab key stroke event as default. 
     */
    emmetMe() {
        //let editor = vscode.window.activeTextEditor;
        
        if (!vscode.window.activeTextEditor) {
            return;
        }

        let lineInfo: ILineInfo = this.editProcessor.getLineInfo();
        // just add tab
        if (!lineInfo.angularInfo.abbr) {
            this.editProcessor.addTab(lineInfo);
            return;
        }

        if (vscode.window.activeTextEditor.document.languageId === this.lang) {
            try {
                // try to get content from abbreviation
                let options = { syntax: 'html' };


                let content = parser.expand(lineInfo.angularInfo.abbr, options);                
                content = this.editProcessor.sanitizeContent(content, lineInfo);
                content = tabStops.processText(content, {
                    tabstop: function(data) {
                        return data.placeholder || '';
                    }
                });

                // let content = parser.expand(lineInfo.angularInfo.abbr, options);                
                // let index = 1;
                // content = tabStops.processText(content, {
                //     tabstop: function(data) {
                //         // TODO: place for improvements, check emmet implementation
                //         return '${'+(index++) +'}';
                //     }
                // });
                this.editProcessor.replaceText(content, lineInfo);
            } catch(e) {
                this.editProcessor.addTab(lineInfo);
            }
        }
    }

    dispose() {
        
    }
}
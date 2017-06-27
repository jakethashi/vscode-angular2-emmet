import * as vscode from 'vscode';

/**
 * Holds abbreviation add all information needed for emmet transformation.
 */
export interface ILineInfo {
    selection: vscode.Selection;
    abbrStartAt?: number;
    angularInfo: IAngularInfo;
}

/**
 * Describe which direction toward the biggining or end document should we search.
 * used to show editors side by side.
 */
enum Directions {
    top,
    bottom
} 

/**
 * Contains row, column and matcher of found item.
 */
interface ILineFinding {
    line: number;
    position: number;
    matcher: string;
    content: string
}

/**
 * Holds information related with analyzing of the line which contains abbreviation.
 */
interface IAngularInfo {
    abbr: string;
    insideComponentDecorator: boolean;
    isTemplateLiteral?: boolean;
}

/**
 * Helper utility to analyzing current document in order to mimic tab feature or insert Emmet's result
 * inside template value.
 */
export class EditProcessor implements vscode.Disposable {

    /**
     * Get line information for Emmet transformation. 
     */
    private _cachedLines: Array<string> = []; 

    constructor() { 
    }

    /**
     * Get information of current line. In case line is already known, return cached value. 
     */
    public getLineInfo(): ILineInfo {
        this._cachedLines = [];
        return this.getContentInfo();
    }

    /**
     * Get information for current line 
     */
    private getContentInfo() : ILineInfo {
        let angularInfo = this.getAngularInfo();

        if (!angularInfo.insideComponentDecorator) {            
            return {
                selection: vscode.window.activeTextEditor.selection,
                angularInfo: angularInfo
            }
        }

        return {
            selection: vscode.window.activeTextEditor.selection,
            abbrStartAt: vscode.window.activeTextEditor.selection.start.character - angularInfo.abbr.length,
            angularInfo: angularInfo
        }
    }

    /**
     * Alter emmet's generated content into approprite form, considers editor tabs options, which suits to current document.
     *      
     * @param content Result from emmet transformation.
     * @param lineInfo Information about line.
     * @return An formated text ready to paste into document. 
     */
    sanitizeContent(content: string, lineInfo: ILineInfo): string {
        // remove all lines in case we are not inside template literal
        if (!lineInfo.angularInfo.isTemplateLiteral) {
            return content.replace(/[\n|\t]/g, '');
        }

        let tabSize = Number(vscode.window.activeTextEditor.options.tabSize);
        let tabCount = (this.getLineInfo().abbrStartAt / tabSize);
        let tabs = this.createSpaces((tabSize * tabCount) - tabSize);
        let result = content.replace(/\n/g, '\n' + tabs);

        // remove tabs in case editor use spaces for indentation
        if (vscode.window.activeTextEditor.options.insertSpaces) {
            var tab = this.createSpaces();
            while(~result.indexOf('\t')) {
                result = result.replace(/\t/, tab);    
            }
        }


        return result;        
    }

    /**
     * Remove unwanted characters from abbreviation 
     *      
     * @param abbreviation Syntax to be transformed to html like syntax.
     * @return Representation of html syntax 
     */
    private sanitizeAbbreviation(abbr: string, angularInfo: IAngularInfo): string {
        abbr = abbr.trim();
        abbr = abbr.replace(/template/, '');
        abbr = abbr.replace(/\s*:\s*[`|'|"]*/, '');
        abbr = abbr.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
        abbr = abbr.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

        let parts = abbr.split('>');
        if (parts.length > 1) {
            // combine all parts which doesnt' contain allowed character

            // get valid emmet parts in reverse order
            let response = [];
            for (let index = parts.length - 1; index >= 0; index--) {
                let part = parts[index];
                // replace content between two quotes
                part = part.replace(/"([^"]+)"/g, '""');
                part = part.replace(/'([^']+)'/g, '\'\'');

                if (!part.match(/^[a-zA-Z 0-9\.\,\+\-\@\^\*\(\)#\[\]\=\$\{\}\'\"\_]*$/)) {
                    break;
                }
                response.push(parts[index]);
            }
            
            abbr = response.reverse().join('>');
        }
        return abbr;
    }

    /**
     * Find coordinates of one to n texts. 
     *      
     * @param search An array of items to be found, first match wins.
     * @param direction Determines which direction should we find.
     * @return Location inside document currently found item. 
     */
    findLine(search: Array<any>, direction: Directions, line?: number, offsetChar?: number): ILineFinding {
        //search = typeof search === 'string' ? [search] : search;        
        let top = direction === Directions.top;

        line = line || vscode.window.activeTextEditor.selection.start.line;
        for (let i = line; top ? i >= 0 : i < vscode.window.activeTextEditor.document.lineCount; top ? i-- : i++) {
            let currentLine = this._cachedLines[i];
            if (!currentLine) {
                this._cachedLines[i] = currentLine = vscode.window.activeTextEditor.document.lineAt(i).text;
            }             

            if (offsetChar && i === line) {
                currentLine = currentLine.substring(offsetChar);
            }

            let foundItem: ILineFinding;

            search.forEach(token => {
                let currentPosition = currentLine.indexOf(token); 

                if (~currentPosition) {
                    foundItem = {
                        line: i,
                        position: currentPosition,
                        matcher: token,
                        content: currentLine
                    }
                    return;
                }
            });
            if (foundItem) {
                return foundItem;
            }
        }
        return null;
    }

    /**
     * Find abbreviation together with matadata in order to determine whther an abbreviation 
     * is surrounded with component decorator and is wrapped by any kind of quotes.
     *      
     * @return metadata related to Angular of analyzing an abbreviation. 
     */
    private getAngularInfo(): IAngularInfo {        
        let isMultiline = vscode.window.activeTextEditor.selection.end.line - vscode.window.activeTextEditor.selection.start.line > 1;

        if (!isMultiline) {
            // TODO: !!!
            // consider component decorator as a json object and transform key value pairs into
            // valid form in order to analyze it more precisely.
        

            let dEnd: ILineFinding, sTemplate: ILineFinding;
            // 1. find position of component decorator            
            var dStart = this.findLine(['@Component'], Directions.top);
            
            // 2. find template
            if (dStart) {
                sTemplate = this.findLine(['template'], Directions.bottom, dStart.line);
            }

            // 3. get template type, just for now support only template literal
            var tStart;
            if (sTemplate) {
                tStart = this.findLine(['`'], Directions.bottom, sTemplate.line);
            }
            if (dStart && tStart) {
                
                dEnd = this.findLine(['`'], Directions.bottom, tStart.line, tStart.content.length + 1);

                // we are inside component decorator
                let cursorLine = vscode.window.activeTextEditor.selection.start.line;
                if (dStart && dEnd && dStart.line < cursorLine && 
                    dEnd.line >= cursorLine &&
                    // cursor position has after template atribute
                    // TODO: check if cursor is after templates quote
                    sTemplate && sTemplate.line <= cursorLine) 
                {
                    // find enclosing quote for template statement
                    let tEnd = this.findLine(['\'', '"', '`'], Directions.bottom);
                    
                    let line = vscode.window.activeTextEditor.document.lineAt(cursorLine);

                    let abbrCandidate = vscode.window.activeTextEditor.document.getText(
                        new vscode.Range(
                            new vscode.Position(cursorLine, 0),
                            vscode.window.activeTextEditor.selection.end
                        ) 
                    );    

                    // we sould be able to create emmet in every place in text
                    // TODO: extend contition from template to very first quote
                    let isTemplateLiteral = sTemplate.content.indexOf('`') >= 0;
    
                    // replace everithing which is not part of abbreviation
                    abbrCandidate = this.sanitizeAbbreviation(abbrCandidate, null);
    
                    return {
                        insideComponentDecorator: true,
                        isTemplateLiteral: isTemplateLiteral,
                        abbr: abbrCandidate
                    };
                }
    
            }
        }

        return {
            insideComponentDecorator: false,
            abbr: null
        }
    }

    /**
     * Creates string of spaces or tabs according editor options.
     *
     * @param append Add extra spaces or tabs.
     * @return String of spaces or tabs. 
     */
    createSpaces(append?: number): string {
        append = append || 0;
        let spaces = [];
        
        if (!vscode.window.activeTextEditor.options.insertSpaces && append === 0) {
            return '\t'
        }

        for (let i = 0; i < Number(vscode.window.activeTextEditor.options.tabSize) + append; i++, spaces.push(vscode.window.activeTextEditor.options.insertSpaces ? ' ' : '\t'));
        return spaces.join('');        
    }

    /**
     * Add tab to current position of cursor or shift selected block.
     *
     * @param li Information about line.
     */
    addTab(li: ILineInfo) {
        return new Promise(resolve => {
            var tabs = this.createSpaces();
            vscode.window.activeTextEditor.edit(editBuilder => {
                if (li.selection.end.line - li.selection.start.line >= 1) {
                    for (let i = li.selection.start.line; i <= li.selection.end.line; i++) {
                        editBuilder.insert(new vscode.Position(i, 0), tabs);
                    }
                } else {
                    editBuilder.insert(new vscode.Position(li.selection.start.line, li.selection.start.character), tabs);
                }
            })
            .then(() => {
                resolve();
            })
        });
    }

    /**
     * Replace abbreviation with generated result of emmet library.
     *
     * @param content Html like content to replace abbreviation.
     * @param li Information how to replace abbreviation.
     * 
     * TODO
     * it would be nice to place the content as snippet. 
     */
    replaceText(content: string, li: ILineInfo) {
        return new Promise(resolve => {
            let options = vscode.window.activeTextEditor.options;
            
            // TODO: disable undo with , { undoStopBefore: false, undoStopAfter: false }
            vscode.window.activeTextEditor
                .edit(editBuilder => {
                    editBuilder.delete(
                        new vscode.Range(
                            new vscode.Position(li.selection.start.line, li.selection.start.character - li.angularInfo.abbr.length), 
                            new vscode.Position(li.selection.start.line, li.selection.start.character)
                        )
                    );

                    //editBuilder.insert(new vscode.Position(li.selection.start.line, li.selection.start.character - li.angularInfo.abbr.length), content)
                    // TODO: disable insert of snippet until undo issue will be solved
                    // editBuilder.delete(
                    //     new vscode.Range(
                    //         new vscode.Position(li.selection.start.line, li.selection.start.character - li.angularInfo.abbr.length), 
                    //         new vscode.Position(li.selection.start.line, li.selection.start.character)
                    //     )
                    // );
                    
                }, { undoStopBefore: true, undoStopAfter: true })
                .then(() => {
                    return vscode.window.activeTextEditor.insertSnippet(
                        new vscode.SnippetString(content), new vscode.Position(li.selection.start.line, li.selection.start.character),
                        { undoStopBefore: true, undoStopAfter: true }
                    );
                }).then(() => {
                    resolve();
                });
    
        });

    }

    /**
     * Insert centent iside given poisition.
     *
     * @param content to be inserted into position.
     * @param position line and character representing position inside an document.
     */
    setText(content: string, position: vscode.Position) {
        vscode.window.activeTextEditor.edit(editBuilder => {
            editBuilder.insert(position, content)            
        });
    }

    /**
     * Get text determined by selection.
     *
     * @param selection Range of selected area.
     * @return Selected text. 
     */
    getText(selection: vscode.Selection) {
        let response = '';
        for (let i = selection.start.line; i <= selection.end.line; i++) {
            let currentLine = vscode.window.activeTextEditor.document.lineAt(i).text;
            
            // remove unwanted characters from begining of selection
            if (i === selection.start.line) {
                currentLine = currentLine.substring(selection.start.character);
            }
            // remove unwanted characters from end of selection
            if (i === selection.end.line) {
                currentLine = currentLine.substring(0, selection.end.character);
            }            
            response += currentLine;
        }

        return response;
    }

    dispose() {
        this._cachedLines = null;    
        delete this._cachedLines;
    }

}
import * as vscode from 'vscode';

/**
 * Holds abbreviation add all information needed for emmet transformation.
 */
export interface ILineInfo {
    abbr?: string;
    selection: vscode.Selection;
    abbrStartAt?: number;
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
 * Contains row and column of found item.
 */
interface ILineFinding {
    line: number;
    position: number
}

/**
 * Helper utility to analyzing current document in order to mimic tab feature or insert Emmet's result
 * inside template value.
 */
export class EditProcessor {

    /**
     * Get line information for Emmet transformation. 
     * 
     * @readonly
     */
    private _lineInfo: ILineInfo;

    constructor(private _editor: vscode.TextEditor) { }

    /**
     * Get information of current line. In case line is already known, return cached value. 
     */
    public get lineInfo() {
        if (!this._lineInfo) {
            this._lineInfo = this.getContentInfo();
        }
        return this._lineInfo;
    }

    /**
     * Get information for current line 
     */
    private getContentInfo() : ILineInfo {
        var lineSelection = this._editor.selection.with(new vscode.Position(this._editor.selection.start.line, 0), this._editor.selection.end);
        let lineContent = this._editor.document.getText(lineSelection);
        var abbr = lineContent.split(' ').slice(-1)[0];
        
        if (!this.isInsideAngularComponent()) {            
            return {
                selection: this._editor.selection
            }
        }

        abbr = this.sanitizeAbbreviation(abbr);

        if (abbr.endsWith('\'')) {
            abbr = null;
        }

        return {
            abbr: abbr,
            selection: this._editor.selection,
            abbrStartAt: this._editor.selection.start.character - abbr.length
        }
    }

    /**
     * Alter emmet's generated content into approprite form, considers editor tabs options, which suits to current document.
     *      
     * @param content Result from emmet transformation.
     * @return An formated text ready to paste into document. 
     */
    sanitizeContent(content: string): string {
        let tabSize = Number(this._editor.options.tabSize);
        let tabCount = (this.lineInfo.abbrStartAt / tabSize);
        let tabs = this.createSpaces((tabSize * tabCount) - tabSize);
        let result = content.replace(/\n/g, '\n' + tabs);

        // remove tabs in case editor use spaces for indentation
        if (this._editor.options.insertSpaces) {
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
    private sanitizeAbbreviation(abbr: string): string {
        abbr = abbr.replace(/\'/, '');
        abbr = abbr.replace('`', '');
        abbr = abbr.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
        abbr = abbr.replace(/^\s\s*/, '').replace(/\s\s*$/, '');     
        return abbr;
    }

    /**
     * Find coordinates of one to n texts. 
     *      
     * @param search An array of items to be found, first match wins.
     * @param direction Determines which direction should we find.
     * @return Location inside document currently found item. 
     */
    findLine(search: Array<string>, direction: Directions): ILineFinding {
        //search = typeof search === 'string' ? [search] : search;        
        let t = direction === Directions.top;

        for (let i = this._editor.selection.start.line; t ? i >= 0 : i < this._editor.document.lineCount; t ? i-- : i++) {
            let currentLine = this._editor.document.lineAt(i).text;
            let line = -1;
            let position = -1;

            if (i === this._editor.selection.start.line && !t) {
                currentLine = currentLine.substring(this._editor.selection.start.character);
            }

            search.forEach(token => {
                let currentPosition = currentLine.indexOf(token); 

                if (~currentPosition) {
                    line = i;
                    position = currentPosition;
                    return;
                }
            });
            if (~line) {
                return {
                    line: line,
                    position: position
                };
            }
        }
        return null;
    }

    /**
     * Return flag whther an abbreviation is surrounded with component decorator and is wrapped by any kind of quotes.
     *      
     * @return True if an abbreviation could be transformed. 
     */
    private isInsideAngularComponent(): boolean {
        let isMultiline = this._editor.selection.end.line - this._editor.selection.start.line > 1;

        if (!isMultiline) {
            // find position of component decorator
            let dStart = this.findLine(['@Component'], Directions.top);
            let dEnd = this.findLine(['}'], Directions.bottom);

            // we are inside component decorator
            if (dStart && dEnd && dStart.line < this._editor.selection.start.line && dEnd.line > this._editor.selection.start.line) {
                // examine wether content is surrounded with '`" sign
                // TODO: check relation to quotes
                let sStart = this.findLine(['\'', '"', '`'], Directions.top);
                let sEnd = this.findLine(['\'', '"', '`'], Directions.bottom);

                if (!sStart || !sEnd) {
                    return false;
                }

                // start and and in different
                if (sStart.line < this._editor.selection.start.line && sEnd.line > this._editor.selection.start.line) {
                    return true;
                }
                // start at same but current position is after sign
                if (sStart.line === this._editor.selection.start.line && sStart.position < this._editor.selection.start.character) {
                    return true;
                }

                // end at same but current position is before sign
                if (sEnd.line === this._editor.selection.start.line && sEnd.position >= this._editor.selection.start.character) {
                    return true;
                }

                // start and end at same
                if (sEnd.line === this._editor.selection.start.line && sEnd.position < this._editor.selection.start.character) {
                    return true;
                }
            }
            return false;
        }

        return false;
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
        
        if (!this._editor.options.insertSpaces && append === 0) {
            return '\t'
        }

        for (let i = 0; i < Number(this._editor.options.tabSize) + append; i++, spaces.push(this._editor.options.insertSpaces ? ' ' : '\t'));
        return spaces.join('');        
    }

    /**
     * Add tab to current position of cursor or shift selected block.
     *
     * @param li Information about line.
     */
    addTab(li: ILineInfo): void {
        var tabs = this.createSpaces();
        this._editor.edit(editBuilder => {
            if (li.selection.end.line - li.selection.start.line > 1) {
                for (let i = li.selection.start.line; i <= li.selection.end.line; i++) {
                    editBuilder.insert(new vscode.Position(i, 0), tabs);
                }
            } else {
                editBuilder.insert(new vscode.Position(li.selection.start.line, li.selection.start.character), tabs);
            }
        });
    }

    /**
     * Replace abbreviation with generated result of emmet library.
     *
     * @param content Html like content to replace abbreviation.
     * @param li Information how to replace abbreviation.
     */
    replaceText(content: string, li: ILineInfo) {
        this._editor.edit(editBuilder => {
            editBuilder.delete(
                new vscode.Range(
                    new vscode.Position(li.selection.start.line, li.selection.start.character - li.abbr.length), 
                    new vscode.Position(li.selection.start.line, li.selection.start.character)
                )
            );
            editBuilder.insert(new vscode.Position(li.selection.start.line, li.selection.start.character - li.abbr.length), content)            
        });
    }

    /**
     * Insert centent iside given poisition.
     *
     * @param content to be inserted into position.
     * @param position line and character representing position inside an document.
     */
    setText(content: string, position: vscode.Position) {
        this._editor.edit(editBuilder => {
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
            let currentLine = this._editor.document.lineAt(i).text;
            
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

}
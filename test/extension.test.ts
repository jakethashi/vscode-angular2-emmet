import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';

import * as vscode from 'vscode';

import { EmmetActions } from '../src/emmetActions';

suite("Extension Tests", () => {

    interface ITestSet {
        name: string;
        inputFile: string;
        expectedResultFile: string;
        selection: Array<number>;
        beforeProcess?: any;
    }

    let testSets: Array<ITestSet> = [
        { name: 'Test01', inputFile: 'test01.ts', expectedResultFile: 'test01.result.ts', selection: [5, 19, 5, 19] },
        { name: 'Test02', inputFile: 'test02.ts', expectedResultFile: 'test02.result.ts', selection: [5, 27, 5, 27] },
        { name: 'Test03', inputFile: 'test03.ts', expectedResultFile: 'test03.result.ts', selection: [5, 46, 5, 46] },
        { name: 'ChildTest', inputFile: 'test04.ts', expectedResultFile: 'test04.result.ts', selection: [5, 17, 5, 17] },
        { name: 'SiblingTest', inputFile: 'test05.ts', expectedResultFile: 'test05.result.ts', selection: [5, 16, 5, 16] }
    ];
    
    testSets.forEach(item => {
        test(item.name, () => {
            return new Promise(resolve => {
                let filePath = __dirname.replace('\\out\\test', '') + `/test_cases/${item.expectedResultFile}`
                let expectedResult = fs.readFileSync(filePath, 'utf8');
                if (typeof item.beforeProcess === 'function') {
                    expectedResult = item.beforeProcess(expectedResult);
                }

                vscode.workspace.openTextDocument( __dirname.replace('\\out\\test', '') + `/test_cases/${item.inputFile}` )
                    .then( ( doc ) => {
                        return vscode.window.showTextDocument( doc );
                    } )
                    .then( textEditor => {
                        textEditor.selection = new vscode.Selection(item.selection[0], item.selection[1], item.selection[2], item.selection[3]);
                        let emmetActions: EmmetActions = new EmmetActions();
                        emmetActions.emmetMe()
                            .then(() => {
                                let content = textEditor.document.getText();
                                content = content.replace(item.name, item.name + 'Result');
                                assert.equal(expectedResult, content);
                                resolve();
                            });
                    } );
                
            });
    
        });
        
    });
});
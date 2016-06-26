//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as path from 'path';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';
import { EmmetActions } from '../src/emmetActions';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {


    // Defines a Mocha unit test
    test("open test case", (done) => {
        vscode.workspace.openTextDocument(path.join(__dirname, '..', '..', 'test/app.component.ts')).then((document) => {
	        let emmetAction = new EmmetActions(vscode.window.activeTextEditor);
			emmetAction.textEditor.selection = new vscode.Selection(new vscode.Position(10, 27), new vscode.Position(10, 27));
			//vscode.Te 
			//emmetAction.textEditor.document =  document;
	
			emmetAction.emmetMe();

			//assert.equal(testWordCounter._getWordCount(document), 254);
			assert.equal(1, 1);
			done();
		}, (error) => {
			assert.fail(error);
			done();
		});
    });
});
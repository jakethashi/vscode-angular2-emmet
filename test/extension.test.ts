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

	test("open test case", (done) => {
		setTimeout(() => {
			let emmetAction = new EmmetActions(vscode.window.activeTextEditor);
			
			let abbr1 = 'ul>li*3';
			let expectedResponse = '<ul>                    <li></li>                    <li></li>                    <li></li>                </ul>';
			emmetAction.editProcessor.setText(abbr1, new vscode.Position(10, 16));

		    setTimeout(() => {
				emmetAction.textEditor.selection = new vscode.Selection(new vscode.Position(10, 23), new vscode.Position(10, 23));

				setTimeout(() => {
					emmetAction.emmetMe();

					setTimeout(() => {
						var selection = new vscode.Selection(
							new vscode.Position(10, 16), 
							new vscode.Position(14, 21)
						);
						var response = emmetAction.editProcessor.getText(selection);
						
						assert.equal(response, expectedResponse);

						done();
					}, 2000);
				}, 1000);
			}, 1000);
			
		}, 1500);


	});

	
    // Defines a Mocha unit test

});
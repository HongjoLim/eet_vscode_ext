// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import instructions = require('./instruction_declarations.json');

const EET_LANGUAGE_CONFIG = require("../syntaxes/eet.tmLanguage.json").patterns[0];

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "eet" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	vscode.languages.registerHoverProvider('eet', {
    	provideHover(document, position, token) {
			let line = document.lineAt(position.line);
			let parsed = line.text.match(EET_LANGUAGE_CONFIG.match)
			
			let output = '';
			if (parsed != undefined) { //Ensure parsed data exists
				//Take each tokenized capture group, save the length of the word
				//compare against current cursor position to determine which group we are currently hovering over
				let runningWordCharCount = 0;
				for (let i = 1; i <= Math.min(parsed.length,Object.keys(EET_LANGUAGE_CONFIG.captures).length); i++) { 
					//capture group count is the minimum of the number of captures in the regex, or the number of captures defined in the language spec
					if (parsed[i] != null) {
						runningWordCharCount += parsed[i].length;
						if (position.character < runningWordCharCount) {
							output = EET_LANGUAGE_CONFIG.captures[i].tooltip_name;
							break;
						 }
					}
				}
				//Further processing of instruction hover can potentially be implemented here, based on instruction number, etc. This is left as an exercise to the reader!
			}
			
      	return {
        	contents: [output]
      };
    }
  	});
	  
	const provider1 = vscode.languages.registerCompletionItemProvider('eet', {

		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			const instruction_items = get_instruction_providers();
			return instruction_items;
		}
	});

	function get_instruction_providers() {
		let declarations = instructions.instructions;
		const providers = [];
		for (let ins of declarations){
			const item = new vscode.CompletionItem(`Instruction ${ins.id}: ${ins.name}`);
			let default_values = ins.fields.map((item) => {
				return item.default;
			  }).join(', ');
			item.insertText = new vscode.SnippetString(`${ins.id}, <Ver: ${ins.version}>, ${default_values}`);
			item.documentation = new vscode.MarkdownString(`Inserts ${ins.id} instruction with default values.`);

			providers.push(item);
		}

		return providers;
	}

	context.subscriptions.push(provider1);
}

// this method is called when your extension is deactivated
export function deactivate() {}

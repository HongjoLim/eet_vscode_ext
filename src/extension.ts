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
			let text = line.text;
			let items = text.split(',');
			let indexOfItem = text.substring(0, position.character + 1).split(',').length - 1;
			console.log(indexOfItem);

			let output = '';
			switch (indexOfItem){
				case 0:
					output = 'stream time';
					break;
				case 1:
					output = 'Unique Message Index';
					break;
				case 2:
					output = 'Message ID';
					break;
				case 3:
					if(items[indexOfItem].trim().startsWith('<') && items[indexOfItem].trim().endsWith('>')){
						output = 'Version Number';
					}else{
						output = get_field_name_by_index(parseInt(items[2]), indexOfItem - 3);
					}
					break;
				default:
					output = get_field_name_by_index(parseInt(items[2]), indexOfItem - 3);
					break;
			}
			
      	return {
        	contents: [output]
      };
    }
  	});

	  function get_field_name_by_index(instruction_id: number, field_index: number){
		const declarations = instructions.instructions;
		let match = declarations.find(x => x.id == instruction_id);
		if(match != undefined){
			return `${match.fields[field_index].name}.\nrange: ${match.fields[field_index].min || '0'}- ${match.fields[field_index].max || ''}`;
		}
		
		return '';
	  }
	  
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

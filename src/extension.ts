import * as vscode from 'vscode';

import instructions = require('./300.json');
import { subscribeToDocumentChanges } from './diagnostics';

const EET_LANGUAGE_CONFIG = require("../syntaxes/eet.tmLanguage.json").patterns[0];
const DECLARATIONS = instructions.instructions;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const emojiDiagnostics = vscode.languages.createDiagnosticCollection("emoji");
	context.subscriptions.push(emojiDiagnostics);
	subscribeToDocumentChanges(context, emojiDiagnostics);

	vscode.languages.registerHoverProvider('eet', {
    	provideHover(document, position, token) {
			let line = document.lineAt(position.line);
			let output = '';

			let text = line.text;
			let parsed = line.text.match(EET_LANGUAGE_CONFIG.match)
			
			if(line.isEmptyOrWhitespace || parsed == undefined){
				return {contents: [output]};
			}

			let items = text.split(',');
			let fVersionTagPresent = version_tag_exists(items);
			let version_number = 0;

			if(fVersionTagPresent){
				version_number = get_version_number(items[3]);
			}

			let indexOfItem = text.substring(0, position.character + 1).split(',').length - 1;
			let instruction_id = items[indexOfItem];

			switch (indexOfItem){
				case 0:
					output = 'stream time';
					break;
				case 1:
					output = 'Unique Message Index';
					break;
				case 2:
					const instruction = get_instruction_by_id_and_version_number(parseInt(instruction_id), version_number);
					output = `Message ID : ${instruction_id} - ${instruction?.name}`;
					break;
				case 3:
					if(fVersionTagPresent){
						output = 'Version Number';
					}else{
						output = get_field_name_by_index(parseInt(items[2]), version_number, fVersionTagPresent ? indexOfItem - 4 : indexOfItem - 3,);
					}
					break;
				default:
					output = get_field_name_by_index(parseInt(items[2]), version_number, fVersionTagPresent ? indexOfItem - 4 : indexOfItem - 3);
					break;
			}
			
      	return {contents: [output]};
    }
  	});

	  function get_version_number(version_tag: string){
		  let version_number = version_tag.match(/\d+/)?.shift() || '0';
		  return parseInt(version_number);
	  }

	  function version_tag_exists(items: string[]){
		  let version_tag_exists = false;

		  if(items.length >= 4){
			  let trimmed_text = items[3].trim();
			  version_tag_exists = trimmed_text.startsWith("<") && trimmed_text.endsWith(">"); 
		  }

		  return version_tag_exists;
	  }

	  function get_instruction_by_id_and_version_number(instruction_id: number, version_number: number){
		  const match = DECLARATIONS.find(x => x.id == instruction_id && x.version == version_number);
		  return match;
	  }

	  function get_field_name_by_index(instruction_id: number, version_number: number, field_index: number){
		let match = get_instruction_by_id_and_version_number(instruction_id, version_number);
		if(match !== undefined){
			let key = match.fields[field_index].name;
			return key;
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
		const providers = [];
		for (let ins of DECLARATIONS){
			const item = new vscode.CompletionItem(`create ${ins.id}: ${ins.name}`);
			let version_number = ins.version;
			let default_values = create_instruction_with_default_values(ins.id, version_number);
			item.insertText = new vscode.SnippetString(`${ins.id}, <Ver: ${version_number}>, ${default_values}`);
			item.documentation = new vscode.MarkdownString(`Inserts ${ins.id} instruction with default values.`);

			providers.push(item);
		}

		return providers;
	}

	function create_instruction_with_default_values(instrcution_id: number, version_number: number){
		let match = get_instruction_by_id_and_version_number(instrcution_id, version_number);
		let default_values = match?.fields.map((item) => {
			return item?.default;
		  }).join(', ');
		return default_values;
	}

	context.subscriptions.push(provider1);
}

// this method is called when your extension is deactivated
export function deactivate() {}

import * as vscode from 'vscode';
import { subscribeToDocumentChanges } from './diagnostics';
import * as utils from './tools/utils';
import * as repository from './tools/repository';
import { InstructionValidationService } from './tools/validator';
import { Parser } from './tools/parser';

const DOCUMENT_SELECTOR = 'eet';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const messageDiagnostics = vscode.languages.createDiagnosticCollection("emoji");
	context.subscriptions.push(messageDiagnostics);
	const parser = new Parser();
	subscribeToDocumentChanges(new InstructionValidationService(parser), context, messageDiagnostics);

	vscode.languages.registerHoverProvider(DOCUMENT_SELECTOR, {
		provideHover(document, position, token) {

			let line = document.lineAt(position.line);
			let output = parser.getToolTip(line.text, position.character);
			return { contents: [output] };
		}
	});

	const provider1 = vscode.languages.registerCompletionItemProvider(DOCUMENT_SELECTOR, {

		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
			const instruction_items = get_instruction_providers();
			return instruction_items;
		}
	});

	function get_instruction_providers() {
		const providers = [];
		for (let ins of repository.getAllInstructions()) {
			const item = new vscode.CompletionItem(`new ${ins.id}: ${ins.name}`);
			let default_values = utils.create_instruction_with_default_values(ins.fields);
			item.insertText = new vscode.SnippetString(`0, 0, ${ins.id}, <Ver: ${ins.version}>, ${default_values}`);
			item.documentation = new vscode.MarkdownString(`Inserts ${ins.id} instruction with default values.`);

			providers.push(item);
		}

		return providers;
	}

	context.subscriptions.push(provider1);
}

// this method is called when your extension is deactivated
export function deactivate() { }

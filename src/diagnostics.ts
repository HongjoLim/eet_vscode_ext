import * as vscode from 'vscode';
import { Instruction } from './models/instruction';
import * as parser from './tools/instruction_parser';
import { InstructionValidationService, IService} from './tools/validator';

/** Code that is used to associate diagnostic entries with code actions. */
export const INCORRECT_FORMAT_ERROR = 'incorrect message format';

/** String to detect in the text document. */
const EET_LANGUAGE_CONFIG = require("../syntaxes/eet.tmLanguage.json").patterns[0];

export function refreshDiagnostics(validaitionService: IService<vscode.TextLine, vscode.Diagnostic[]>, doc: vscode.TextDocument, formatDiagnostics: vscode.DiagnosticCollection): void {
	const diagnostics: vscode.Diagnostic[] = [];

	for (let i = 0; i < doc.lineCount; i++) {

		const lineOfText = doc.lineAt(i);

		if (lineOfText.isEmptyOrWhitespace) {
			continue;;
		}

		validaitionService.run(lineOfText);
	}

	formatDiagnostics.set(doc.uri, diagnostics);
}

export function subscribeToDocumentChanges(validator: IService<vscode.TextLine, vscode.Diagnostic[]>, context: vscode.ExtensionContext, formatDiagnostics: vscode.DiagnosticCollection): void {
	if (vscode.window.activeTextEditor) {
		refreshDiagnostics(validator, vscode.window.activeTextEditor.document, formatDiagnostics);
	}
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				refreshDiagnostics(validator, editor.document, formatDiagnostics);
			}
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(validator, e.document, formatDiagnostics))
	);

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(doc => formatDiagnostics.delete(doc.uri))
	);
}
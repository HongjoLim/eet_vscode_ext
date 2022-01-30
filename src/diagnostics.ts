import * as vscode from 'vscode';
import * as parser from './tools/instruction_parser';
import * as validator from './tools/instruction_validator';

/** Code that is used to associate diagnostic entries with code actions. */
export const EMOJI_MENTION = 'incorrect_message_format';

/** String to detect in the text document. */
const EET_LANGUAGE_CONFIG = require("../syntaxes/eet.tmLanguage.json").patterns[0];

export function refreshDiagnostics(doc: vscode.TextDocument, formatDiagnostics: vscode.DiagnosticCollection): void {
	const diagnostics: vscode.Diagnostic[] = [];

	for (let i = 0; i < doc.lineCount; i++) {
		const lineOfText = doc.lineAt(i);

		if (lineOfText.isEmptyOrWhitespace) {
			continue;
		}

		const text = lineOfText.text;
		const parsed = text.match(EET_LANGUAGE_CONFIG.match);

		if (parsed === undefined) {
			diagnostics.push(createDiagnostic(['Message not in correct format'], i, text.length));
			continue;
		}

		let [dataInCsv, description] = parser.split_into_dataInCsv_and_description(text);

		if (dataInCsv.trim() == '') {
			continue;
		}

		const errors = validator.validateData(dataInCsv);

		if (errors.length > 0) {
			diagnostics.push(createDiagnostic(errors, i, dataInCsv.length - 1));
		}

	}

	formatDiagnostics.set(doc.uri, diagnostics);
}

function createDiagnostic(errors: string[], lineIndex: number, length: number): vscode.Diagnostic {
	const range = new vscode.Range(lineIndex, 0, lineIndex, length);
	const diagnostic = new vscode.Diagnostic(range, errors.join('\n\n'), vscode.DiagnosticSeverity.Error);
	diagnostic.code = EMOJI_MENTION;
	return diagnostic;
}

export function subscribeToDocumentChanges(context: vscode.ExtensionContext, formatDiagnostics: vscode.DiagnosticCollection): void {
	if (vscode.window.activeTextEditor) {
		refreshDiagnostics(vscode.window.activeTextEditor.document, formatDiagnostics);
	}
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				refreshDiagnostics(editor.document, formatDiagnostics);
			}
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, formatDiagnostics))
	);

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(doc => formatDiagnostics.delete(doc.uri))
	);
}
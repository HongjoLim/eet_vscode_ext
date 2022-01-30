import * as vscode from 'vscode';
import * as parser from './tools/instruction_parser';
import * as validator from './tools/instruction_validator';

/** Code that is used to associate diagnostic entries with code actions. */
export const INCORRECT_FORMAT_ERROR = 'incorrect message format';

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
			diagnostics.push(createDiagnostic(INCORRECT_FORMAT_ERROR, i, 0, i, text.length - 1));
			continue;
		}

		let [dataInCsv, description] = parser.splitDataDescription(text);

		if (dataInCsv.trim() == '') {
			continue;
		}

		const errors = validator.validateData(dataInCsv);

		for(let error of errors){
			diagnostics.push(createDiagnostic(error.message, i, error.startChar, i, error.endChar));
		}

	}

	formatDiagnostics.set(doc.uri, diagnostics);
}

function createDiagnostic(error: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number): vscode.Diagnostic {
	const range = new vscode.Range(startLine, startCharacter, endLine, endCharacter);
	const diagnostic = new vscode.Diagnostic(range, error, vscode.DiagnosticSeverity.Error);
	diagnostic.code = INCORRECT_FORMAT_ERROR;
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
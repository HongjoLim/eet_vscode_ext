import * as vscode from 'vscode';

/** Code that is used to associate diagnostic entries with code actions. */
export const EMOJI_MENTION = 'incorrect_message_format';

/** String to detect in the text document. */
const EET_LANGUAGE_CONFIG = require("../syntaxes/eet.tmLanguage.json").patterns[0];

export function refreshDiagnostics(doc: vscode.TextDocument, formatDiagnostics: vscode.DiagnosticCollection): void {
	const diagnostics: vscode.Diagnostic[] = [];

	for (let i = 0; i < doc.lineCount; i++) {
		const lineOfText = doc.lineAt(i);
		if (lineOfText.isEmptyOrWhitespace == false && lineOfText.text.match(EET_LANGUAGE_CONFIG.match) == undefined) {
			diagnostics.push(createDiagnostic(doc, lineOfText, i));
		}
	}

	formatDiagnostics.set(doc.uri, diagnostics);
}

function createDiagnostic(doc: vscode.TextDocument, line: vscode.TextLine, lineIndex: number): vscode.Diagnostic {

    // create range that represents, where in the document the word is
	const range = new vscode.Range(lineIndex, 0, lineIndex, line.text.length);

	const diagnostic = new vscode.Diagnostic(range, "Message not in a correct format.", vscode.DiagnosticSeverity.Error);
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
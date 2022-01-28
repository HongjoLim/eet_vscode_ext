import { version } from 'os';
import * as vscode from 'vscode';
import * as parser from './tools/instruction_parser';
import * as validator from './tools/instruction_validator';
import * as repository from './tools/repository';
import { get_version_number, version_tag_exists } from './tools/version_tag_helper';

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

		const errors = validateData(dataInCsv);

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

function validateData(dataInCsv: string): string[] {
	let items = parser.split_into_items(dataInCsv);
	let errors = [];

	if (!validator.validate_stream_time(items[0])) {
		errors.push("Stream time: must be a numeric value");
	}

	if (!validator.validate_umi(items[1])) {
		errors.push("Unique Message Index: must be a numeric value");
	}

	let instruction_id = parseInt(items[2]) || 0;

	if (!validator.validate_instruction_id(instruction_id)) {
		errors.push("Instruction ID: not supported");
		return errors;
	}

	let version_number = 0;
	let fVersionTagPresent = version_tag_exists(items);
	if (items.length >= 4) {
		if (fVersionTagPresent) {
			version_number = get_version_number(items[3]);
		}
	}

	if (!validator.validate_version_number(instruction_id, version_number)) {
		errors.push("Invalid Version: not supported");
		return errors;
	}

	let instruction = repository.get_instruction_by_id_version_number(instruction_id, version_number);
	let rule = '';
	if (instruction != undefined) {
		for (let i = 0; i < items.length - (fVersionTagPresent ? 4 : 3); i++) {
			rule = repository.get_rules_by_field_name(instruction.fields[i].name) || '';
			validator.validate_data_field(items[i], rule);
		}
	}

	return errors;
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
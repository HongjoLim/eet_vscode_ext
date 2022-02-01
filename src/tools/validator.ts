import * as vscode from 'vscode';
import * as repository from './repository';
import { Parser } from './parser';
const EET_LANGUAGE_CONFIG = require('../syntaxes/eet.tmLanguage.json').patterns[0];
export const NUMERIC_FIELD_RULE = /^\d+$/;
export const VERSION_NUMBER_RULE = /\d+/;
export const VERSION_TAG_RULE = /<ver[ ]?:[ ]?\d+>/i;
const COMMA_DELIMITER_RULE = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;
const DESCRIPTION_DELIMITER_RULE = /\/\/(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;

export interface IValidator<T> {
    setNext(validator: IValidator<T>) : IValidator<T>;
    validate(data: T): IValidator<T> | undefined;
}

abstract class Validator implements IValidator<vscode.TextLine> {
    next: IValidator<vscode.TextLine> | undefined;
    diagnostics: vscode.Diagnostic[] = [];

    setNext(validator: IValidator<vscode.TextLine>) : IValidator<vscode.TextLine>{
        this.next = validator;
        return this.next;
    }

    validate(data: vscode.TextLine): IValidator<vscode.TextLine> | undefined {
        return this.next;
    }
}

class StreamTimeValidator extends Validator {

    validate(data: vscode.TextLine): IValidator<vscode.TextLine> | undefined {
        return this.next;
    }
}

class UmiValidator extends Validator {

    validate(data: vscode.TextLine): IValidator<vscode.TextLine> | undefined {
        return this.next;
    }
}

class InstructionIdValidator extends Validator {

    validate(data: vscode.TextLine): IValidator<vscode.TextLine> | undefined {
        return this.next;
    }
}

class VersionTagValidator extends Validator {

    validate(data: vscode.TextLine): IValidator<vscode.TextLine> | undefined {
        return this.next;
    }
}

class FieldValidator extends Validator {

    validate(data: vscode.TextLine): IValidator<vscode.TextLine> | undefined {
        return this.next;
    }
}

export interface IService <T, U> {
    run(input: T) : U
}

export class InstructionValidationService implements IService <vscode.TextLine, vscode.Diagnostic[]> {

    validator : IValidator<vscode.TextLine>;
    INCORRECT_FORMAT_ERROR : string = 'Message not in correct format';
    parser: Parser;

    constructor(parser: Parser){
        this.parser = parser;
        this.validator = new StreamTimeValidator()
        .setNext(new UmiValidator())
        .setNext(new InstructionIdValidator())
        .setNext(new VersionTagValidator());
    }

    run(data: vscode.TextLine): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];

        const text = data.text;
        const parsed = text.match(EET_LANGUAGE_CONFIG.match);

        if (parsed === undefined) {
            diagnostics.push(this.createDiagnostic(this.INCORRECT_FORMAT_ERROR, data.lineNumber, 0, data.lineNumber, text.length - 1, vscode.DiagnosticSeverity.Error));
            return diagnostics;
        }

        let [dataInCsv, description] = this.parser.splitDataDescription(text);

        if (dataInCsv.trim() == '') {
            return diagnostics;
        }

        const errors = this.validateData(dataInCsv);

        for (let error of errors) {
            diagnostics.push(this.createDiagnostic(error.message, data.lineNumber, error.startChar, data.lineNumber, error.endChar, vscode.DiagnosticSeverity.Error));
        }

        return diagnostics;
    }

    createDiagnostic(message: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number, severity: vscode.DiagnosticSeverity): vscode.Diagnostic {
        const range = new vscode.Range(startLine, startCharacter, endLine, endCharacter);
        return new vscode.Diagnostic(range, message, severity);
    }

    validateRule(value: string, rule: RegExp): boolean {
        return rule.test(value.trim());
    }
    
    validateInstructionId(instruction_id: number): boolean {
        let match = repository.getInstructionsById(instruction_id);
        return match != undefined;
    }
    
    validate_version_number(instruction_id: number, version_number: number): boolean {
        return repository.getInstructionByIdVersionNumber(instruction_id, version_number) != undefined;
    }
    
    validate_number_of_fields(instruction: { fields: [] }, fields: []): boolean {
        return instruction.fields.length == fields.length;
    }

    validateData(dataInCsv: string): { message: string, startChar: number, endChar: number }[] {
        let items = this.parser.splitIntoItems(dataInCsv);
        let errors = [];
        let runningCharCount = 0;

        if (!this.validateRule(items[0], NUMERIC_FIELD_RULE)) {
            errors.push({ message: "Stream time: must be a numeric value", startChar: runningCharCount, endChar: runningCharCount + items[0].length });
        }

        runningCharCount += items[0].length + 1;

        if (!this.validateRule(items[1], NUMERIC_FIELD_RULE)) {
            errors.push({ message: "Unique Message Index: must be a numeric value", startChar: runningCharCount, endChar: runningCharCount + items[1].length });
        }

        runningCharCount += items[1].length + 1;

        let instruction_id = parseInt(items[2]) || 0;

        if (!this.validateInstructionId(instruction_id)) {
            errors.push({ message: "Instruction ID: not supported", startChar: runningCharCount, endChar: runningCharCount + items[2].length });
            return errors;
        }

        runningCharCount += items[2].length + 1;

        let version_number = 0;
        let fVersionTagPresent = false;
        if (items.length >= 4) {
            fVersionTagPresent = this.parser.versionTagExists(items[3]);
            if (fVersionTagPresent) {

                if (!this.validateRule(items[3], VERSION_TAG_RULE)) {
                    errors.push({ message: 'Version tag: Invalid format', startChar: runningCharCount, endChar: runningCharCount + items[3].length });
                } else {
                    version_number = this.parser.getVersionNumber(items[3]);
                }
            }
        }

        if (!this.validate_version_number(instruction_id, version_number)) {
            errors.push({ message: 'Invalid Version: not supported', startChar: runningCharCount, endChar: runningCharCount + items[3].length });
            return errors;
        }

        runningCharCount += items[3].length + 1;

        let instruction = repository.getInstructionByIdVersionNumber(instruction_id, version_number);
        if (instruction != undefined) {
            for (let fieldIndex = 0; fieldIndex < Math.min(instruction.fields.length, items.length - (fVersionTagPresent ? 4 : 3)); fieldIndex++) {
                let rule = repository.getRegexRuleByFieldName(instruction.fields[fieldIndex].name) || '';

                let index = fieldIndex + (fVersionTagPresent ? 4 : 3)
                const field_valid = this.validateRule(items[index], new RegExp(rule));

                if (!field_valid) {
                    const error_message = repository.getErrorMessageByFieldName(instruction.fields[fieldIndex].name);
                    errors.push({ message: `Invalid input for ${instruction.fields[fieldIndex].name}. ${instruction.fields[fieldIndex].name} must be ${error_message}.`, startChar: runningCharCount, endChar: runningCharCount + items[index].length });
                }

                runningCharCount += items[index].length + 1;
            }
        }

        return errors;
    }
}
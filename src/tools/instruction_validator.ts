import * as repository from './repository';
import * as parser from './instruction_parser';
import * as utils from './utils';
export const NUMERIC_FIELD_RULE = /\d+/;
export const VERSION_TAG_RULE = /<ver[ ]?:[ ]?\d+>/i;

export function validate_stream_time(stream_time: string): boolean {
    return NUMERIC_FIELD_RULE.test(stream_time);
}

export function validate_umi(umi: string): boolean {
    return NUMERIC_FIELD_RULE.test(umi);
}

export function validate_instruction_id(instruction_id: number): boolean {
    let match = repository.getInstructionsById(instruction_id);
    return match != undefined;
}

export function validate_version_tag(version_tag: string): boolean {
    return VERSION_TAG_RULE.test(version_tag);
}

export function validate_version_number(instruction_id: number, version_number: number): boolean {
    return repository.getInstructionByIdVersionNumber(instruction_id, version_number) != undefined;
}

export function validate_number_of_fields(instruction: { fields: [] }, fields: []): boolean {
    return instruction.fields.length == fields.length;
}

export function validate_data_field(field: string, rule: string): boolean {
    if (rule != undefined && field != undefined) {
        const regex = new RegExp(rule);
        return regex.test(field.trim());
    }
    return false;
}

export function validateData(dataInCsv: string): {message: string, startChar: number, endChar: number}[] {
    let items = parser.SplitIntoItems(dataInCsv);
    let errors = [];
    let runningWordCount = 0;

    if (!validate_stream_time(items[0])) {
        errors.push({message: "Stream time: must be a numeric value", startChar: runningWordCount, endChar: runningWordCount + items[0].length});
    }

    runningWordCount += items[0].length + 1;

    if (!validate_umi(items[1])) {
        errors.push({message: "Unique Message Index: must be a numeric value", startChar: runningWordCount, endChar: runningWordCount + items[1].length});
    }

    runningWordCount += items[1].length + 1;

    let instruction_id = parseInt(items[2]) || 0;

    if (!validate_instruction_id(instruction_id)) {
        errors.push({message: "Instruction ID: not supported", startChar: runningWordCount, endChar: runningWordCount + items[2].length});
        return errors;
    }

    runningWordCount += items[2].length + 1;

    let version_number = 0;
    let fVersionTagPresent = false;
    if (items.length >= 4) {
        fVersionTagPresent = parser.versionTagExists(items[3]);
        if (fVersionTagPresent) {

            if (!validate_version_tag(items[3])) {
                errors.push({message: 'Version tag: Invalid format', startChar: runningWordCount, endChar: runningWordCount + items[3].length});
            }else{
                version_number = parser.getVersionNumber(items[3]);
            }
        }
    }

    if (!validate_version_number(instruction_id, version_number)) {
        errors.push({message: 'Invalid Version: not supported', startChar: runningWordCount, endChar: runningWordCount + items[3].length});
        return errors;
    }

    runningWordCount += items[3].length + 1;

    let instruction = repository.getInstructionByIdVersionNumber(instruction_id, version_number);
    if (instruction != undefined) {
        for (let fieldIndex = 0; fieldIndex < Math.min(instruction.fields.length, items.length - (fVersionTagPresent ? 4 : 3)); fieldIndex++) {
            let rule = repository.getRegexRuleByFieldName(instruction.fields[fieldIndex].name) || '';

            let index = fieldIndex + (fVersionTagPresent ? 4 : 3)
            const field_valid = validate_data_field(items[index], rule);

            if(!field_valid){
                const error_message = repository.get_erorr_message_by_field_name(instruction.fields[fieldIndex].name);
                const capitalizedFieldName = utils.capitalize(instruction.fields[fieldIndex].name);
                errors.push({message: `Invalid input for ${capitalizedFieldName}. ${capitalizedFieldName} must be ${error_message}.`, startChar: runningWordCount, endChar: runningWordCount + items[index].length});
            }

            runningWordCount += items[index].length + 1;
        }
    }

    return errors;
}
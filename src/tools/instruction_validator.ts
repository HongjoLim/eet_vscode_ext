import * as repository from './repository';
import * as parser from './instruction_parser';

export function validate_stream_time(stream_time: string): boolean {
    const pattern = /\d+/;
    return pattern.test(stream_time);
}

export function validate_umi(umi: string): boolean {
    const pattern = /\d+/;
    return pattern.test(umi);
}

export function validate_instruction_id(instruction_id: number): boolean {
    let match = repository.get_instructions_by_id(instruction_id);
    return match != undefined;
}

export function validate_version_tag(version_tag: string): boolean {
    const pattern = /<ver:[ ]?\d+>/i;
    return pattern.test(version_tag);
}

export function validate_version_number(instruction_id: number, version_number: number): boolean {
    return repository.get_instruction_by_id_version_number(instruction_id, version_number) != undefined;
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

export function validateData(dataInCsv: string): string[] {
    let items = parser.split_into_items(dataInCsv);
    let errors = [];

    if (!validate_stream_time(items[0])) {
        errors.push("Stream time: must be a numeric value");
    }

    if (!validate_umi(items[1])) {
        errors.push("Unique Message Index: must be a numeric value");
    }

    let instruction_id = parseInt(items[2]) || 0;

    if (!validate_instruction_id(instruction_id)) {
        errors.push("Instruction ID: not supported");
        return errors;
    }

    let version_number = 0;
    let fVersionTagPresent = false;
    if (items.length >= 4) {
        fVersionTagPresent = parser.version_tag_exists(items[3]);
        if (fVersionTagPresent) {

            if (!validate_version_tag(items[3])) {
                errors.push('Version tag: Invalid format');
            }else{
                version_number = parser.get_version_number(items[3]);
            }
        }
    }

    if (!validate_version_number(instruction_id, version_number)) {
        errors.push("Invalid Version: not supported");
        return errors;
    }

    let instruction = repository.get_instruction_by_id_version_number(instruction_id, version_number);
    if (instruction != undefined) {
        for (let fieldIndex = 0; fieldIndex < Math.min(instruction.fields.length, items.length - (fVersionTagPresent ? 4 : 3)); fieldIndex++) {
            let rule = repository.get_regex_rule_by_field_name(instruction.fields[fieldIndex].name) || '';

            const field_valid = validate_data_field(items[fieldIndex + (fVersionTagPresent ? 4 : 3)], rule);

            if(!field_valid){
                const error_message = repository.get_erorr_message_by_field_name(instruction.fields[fieldIndex].name);
                errors.push(`Invalid input for ${instruction.fields[fieldIndex].display_name}. ${instruction.fields[fieldIndex].display_name} ${error_message}.`);
            }
        }
    }

    return errors;
}
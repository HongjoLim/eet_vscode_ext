import * as repository from './repository';

export function validate_stream_time(stream_time: string){
    const pattern = /\d+/;
    return pattern.test(stream_time);
}

export function validate_umi(umi: string){
    const pattern = /\d+/;
    return pattern.test(umi);
}

export function validate_instruction_id(instruction_id: number){
    let match = repository.get_instructions_by_id(instruction_id);
    return match != undefined;
}

export function validate_version_number(instruction_id: number, version_number: number){
    return repository.get_instruction_by_id_version_number(instruction_id, version_number);
}

export function validate_number_of_fields(instruction: { fields: [] }, fields: []){
    return instruction.fields.length == fields.length;
}

export function validate_data_field(field: string, rule: string){
    if(rule != undefined && field != undefined){
        const regex = new RegExp(rule);
        return regex.test(field);
    }
    return false;
}
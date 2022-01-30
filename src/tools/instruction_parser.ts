import * as repository from './repository';
import { Instruction } from '../models/instruction';
const EET_LANGUAGE_CONFIG = require("../syntaxes/eet.tmLanguage.json").patterns[0];
const COMMA_DELIMITER_RULE = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;
const DESCRIPTION_DELIMITER_RULE = /\/\/(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
import * as version_tag_helper from './version_tag_helper';

export default function get_tooltip(text: string, positionIndex: number) : string {
    const parsed = text.match(EET_LANGUAGE_CONFIG.match);
    let output = '';

    if (parsed == undefined) {
        return output;
    }

    let [dataInCsv, description] = split_into_dataInCsv_and_description(text);

    if (dataInCsv != '') {
        const instruction = parse_into_instruction(dataInCsv);
        const index = text.substring(0, positionIndex + 1).split(COMMA_DELIMITER_RULE).length - 1;

        switch (index) {
            case 0:
                output = `stream time`;
                break;
            case 1:
                output = `Unique Message Index`;
                break;
            case 2:
                output = `Msg ID: ${instruction?.instruction.instruction_id || ``} - ${instruction?.instruction.name}`;
                break;
            default:
                if(instruction?.version_tag_present && index == 3){
                    output = `Version Number`;
                }
                else{
                    output = `${instruction?.instruction.get_field_displayname_by_index(index - (instruction.version_tag_present ? 4 : 3)) || ``}`;
                }
                break;
        }
    }

    return output;
}

export function parse_into_instruction(dataInCsv: string): {instruction: Instruction; version_tag_present: boolean } | undefined {
    const items = split_into_items(dataInCsv);

    if (items.length < 3) {
        return undefined;
    }

    const stream_time = parseInt(items[0]);
    const umi = parseInt(items[1]);
    const instruction_id = parseInt(items[2]);
    let version = 0;
    let fVersionTagPresent = false;

    if(items.length >= 4){

        fVersionTagPresent = version_tag_helper.version_tag_exists(items[3]);

        if (fVersionTagPresent) {
            version = version_tag_helper.get_version_number(items[3]);
        }
    }

    const instruction = repository.get_instruction_by_id_version_number(instruction_id, version);

    if (instruction != undefined) {
        return {instruction: new Instruction(stream_time, umi, instruction_id, instruction.name, version, instruction.fields), version_tag_present: fVersionTagPresent};
    }

    return undefined;
}

export function split_into_items(dataInCsv: string) : string[] {
    return dataInCsv.split(COMMA_DELIMITER_RULE) || [];
}

export function split_into_dataInCsv_and_description(line: string) : string[] {
    return line.split(DESCRIPTION_DELIMITER_RULE);
}
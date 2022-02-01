import * as repository from './repository';
import { Instruction } from '../models/instruction';
import * as validator from './instruction_validator';

const EET_LANGUAGE_CONFIG = require("../syntaxes/eet.tmLanguage.json").patterns[0];
const COMMA_DELIMITER_RULE = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;
const DESCRIPTION_DELIMITER_RULE = /\/\/(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;

export default function getToolTip(text: string, positionIndex: number) : string {
    const parsed = text.toLowerCase().match(EET_LANGUAGE_CONFIG.match);
    let output = '';

    if (parsed == undefined) {
        return output;
    }

    let [dataInCsv, description] = splitDataDescription(text);

    if (dataInCsv != '') {
        const fVersionTagPresent = parsed[5] != undefined;
        const instruction = parseToInstruction(dataInCsv);
        const index = text.substring(0, positionIndex + 1).split(COMMA_DELIMITER_RULE).length - 1;

        switch (index) {
            case 0:
            case 1:
                output = EET_LANGUAGE_CONFIG.captures[index].tooltip_name;
                break;
            case 2:
                output = `Msg ID: ${instruction?.instruction.instruction_id || ``} - ${instruction?.instruction.name}`;
                break;
            default:
                if(fVersionTagPresent && index == 3){
                    output = `Version Number`;
                }
                else{
                    output = `${instruction?.instruction.getFieldDisplayNameByIndex(index - (fVersionTagPresent ? 4 : 3)) || ``}`;
                }
                break;
        }
    }

    return output;
}

export function parseToInstruction(dataInCsv: string): {instruction: Instruction; version_tag_present: boolean } | undefined {
    const items = SplitIntoItems(dataInCsv);

    if (items.length < 3) {
        return undefined;
    }

    const stream_time = parseInt(items[0]);
    const umi = parseInt(items[1]);
    const instruction_id = parseInt(items[2]);
    let version = 0;
    let fVersionTagPresent = false;

    if(items.length >= 4){

        fVersionTagPresent = versionTagExists(items[3]);

        if (fVersionTagPresent) {
            version = getVersionNumber(items[3]);
        }
    }

    let instruction = repository.getInstructionByIdVersionNumber(instruction_id, version);

    if (instruction != undefined) {
        return {instruction: new Instruction(stream_time, umi, instruction_id, instruction.name, version, instruction.fields), version_tag_present: fVersionTagPresent};
    } else{
        instruction = repository.getInstructionsById(instruction_id);
        return {instruction: new Instruction(stream_time, umi, instruction_id, instruction?.name || '', version, []), version_tag_present: fVersionTagPresent};
    }
}

export function SplitIntoItems(dataInCsv: string) : string[] {
    return dataInCsv.split(COMMA_DELIMITER_RULE) || [];
}

export function splitDataDescription(line: string) : string[] {
    return line.split(DESCRIPTION_DELIMITER_RULE);
}

export function getVersionNumber(version_tag: string){
    let version_number = version_tag.match(validator.NUMERIC_FIELD_RULE)?.shift() || '0';
    return parseInt(version_number);
}

export function versionTagExists(item: string){
    return item.match(validator.VERSION_TAG_RULE) != undefined;
}
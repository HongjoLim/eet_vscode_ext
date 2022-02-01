import { InstructionBuilder } from '../models/instruction';
import * as utils from './utils';

const EET_LANGUAGE_CONFIG = require('../../syntaxes/eet.tmLanguage.json').patterns[0];
const COMMA_DELIMITER_RULE = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;

export default function getToolTip(text: string, positionIndex: number) : string {
    const parsed = text.toLowerCase().match(EET_LANGUAGE_CONFIG.match);
    let output = '';

    if (parsed == undefined) {
        return output;
    }

    let [dataInCsv, description] = splitDataDescription(text);

    if (dataInCsv != '') {
        const fVersionTagPresent = parsed[5] != undefined;
        const instruction = new InstructionBuilder().build();// parseToInstruction(dataInCsv);
        const index = text.substring(0, positionIndex + 1).split(COMMA_DELIMITER_RULE).length - 1;

        switch (index) {
            case 0:
            case 1:
                output = EET_LANGUAGE_CONFIG.captures[index + 2].tooltip_name;
                break;
            case 2:
                output = `Msg ID: ${instruction.instruction_id || ``} - ${instruction.name}`;
                break;
            default:
                if(fVersionTagPresent && index == 3){
                    output = `Version Number`;
                }
                else{
                    const filedDisplayName = utils.capitalize(instruction.fields[index - (fVersionTagPresent ? 4 : 3)].name);
                    output = `${filedDisplayName}`;
                }
                break;
        }
    }

    return output;
}
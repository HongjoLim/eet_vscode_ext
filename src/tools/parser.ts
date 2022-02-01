import { InstructionBuilder } from '../models/models';
import * as utils from '../tools/utils';

const EET_LANGUAGE_CONFIG = require("../syntaxes/eet.tmLanguage.json").patterns[0];
const COMMA_DELIMITER_RULE = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;
const DESCRIPTION_DELIMITER_RULE = /\/\/(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
const VERSION_NUMBER_RULE = /\d+/;
const VERSION_TAG_RULE = /<ver[ ]?:[ ]?\d+>/i;

export class Parser {

    getToolTip(text: string, positionIndex: number): string {
        const parsed = text.match(EET_LANGUAGE_CONFIG.match);
        let output = '';

        if (parsed == undefined) {
            return output;
        }

        const [dataInCsv, description] = this.splitDataDescription(text);
        const items = this.splitIntoItems(dataInCsv);

        if (dataInCsv != '') {
            const instruction = new InstructionBuilder(items).build();// parseToInstruction(dataInCsv);
            const index = text.substring(0, positionIndex + 1).split(COMMA_DELIMITER_RULE).length - 1;

            switch (index) {
                case 0:
                    output = `stream time`;
                    break;
                case 1:
                    output = `Unique Message Index`;
                    break;
                case 2:
                    output = `Msg ID: ${instruction.instruction_id || ``} - ${instruction.name}`;
                    break;
                default:

                    const fVersionTagPresent = this.versionTagExists(items[3]);
                    if (fVersionTagPresent && index == 3) {
                        output = `Version Number`;
                    }
                    else {
                        output = `${utils.capitalize(instruction.fields[fVersionTagPresent ? 4 : 3].name) || ``}`;
                    }
                    break;
            }
        }

        return output;
    }

    splitIntoItems(dataInCsv: string): string[] {
        return dataInCsv.split(COMMA_DELIMITER_RULE) || [];
    }
    
    splitDataDescription(line: string): string[] {
        return line.split(DESCRIPTION_DELIMITER_RULE);
    }
    
    getVersionNumber(version_tag: string) {
        let version_number = version_tag.match(VERSION_NUMBER_RULE)?.shift() || '0';
        return parseInt(version_number);
    }
    
    versionTagExists(item: string) {
        return item.match(VERSION_TAG_RULE) != undefined;
    }
}
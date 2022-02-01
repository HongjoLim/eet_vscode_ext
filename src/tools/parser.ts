import { InstructionBuilder } from '../models/models';
import * as utils from '../tools/utils';

const EET_LANGUAGE_CONFIG = require("../syntaxes/eet.tmLanguage.json").patterns[0];
const COMMA_DELIMITER_RULE = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;
const DESCRIPTION_DELIMITER_RULE = /\/\/(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
const VERSION_NUMBER_RULE = /\d+/;

export class Parser {

    getToolTip(text: string, positionIndex: number): string {
        const parsed = text.toLowerCase().match(EET_LANGUAGE_CONFIG.match);
        let output = '';

        if (parsed == undefined) {
            return output;
        }

        let [dataInCsv, description] = this.splitDataDescription(text);

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
                    if (fVersionTagPresent && index == 3) {
                        output = `Version Number`;
                    }
                    else {
                        const filedDisplayName = utils.capitalize(instruction.fields[index - (fVersionTagPresent ? 4 : 3)].name);
                        output = `${filedDisplayName}`;
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
}
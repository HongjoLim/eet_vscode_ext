import * as repository from './repository';
const EET_LANGUAGE_CONFIG = require("../syntaxes/eet.tmLanguage.json").patterns[0];
const COMMA_DELIMITER_RULE = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;
const DESCRIPTION_DELIMITER_RULE = /\/\/(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
import * as version_tag_helper from './version_tag_helper';

export default function get_tooltip(text: string, positionIndex: number) {
    let parsed = text.match(EET_LANGUAGE_CONFIG.match);
    let output = '';

    if (parsed == undefined) {
        return output;
    }

    let runningWordCharCount = 0;
    for (let i = 1; i <= Math.min(parsed.length, Object.keys(EET_LANGUAGE_CONFIG.captures).length); i++) {
        //capture group count is the minimum of the number of captures in the regex, or the number of captures defined in the language spec
        if (parsed[i] != null) {

            runningWordCharCount += parsed[i].length;

            if (positionIndex < runningWordCharCount && i <= 2) {
                return EET_LANGUAGE_CONFIG.captures[i].tooltip_name;
            }
            else if (i == 3) {
                let instruction_id = parseInt(parsed[3]) || 0;
                return `: ${instruction_id} ${repository.get_instructions_by_id(instruction_id)?.name}`;
            }
            else{
                break;
            }
        }
    }
    
    const items = text.split(COMMA_DELIMITER_RULE);
    let fVersionTagPresent = version_tag_helper.version_tag_exists(items);

    return output;
}

export function split_into_items(dataInCsv: string){
    return dataInCsv.split(COMMA_DELIMITER_RULE) || [];
}

export function split_into_dataInCsv_and_description(line: string){
    return line.split(DESCRIPTION_DELIMITER_RULE);
}
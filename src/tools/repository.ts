import instructions = require('../resources/instruction_definitions.json');
import instruction_types = require('../resources/instruction_types.json');
import field_rules = require('../resources/field_declarations.json');

export const INSTRUCTION_TYPES = instruction_types;
export const DECLARATIONS = instructions.instructions;
export const FILED_RULES = field_rules;

export function get_all_instruction_types(){
  return INSTRUCTION_TYPES.types;
}

export function get_instructions_by_id(instruction_id: number) {
  return DECLARATIONS.find(x => x.id == instruction_id);
}

export function get_instruction_by_id_version_number(instruction_id: number, version_number: number) {
  return DECLARATIONS.find(x => x.id == instruction_id && x.version == version_number);
}

export function get_field_name_by_index(instruction: { fields: [{ name: string }] }, field_index: number) : string {
  const match = instruction.fields[field_index].name;
  if (match !== undefined) {
    return match;
  }

  return '';
}

export function get_regex_rule_by_field_name(field_name: string) {
  if(field_name != undefined){
    const field = FILED_RULES.fields.find(x => x.name == field_name);
    if(field != undefined){
      return field.regex;
    }
  }
}

export function get_erorr_message_by_field_name(field_name: string){
  if(field_name != undefined){
    const field = FILED_RULES.fields.find(x => x.name == field_name);
    if(field != undefined){
      return field.error_message;
    }
  }
}
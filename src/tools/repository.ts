import instructions = require('../instruction_definitions.json');
import field_rules = require('../field_declarations.json');
export const DECLARATIONS = instructions.instructions;
export const FILED_RULES = field_rules;

export function get_instructions_by_id(instruction_id: number) {
  return DECLARATIONS.find(x => x.id == instruction_id);
}

export function get_instruction_by_id_version_number(instruction_id: number, version_number: number) {
  return DECLARATIONS.find(x => x.id == instruction_id && x.version == version_number);
}

export function get_field_name_by_index(instruction: { fields: [{ name: string }] }, field_index: number) {
  const match = instruction.fields[field_index].name;
  if (match !== undefined) {
    return match;
  }

  return '';
}

export function get_rules_by_field_name(field_name: string) {
  if(field_name != undefined){
    const field = FILED_RULES.fields.find(x => x.name == field_name);
    if(field != undefined){
      return field.rule;
    }
  }
}
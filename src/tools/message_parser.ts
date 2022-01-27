import instructions = require('../300.json');
const DECLARATIONS = instructions.instructions;

function create_instruction_with_default_values(instrcution_id: number, version_number: number){
    let match = get_instruction_by_id_and_version_number(instrcution_id, version_number);
    let default_values = match?.fields.map((item) => {
        return item?.default;
      }).join(', ');
    return default_values;
}

function get_version_number(version_tag: string){
    let version_number = version_tag.match(/\d+/)?.shift() || '0';
    return parseInt(version_number);
}

function version_tag_exists(items: string[]){
    let version_tag_exists = false;

    if(items.length >= 4){
        let trimmed_text = items[3].trim();
        version_tag_exists = trimmed_text.startsWith("<") && trimmed_text.endsWith(">"); 
    }

    return version_tag_exists;
}

function get_instruction_by_id_and_version_number(instruction_id: number, version_number: number){
    const match = DECLARATIONS.find(x => x.id == instruction_id && x.version == version_number);
    return match;
}

function get_field_name_by_index(instruction_id: number, version_number: number, field_index: number){
  let match = get_instruction_by_id_and_version_number(instruction_id, version_number);
  if(match !== undefined){
      let key = match.fields[field_index].name;
      return key;
  }
  
  return '';
}
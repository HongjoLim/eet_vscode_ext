import * as repository from './repository';

export default function create_instruction_with_default_values(fields: { name: string, default: number }[]){
    let default_values = fields.map((item) => {
        return item?.default;
      }).join(', ');
    return default_values;
}
export function create_instruction_with_default_values(fields: { name: string, default: string }[]){
    let default_values = fields.map((item) => {
        return item?.default;
      }).join(', ');
    return default_values;
}

export function capitalize(input: string) : string{
  const capitalized = input.split('_').map(x => {return x.charAt(0).toUpperCase() + x.slice(1);});
  return capitalized.join(' ');
}
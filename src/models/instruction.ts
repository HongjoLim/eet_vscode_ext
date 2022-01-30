export class Instruction{

    stream_time: number;
    umi: number;
    instruction_id: number;
    name: string;
    version: number;
    fields: {name:string; default:string}[];

    constructor(stream_time: number, umi: number, instruction_id: number, name: string, version: number, fields: {name:string; default:string}[]){
        this.stream_time = stream_time;
        this.umi = umi;
        this.instruction_id = instruction_id;
        this.name = name;
        this.version = version;
        this.fields = fields;
    }

    getFieldDisplayNameByIndex(field_index: number) : string{
        const fieldName = this.fields[field_index].name;
        const capitalized = fieldName.split('_').map(x => {return x.charAt(0).toUpperCase() + x.slice(1);});
        return capitalized.join(' ');
    }
}
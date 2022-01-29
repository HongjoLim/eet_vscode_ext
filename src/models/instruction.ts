export class Instruction{

    stream_time: number;
    umi: number;
    instruction_id: number;
    name: string;
    version: number;
    fields: {name:string; display_name: string; default:string}[];

    constructor(stream_time: number, umi: number, instruction_id: number, name: string, version: number, fields: {name:string; display_name: string; default:string}[]){
        this.stream_time = stream_time;
        this.umi = umi;
        this.instruction_id = instruction_id;
        this.name = name;
        this.version = version;
        this.fields = fields;
    }

    get_field_displayname_by_index(field_index: number) : string{
        return this.fields[field_index].display_name;
    }
}
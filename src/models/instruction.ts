export class Instruction {
    instruction_id: number;
    name: string | undefined;
    version: number;
    fields: { name: string; default: string }[];

    constructor(builder: InstructionBuilder) {
        this.instruction_id = builder.instruction_id;
        this.name = builder.name;
        this.version = builder.version;
        this.fields = builder.fields;
    }

    getFieldDisplayNameByIndex(field_index: number): string {
        const fieldName = this.fields[field_index].name;
        const capitalized = fieldName.split('_').map(x => { return x.charAt(0).toUpperCase() + x.slice(1); });
        return capitalized.join(' ');
    }
}

export class FieldRule {
    name: string;
    regex: RegExp;
    errorMessage: string = '';

    constructor(builder: FieldRuleBuilder) {
        this.name = builder.name;
        this.regex = builder.regex;
        this.errorMessage = builder.errorMessage;
    }
}

export interface Builder<T> {
    build(): T;
}

export class InstructionBuilder implements Builder<Instruction>{
    instruction_id: number = 0;
    name: string | undefined;
    version: number = 0;
    fields: { name: string; default: string }[] = [];

    constructor(items: string[]) {
        const instruction_id = parseInt(items[0]);
        let version = 0;
        let fVersionTagPresent = false;

        if (items.length >= 2) {

            fVersionTagPresent = this.versionTagExists(items[1]);

            if (fVersionTagPresent) {
                version = this.getVersionNumber(items[1]);
            }
        }
    }

    build(): Instruction {
        const instruction = new Instruction(this);
        instruction.instruction_id = this.instruction_id;
        instruction.name = this.name;
        instruction.version = this.version;
        instruction.fields = this.fields;
        return instruction;
    }

    splitIntoItems(dataInCsv: string): string[] {
        return dataInCsv.split(COMMA_DELIMITER_RULE) || [];
    }

    splitDataDescription(line: string): string[] {
        return line.split(DESCRIPTION_DELIMITER_RULE);
    }

    getVersionNumber(version_tag: string) {
        let version_number = version_tag.match(validator.VERSION_NUMBER_RULE)?.shift() || '0';
        return parseInt(version_number);
    }

    versionTagExists(item: string) {
        return item.match(validator.VERSION_TAG_RULE) != undefined;
    }
}

export class FieldRuleBuilder implements Builder<FieldRule>{
    name: string;
    regex: RegExp;
    errorMessage: string = '';

    constructor() {
        this.name = '';
        this.regex = new RegExp('');
       
    }

    build(): FieldRule {
        const fieldRule = new FieldRule(this);
        fieldRule.name = this.name;
        fieldRule.regex = this.regex;
        fieldRule.errorMessage = this.errorMessage;
        return fieldRule;
    }
}
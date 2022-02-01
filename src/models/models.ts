export class Instruction {
    instruction_id: number;
    name: string | undefined;
    version: number;
    fields: Field[];

    constructor(builder: InstructionBuilder) {
        this.instruction_id = builder.instruction_id;
        this.name = builder.name;
        this.version = builder.version;
        this.fields = builder.fields;
    }
}

export class Field {
    name: string;
    value: string;

    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
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
    fields: Field[] = [];

    constructor(items: string[]) {
        const instruction_id = parseInt(items[0]);
        this.instruction_id = instruction_id;
        let version = 0;
        let fVersionTagPresent = false;

        if (items.length >= 2) {
            if (fVersionTagPresent) {
                version = this.getVersionNumber(items[1]);
            }
        }

        // To do: assign fields
    }

    build(): Instruction {
        const instruction = new Instruction(this);
        instruction.instruction_id = this.instruction_id;
        instruction.name = this.name;
        instruction.version = this.version;
        instruction.fields = this.fields;
        return instruction;
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
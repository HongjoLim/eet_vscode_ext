import DECLARATIONS = require('../resources/instruction_definitions.json');
import INSTRUCTION_TYPES = require('../resources/instruction_types.json');
import FILED_RULES = require('../resources/field_rules.json');
import { Instruction, FieldRule } from '../models/models';

export interface IRead<T> {
  find(item: T): Promise<T[]>;
  findOne(id: string): Promise<T>;
}

export abstract class Repository<T> implements IRead<T> {
  /*
  public readonly _collection: Collection;
  constructor(db: Db, collectionName: string) {
    this._collection = db.collection(collectionName);
  }
  */

  public readonly entries: T[] | undefined;

  find(item: T): Promise<T[]> {
      throw new Error("Method not implemented.");
  }
  findOne(id: string): Promise<T>{
    throw new Error("Method not implemented.");
  }
}

export class InstructionRepository extends Repository<Instruction>{

}

export class FieldRuleRepository extends Repository<FieldRule>{

}

export function getAllInstructions(){
  return DECLARATIONS.instructions;
}

export function getAllInstructionTypes(){
  return INSTRUCTION_TYPES.types;
}

export function getInstructionsById(instruction_id: number) {
  return DECLARATIONS.instructions.find(x => x.id == instruction_id);
}

export function getInstructionByIdVersionNumber(instruction_id: number, version_number: number) {
  return DECLARATIONS.instructions.find(x => x.id == instruction_id && x.version == version_number);
}

export function get_field_name_by_index(instruction: { fields: [{ name: string }] }, field_index: number) : string {
  const match = instruction.fields[field_index].name;
  if (match !== undefined) {
    return match;
  }

  return '';
}

export function getRegexRuleByFieldName(field_name: string) {
  if(field_name != undefined){
    const field = FILED_RULES.fields.find(x => x.name == field_name);
    if(field != undefined){
      return field.regex;
    }
  }
}

export function getErrorMessageByFieldName(field_name: string){
  if(field_name != undefined){
    const field = FILED_RULES.fields.find(x => x.name == field_name);
    if(field != undefined){
      return field.error_message;
    }
  }
}
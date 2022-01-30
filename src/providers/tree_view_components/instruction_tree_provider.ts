import * as vscode from 'vscode';
import * as repository from '../../tools/repository';

export class InstructionTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  constructor() { }

  getTreeItem(element: InstructionTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: InstructionTreeItem): Thenable<vscode.TreeItem[]> {
      return Promise.resolve([]);
  }

  private get_nodes(instruction_id:number): vscode.TreeItem[] {
    const instruction = repository.get_instructions_by_id(instruction_id);

    const to_instruction_node = (id: string, label: string): InstructionTreeItem => {
      return new InstructionTreeItem(
        id,
        label,
        vscode.TreeItemCollapsibleState.Collapsed
      );
    };

    //const nodes = types.map(type => to_instruction_node(type.));
    //return nodes;
    return [];
  }
}

class InstructionTreeItem extends vscode.TreeItem {
  constructor(
    public readonly id: string,
    label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.id}-${this.label}`;
  }
  /*
    iconPath = {
      light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
      dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    };*/
}
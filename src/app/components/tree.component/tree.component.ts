import { NestedTreeControl } from '@angular/cdk/tree';
import { EventEmitter, Component, Injectable, Input, Output, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { BehaviorSubject, of as observableOf } from 'rxjs';
import { Skill } from '../../models/skill';
import { SkillLevel } from '../../lists/skill.level';
/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `Skill` with nested
 * structure.
 */

@Injectable()
export class FileDatabase implements AfterViewInit {
  skillData: Skill[];
  dataChange = new BehaviorSubject<Skill[]>([]);
  
  private _DATA: any;
  
  get data(): Skill[] { return this.dataChange.value; }
  
  set data(skills: Skill[]) { this.skillData = skills; }

  constructor() {
  }

  ngAfterViewInit(): void {
    if(this.skillData) this.initialize();
  }

  initialize(): void {
    // if(!this.skillData) this.skillData = new Array<Skill>();
    // Parse the string to json object.
    // Build the tree nodes from Json object. The result is a list of `Skill` with nested
    //     file node as children.
    this._DATA = this.buildFileTree(this.skillData, 0); //JSON.parse(TREE_DATA)
    // Notify the change.
    this.dataChange.next(this._DATA);
  }

  updateTree(): void {
    if(this.skillData) this.initialize();
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `Skill`.
   */
  buildFileTree(obj: object, level: number): Skill[] {
    return Object.keys(obj).reduce<Skill[]>((accumulator, key) => {
      let value = obj[key];
      
      if (value && typeof value === 'object') {
        let node = new Skill();
        node.name = value.name;
        node.experience = value.experience;
        node.level = value.level;
        node.children = this.buildFileTree(value.children, level + 1);
        return accumulator.concat(node);
      }

      return accumulator;
    }, []);
  }
}

/**
 * @title Tree with nested nodes
 */
@Component({
  selector: 'app-tree',
  templateUrl: 'tree.component.html',
  styleUrls: ['tree.component.scss'],
  providers: [FileDatabase]
})

export class TreeComponent implements AfterViewInit {
  @Input() skills: Array<Skill>;
  @Input() edit: boolean = false;
  @Output() updatedSkills: EventEmitter<Array<Skill>>;

  levels(): Array<String> {
    const levels = Object.keys(SkillLevel);
    return levels.slice(levels.length/2);
  };
  
  nestedTreeControl: NestedTreeControl<Skill>;
  nestedDataSource: MatTreeNestedDataSource<Skill>;

  constructor(private database: FileDatabase, private cd: ChangeDetectorRef) {
    this.updatedSkills = new EventEmitter<Array<Skill>>();
    this.nestedTreeControl = new NestedTreeControl<Skill>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
  }

  ngAfterViewInit(): void {
    if(!this.skills) this.skills = new Array<Skill>();
    this.database.data = this.skills;
    this.database.initialize();
    this.database.dataChange.subscribe(data => this.nestedDataSource.data = data);
    this.cd.detectChanges();
  }

  hasNestedChild = (_: number, nodeData: Skill) => nodeData.children.length !== 0;

  private _getChildren = (node: Skill) => observableOf(node.children);

  addNode(parent: Skill, newNodeName: any, newNodeLevel: any): void {
    let found = null;
    if(!newNodeLevel) newNodeLevel = { value: 'BASIC '};
    this.skills.forEach((s) => {
      if(!found) found = this.findNode(s, parent.name);
    });

    if(found) found.skill.children.push(new Skill(newNodeName.value, newNodeLevel.value, 0))
    this.database.updateTree();
  }

  /**
   * 
   * @param node 
   */
  removeNode(node: Skill): void {
    let found = null;
    let foundIdx = null;
    this.skills.forEach((s, idx) => {
      if(!found) { 
        found = this.findNode(s, node.name, 0);
        foundIdx = idx;
      }
    });

    let parentNode = null
    
    if(found.level > 0) {
      this.skills.forEach((s, idx) => {
        if(!parentNode) {
          parentNode = this.getParentOfChild(s, node, 0, found.level);
        }
      });

      parentNode.children.splice(parentNode.children.indexOf(node), 1);
    }
    if(found.level === 0 && foundIdx !== null) {
      this.skills.splice(foundIdx, 1);
    }

    this.database.updateTree();
  }

  /**
   * 
   * @param currentNode 
   * @param targetNode 
   * @param currentLevel 
   * @param targetLevel 
   */
  getParentOfChild(currentNode: Skill, targetNode: Skill, currentLevel: number, targetLevel: number): Skill {
    if((currentLevel + 1) === targetLevel && currentNode.children.filter((s: Skill) => {return s.name === targetNode.name;}).length > 0) return currentNode;

    for(let i = 0; i < currentNode.children.length; i++) {
      let currentChild = currentNode.children[i];
      let result = this.getParentOfChild(currentChild, targetNode, currentLevel+1, targetLevel);
      if(result) return result;
    }

    return null;
  }

  findNode(currentNode: Skill, name: string, level?: number): { skill: Skill, level: number} {
    if(currentNode.name === name) return { skill: currentNode, level: level };
    // FOR FUTURE REFERENCE USE FOR LOOP INSTEAD OF FOREACH
    // WHEN DEALING WITH RECURSION 
    for(let i = 0; i < currentNode.children.length; i++) {
      let currentChild = currentNode.children[i];
      let result = this.findNode(currentChild, name, level+1);
      if(result) return result;
    }

    return null;
  }

  findSelected(node: any): string {
    let found = null;

    this.skills.forEach((s) => {
      if(!found) found = this.findNode(s, node.name);
    });
    if(found) return found.skill.level;

  }
  addCategory(nodeName: any): void {
    this.skills.push(new Skill(nodeName.value));
    this.database.data = this.skills;
    nodeName.value = '';
    this.database.updateTree();
  }

  saveSkills(): void {
    this.skills = this.database.data;
    this.updatedSkills.emit(this.skills);
  }
}
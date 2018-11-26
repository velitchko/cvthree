export class Skill {
  name: string;
  level: string;
  experience: number;
  size?: number; // optional only set at leaf nodes
  children: Array<Skill>; // nested skills
  people?: Array<string>;
  names?: Array<string>; // alternative names used in meta tree construction
  constructor(name?: string, level?: string, experience?: number) {
    this.name = name || '';
    this.level = level || '';
    this.experience = experience || 0;
    this.children = new Array<Skill>();
    this.people = new Array<string>();
    this.names = new Array<string>();
  }
}

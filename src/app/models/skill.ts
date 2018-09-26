export class Skill {
  name: string;
  level: string;
  experience: number;
  size?: number; // optional only set at leaf nodes
  children: Array<Skill>; // nested skills

  constructor(name?: string, level?: string, experience?: number) {
    this.name = name || '';
    this.level = level || '';
    this.experience = experience || 0;
    this.children = new Array<Skill>();
  }
}

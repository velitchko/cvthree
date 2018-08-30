export class Skill {
  name: string;
  level: string;
  size?: number; // optional only set at leaf nodes
  children: Array<Skill>; // nested skills

  constructor() {
    this.children = new Array<Skill>();
  }
}

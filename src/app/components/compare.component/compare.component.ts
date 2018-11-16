import { Component, ChangeDetectorRef } from '@angular/core';
import { Resume } from '../../models/resume';
import { Skill } from '../../models/skill';
import { Work } from '../../models/work';
import { SkillLevel } from '../../lists/skill.level';
import { CompareService } from '../../services/compare.service';
import { UtilServices } from 'src/app/services/util.service';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['compare.component.scss']
})

export class CompareComponent {
  skillData: Array<any>;
  timelineData: Array<any>;
  timelineGroups: Array<any>;
  treeChartData: Skill;
  mapData: Array<any>;
  skillMap: Map<string, Array<any>>;
  resumes: Array<Resume>;
  matchedSkills: number;

  constructor(
    private cs: CompareService,
    private cd: ChangeDetectorRef,
    private util: UtilServices
  ) {
    this.resumes = this.cs.getResumes() || new Array<Resume>();
    this.skillData = new Array<any>();
    this.treeChartData = new Skill();
    this.treeChartData.name = 'Skills'; //root
    this.timelineData = new Array<any>();
    this.timelineGroups = new Array<any>();
    this.mapData = new Array<any>();
    this.skillMap = new Map<string, Array<any>>();

    // go through resumes and find matching skills 
    this.getSkillData();
    this.getTreeChartData();
    this.getTimelineData();
    this.getMapData();
    // skill, person, skillLevel, minSkillLevel, maxSkillLevel
  }

  calculateAvgJobDuration(resume: Resume): number {
    let avg = 0;
    resume.work.forEach((w: Work) => {
      avg += this.util.getDateDifference(w.startDate, w.endDate);
    });
    return Math.ceil((avg / resume.work.length) * 100) / 100;
  }

  getNumberOfLocations(resume: Resume): number {
    let locations = new Set();
    resume.work.forEach((w: Work) => {
      locations.add(w.location.city);
    });
    return locations.size;
  }

  getNumberOfLanguages(resume: Resume): number {
    return resume.languages.length;
  }

  getLevelAsNumber(level: string): number {
    return (parseInt(SkillLevel[level]));
  }

  getSanitizedPicture(picture: string): any {
    return this.util.getSanitizedPicture(picture);
  }

  scrollTo(element: any): void {
    element.scrollIntoView({ behavior: "smooth" });
  }

  getColor(id: string): string {
    return this.cs.getColorForResume(id);
  }

  toggleVisibility(idx: number): void {
    this.resumes[idx].highlighted = !this.resumes[idx].highlighted;
    if (this.resumes[idx].highlighted) {
      this.cs.setResumeID(this.resumes[idx].id);
    } else {
      this.cs.setResumeID('none');
    }
  }

  getAge(bday: Date): number {
    return this.util.getAge(bday);
  }

  getTimelineTitle(item: any, i: number): string {
    return `
      <div class="timeline-content timeline-color-${i}">
        <p class="timeline-title">
          ${item.position} @ ${item.company}
        </p>
      </div>
    `;
  }

  getTimelineContent(item: any): string {
    // <i class="timeline-icon fa ' + icon +'"></i>' + events[j].title,?
    return `${item.position} @ ${item.company}`;
  }

  getTimelineData(): void {
    let identifier = 0;
    this.timelineGroups = new Array<any>();
    this.timelineData = new Array<any>();
    this.resumes.forEach((r: Resume, idx: number) => {
      // WORK
      let initials = this.util.getInitials(r.firstName, r.lastName);
      let group = {
        id: idx,
        content: '<img src="' + r.profilePicture + '" class="timeline-profile-pic timeline-profile-pic-color-' + idx + '"><div class="timeline-profile-initials timeline-pic-color-' + idx + '"><p class="upper-case">' + initials + '</p></div>'
      };
      let type = 'range';
      this.timelineGroups.push(group);
      r.work.forEach((w: any, jdx: number) => {
        w.identifier = identifier;
        type = w.endDate ? 'range' : 'point';
        this.timelineData.push({
          id: identifier,
          item: jdx,
          group: idx,
          category: 'WORK',
          resumeID: r.id,
          location: `${w.location.address ? w.location.address : ''} ${w.location.city ? w.location.city : ''} ${w.location.country ? w.location.country : ''}`,
          start: w.startDate,
          end: w.endDate,
          type: type,
          title: this.getTimelineTitle(w, idx),
          content: this.getTimelineContent(w),
          className: `timeline-color-${idx}`
        });
        identifier++;
      });

      // EDUCATION
      r.education.forEach((e: any, jdx: number) => {
        e.identifier = identifier;
        type = e.endDate ? 'range' : 'point';
        this.timelineData.push({
          id: identifier,
          item: jdx,
          group: idx,
          category: 'EDUCATION',
          resumeID: r.id,
          location: e.location,
          start: e.startDate,
          end: e.endDate,
          type: type,
          title: this.getTimelineTitle(e, idx),
          content: this.getTimelineContent(e),
          className: `timeline-color-${idx}`
        });
        identifier++;
      });

      // PROJECTS
      r.projects.forEach((e: any, jdx: number) => {
        e.identifier = identifier;
        type = e.endDate ? 'range' : 'point';
        this.timelineData.push({
          id: identifier,
          item: jdx,
          group: idx,
          category: 'PROJECT',
          resumeID: r.id,
          location: null, // should we add a location?
          start: e.startDate,
          end: e.endDate,
          type: type,
          title: this.getTimelineTitle(e, idx),
          content: this.getTimelineContent(e),
          className: `timeline-color-${idx}`
        });
        identifier++;
      });

      // PUBLICATIONS
      r.publications.forEach((e: any, jdx: number) => {
        e.identifier = identifier;
        this.timelineData.push({
          id: identifier,
          item: jdx,
          group: idx,
          category: 'PUBLICATION',
          resumeID: r.id,
          location: null,
          startDate: e.date,
          endDate: null,
          type: 'point',
          title: this.getTimelineTitle(e, idx),
          content: this.getTimelineContent(e),
          className: `timeline-color-${idx}`
        });
        identifier++;
      });

      // AWARDS/CERTIFICATES
      r.awards.forEach((e: any, jdx: number) => {
        e.identifier = identifier;
        this.timelineData.push({
          id: identifier,
          item: jdx,
          group: idx,
          category: 'CERTIFICATE/AWARD',
          resumeID: r.id,
          location: null,
          startDate: e.date,
          endDate: null,
          type: 'point',
          title: this.getTimelineTitle(e, idx),
          content: this.getTimelineContent(e),
          className: `timeline-color-${idx}`
        });
        identifier++;
      });
    });
  }
  getMapData(): void {
    this.mapData = this.resumes;
  }

  getTreeChartData(): void {
    this.treeChartData = new Skill();
    this.treeChartData.name = 'Skills'; //root
    this.resumes.forEach((r: Resume) => {
      r.skills.forEach((s: Skill) => {
        this.generateTreeData(this.treeChartData, r.id, s, r.skills);
      });
    });
  }

  generateTreeData(currentNode: Skill, resumeID: string, currentSkill: Skill, skillArray: Array<Skill>): void {
    let found = this.getExistingNode(this.treeChartData, currentSkill.name);
    if (found) {
      if (!found.people) found.people = new Array<string>();
      found.people.push(resumeID);
    } else {
      let skillParent = this.findParent(skillArray, currentSkill.name);
      if(skillParent) {
        let foundParent = this.getExistingNode(this.treeChartData, skillParent.name);
        if(foundParent) {
          let skill = new Skill();
          skill.name = currentSkill.name;
          skill.level = currentSkill.level;
          skill.experience = currentSkill.experience;
          skill.people = new Array<string>();
          skill.people.push(resumeID);
          foundParent.children.push(skill);
        } else {
          let skill = new Skill();
          skill.name = currentSkill.name;
          skill.level = currentSkill.level;
          skill.experience = currentSkill.experience;
          skill.people = new Array<string>();
          skill.people.push(resumeID);
          this.treeChartData.children.push(skill);
        }
      } else {
        let skill = new Skill();
        skill.name = currentSkill.name;
        skill.level = currentSkill.level;
        skill.experience = currentSkill.experience;
        skill.people = new Array<string>();
        skill.people.push(resumeID);
        this.treeChartData.children.push(skill);
      }
    }

    for (let i = 0; i < currentSkill.children.length; i++) {
      let currentChild = currentSkill.children[i];
      this.generateTreeData(currentNode, resumeID, currentChild, skillArray);
    }
  }

  findParent(skillArray: Array<Skill>, targetNode: string): Skill {
    let found;
    skillArray.forEach((n: Skill) => {
      found = this.getParentOfChild(n, targetNode);
    });
    return found;
  }

  getParentOfChild(currentNode: Skill, target: string): Skill {
    if (currentNode.children.filter((s) => { return s.name.toLowerCase() === target.toLowerCase(); }).length > 0) return currentNode;
    for (let i = 0; i < currentNode.children.length; i++) {
      let currentChild = currentNode.children[i];
      let result = this.getParentOfChild(currentChild, target);
      if (result) return result;
    }
    return null;
  }

  getExistingNode(currentNode: any, target: any): Skill {
    if (currentNode.name.toLowerCase() === target.toLowerCase()) return currentNode;

    for (let i = 0; i < currentNode.children.length; i++) {
      let currentChild = currentNode.children[i];
      let exists = this.getExistingNode(currentChild, target);
      if (exists) return exists;
    }
  }

  getSkillData(): void {
    this.skillData = new Array<any>();
    this.skillMap = new Map<string, Array<any>>();

    this.resumes.forEach((r: Resume) => {
      r.skills.forEach((s: Skill) => {
        this.peopleWithSkill(s, r);
      });
    });

    let uniqueSkills = new Map<string, any>();

    this.skillMap.forEach((v, k) => {
      v.forEach((e: any) => {
        if (!uniqueSkills.has(e.skill)) {
          uniqueSkills.set(e.skill, { value: 1 });
        } else {
          uniqueSkills.get(e.skill).value += 1;
        }
      });
    });

    this.skillMap.forEach((v, k) => {
      let arr = new Array<any>();
      v.forEach((e: any) => {
        if (uniqueSkills.get(e.skill).value === this.resumes.length) {
          // match
          let person = this.cs.getResume(this.resumes.map((r: Resume) => { return r.id; }).indexOf(k));
          arr.push({
            area: e.skill,
            name: `${person.firstName} ${person.lastName}`,
            resumeID: person.id,
            value: e.level,
            minValue: 0,
            maxValue: 5
          });
        }
      });

      if (arr.length > 0) this.skillData.push(arr);
    });

    this.matchedSkills = this.skillData[0] ? this.skillData[0].length : 0;
  }

  peopleWithSkill(currentNode, resume): void {
    if (currentNode.level !== '' && currentNode.children.length === 0) {
      // if exists push result ontop
      if (this.skillMap.has(resume.id)) {
        let value = {
          skill: currentNode.name,
          level: this.getLevelAsNumber(currentNode.level),
          name: `${resume.firstName} ${resume.lastName}`,
          person: resume,
          minLevel: 0,
          maxLevel: 5
        };
        this.skillMap.get(resume.id).push(value);
      } else {
        // set new key + initialize array of values
        let values = new Array<any>();
        values.push({
          skill: currentNode.name,
          level: this.getLevelAsNumber(currentNode.level),
          name: `${resume.firstName} ${resume.lastName}`,
          person: resume,
          minLevel: 0,
          maxLevel: 5
        })
        this.skillMap.set(resume.id, values);
      }
    }

    for (let i = 0; i < currentNode.children.length; i++) {
      let currentChild = currentNode.children[i];
      this.peopleWithSkill(currentChild, resume);
    }
  }

  highlightResume($event): void {
    // de-highlight all
    this.resumes.forEach((r: Resume) => { r.highlighted = false; });
    this.cs.setResumeID($event);
    if ($event === 'none')  return;
    // highlight selection
    let resume = this.resumes.find((r: Resume) => { return r.id === $event; });
    resume.highlighted = true;
    this.cd.detectChanges();
  }

  remove(idx: number): void {
    this.cs.removeResume(this.resumes[idx].id);
    this.getSkillData();
    this.getTreeChartData();
    this.getTimelineData();
    this.getMapData();
  }

  onEventSelected($event: any): void {
    this.cs.setEventIDs($event);
  }
}

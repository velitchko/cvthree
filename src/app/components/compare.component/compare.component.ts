import { Component } from '@angular/core';
import { Resume } from '../../models/resume';
import { Skill } from '../../models/skill';
import { SkillLevel } from '../../lists/skill.level';
import { CompareService } from '../../services/compare.service';
import { UtilServices } from 'src/app/services/util.service';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['compare.component.scss']
})

export class CompareComponent  {
  skillData: Array<any>;
  timelineData: Array<any>;
  mapData: Array<any>;
  skillMap: Map<string, Array<any>>;
  resumes: Array<Resume>;
  matchedSkills: number;

  constructor(
    private cs: CompareService,
    private util: UtilServices
    ) {
    this.resumes = this.cs.getResumes() || new Array<Resume>();
    this.skillData = new Array<any>();
    this.timelineData = new Array<any>();
    this.mapData = new Array<any>();
    this.skillMap = new Map<string, Array<any>>();

    // go through resumes and find matching skills 
    this.getSkillData();
    this.getTimelineData();
    this.getMapData();
    // skill, person, skillLevel, minSkillLevel, maxSkillLevel
  }

  getLevelAsNumber(level: string): number {
    return (parseInt(SkillLevel[level]));
  }

  getSanitizedPicture(picture: string): any {
    return this.util.getSanitizedPicture(picture);
  }

  getColor(id: string): string {
    return this.cs.getColorForResume(id);
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
    this.resumes.forEach((r: Resume, idx: number) => {
        // WORK
        r.work.forEach((w: any, jdx: number) => {
          this.timelineData.push({
            id: identifier,
            item: jdx,
            group: idx,
            category: 'WORK',
            location: w.location,
            start: w.startDate,
            end: w.endDate,
            title:  this.getTimelineTitle(w, identifier),
            content: this.getTimelineContent(w),
            className: `timeline-color-${idx}`
          });
          identifier++;
        });
        // EDUCATION
        r.education.forEach((e: any, jdx: number) => {
          this.timelineData.push({
            id: identifier,
            item: jdx,
            group: idx,
            category: 'WORK',
            location: e.location,
            start: e.startDate,
            end: e.endDate,
            title:  this.getTimelineTitle(e, identifier),
            content: this.getTimelineContent(e),
            className: `timeline-color-${idx}`
          });
          identifier++;
        });
        // TODO: Projects, Publications, Awards/Certificates, Volunteer work???        
    })
  }
  getMapData(): void {}
  getSkillData(): void {
    this.skillData = new Array<any>();
    this.skillMap = new Map<string, Array<any>>();

    this.cs.getResumes().forEach((r: Resume) => {
      r.skills.forEach((s: Skill) => {
        this.peopleWithSkill(s, r);
      });
    });
    
    let uniqueSkills = new Map<string, any>();
    
    this.skillMap.forEach((v, k) => {
      v.forEach((e: any) => {
        if(!uniqueSkills.has(e.skill)) {
          uniqueSkills.set(e.skill, { value: 1 });
        } else {
          uniqueSkills.get(e.skill).value += 1;
        }
      });
    });

    this.skillMap.forEach((v, k) => {
      let arr = new Array<any>();
      v.forEach((e: any) => {
        if(uniqueSkills.get(e.skill).value === this.cs.getResumes().length) {
          // match
          let person = this.cs.getResume(this.cs.getResumes().map((r: Resume) => { return r.id; }).indexOf(k));
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

      if(arr.length > 0) this.skillData.push(arr);
    });

    this.matchedSkills = this.skillData[0].length;
  }

  peopleWithSkill(currentNode, resume): void {
    if(currentNode.level !== '' && currentNode.children.length === 0) {
      // if exists push result ontop
      if(this.skillMap.has(resume.id)) {
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

    for(let i = 0; i < currentNode.children.length; i++) {
      let currentChild = currentNode.children[i];
      this.peopleWithSkill(currentChild, resume);
    }
  }

  remove(idx: number): void {
    this.cs.removeResume(this.resumes[idx].id);
    this.getSkillData();

  }

}

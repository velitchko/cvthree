import { Component } from '@angular/core';
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

export class CompareComponent  {
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
    // console.log('job')
    resume.work.forEach((w: Work) => {
      // console.log(w.startDate, w.endDate, this.util.getDateDifference(w.startDate, w.endDate))
      avg += this.util.getDateDifference(w.startDate, w.endDate);
    });

    return avg/resume.work.length;
  }

  getNumberOfLocations(resume: Resume): number {
    let locations = new Set();
    // console.log('location')
    resume.work.forEach((w: Work) => {
      locations.add(w.location.city);
      // console.log(w.location.city);
    });
    return locations.size;
  }

  getNumberOfLanguages(resume: Resume): number {
    // console.log('language');
    // console.log(resume.languages);
    return resume.languages.length;
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

  toggleVisibility(idx: number): void {
    this.resumes[idx].hidden = !this.resumes[idx].hidden;
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
        let initials = this.util.getInitials(r.firstName, r.lastName);
        let group = {
          id: idx,
          content: '<img src="' + r.profilePicture + '" class="timeline-profile-pic timeline-profile-pic-color-' + idx  + '"><div class="timeline-profile-initials timeline-pic-color-' + idx +'"><p class="upper-case">' + initials + '</p></div>'
        };
        this.timelineGroups.push(group);
        r.work.forEach((w: any, jdx: number) => {
          this.timelineData.push({
            id: identifier,
            item: jdx,
            group: idx,
            category: 'WORK',
            location: w.location,
            start: w.startDate,
            end: w.endDate,
            title:  this.getTimelineTitle(w, idx),
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
            title:  this.getTimelineTitle(e, idx),
            content: this.getTimelineContent(e),
            className: `timeline-color-${idx}`
          });
          identifier++;
        });

        // PROJECTS
        r.projects.forEach((e: any, jdx: number) => {
          this.timelineData.push({
            id: identifier,
            item: jdx,
            group: idx,
            category: 'PROJECT',
            location: null, // should we add a location?
            start: e.startDate,
            end: e.endDate,
            title: this.getTimelineTitle(e, idx),
            content: this.getTimelineContent(e),
            className: `timeline-color-${idx}`
          });
          identifier++;
        });

        // PUBLICATIONS
        r.publications.forEach((e: any, jdx: number) => {
          this.timelineData.push({
            id: identifier,
            item: jdx,
            group: idx,
            category: 'PUBLICATION',
            location: null,
            startDate: e.date,
            endDate: null,
            title: this.getTimelineTitle(e, idx),
            content: this.getTimelineContent(e),
            className: `timeline-color-${idx}`
          });
          identifier++;
        });

        // AWARDS/CERTIFICATES
        r.awards.forEach((e: any, jdx: number) => {
          this.timelineData.push({
            id: identifier,
            item: jdx,
            group: idx,
            category: 'AWARD/CERTIFICATE',
            location: null,
            startDate: e.date,
            endDate: null,
            title: this.getTimelineTitle(e, idx),
            content: this.getTimelineContent(e),
            className: `timeline-color-${idx}`
          });
          identifier++;
        });
    });
    console.log(this.timelineData);    
  }
  getMapData(): void {
    this.mapData = this.resumes;
  }

  getTreeChartData(): void {
    this.resumes.forEach((r: Resume) => {
      r.skills.forEach((s: Skill, idx: number) => {
        
        let found = this.getExistingNode(this.treeChartData, s.name);
        
        if(found) {
          if(!found.people) found.people = new Array<string>();
          found.people.push(r.id);
          console.log('appending to existing');
        } else {
          // TODO: if node does not exist
          // see if we can find a matching parent to append to
          let parent = this.getParentOfChild(this.treeChartData, s.name);
          if(parent) {
            console.log('appending to parent')
            let node = parent.children.find((c: Skill) => { return c.name === s.name });
            if(!node.people) node.people = new Array<string>();
            node.people.push(r.id);
          } else {
            console.log('creating child');
            // need to add people that know the skill additionally
            if(!s.people) s.people = new Array<string>();
            s.people.push(r.id);
            this.treeChartData.children.push(s);
          }
        }
      });
    });
    console.log(this.treeChartData);
  }

  getParentOfChild(currentNode, target): Skill  {
    if(currentNode.children.filter((s) => {return s.name === target;}).length > 0) return currentNode;

    for(let i = 0; i < currentNode.children.length; i++) {
        let currentChild = currentNode.children[i];
        let result = this.getParentOfChild(currentChild, target);
        if(result) return result;
    }
    return null;
  }


  getExistingNode(currentNode: any, target: any): Skill {
    if(currentNode.name === target) return currentNode;

    for(let i = 0; i < currentNode.children.length; i++) {
      let currentChild = currentNode.children[i];
      let exists = this.getExistingNode(currentChild, target);
      if(exists) return exists;
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
        if(uniqueSkills.get(e.skill).value === this.resumes.length) {
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

      if(arr.length > 0) this.skillData.push(arr);
    });

    this.matchedSkills = this.skillData[0] ? this.skillData[0].length : 0;
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

  linePlotSelection($event: any): void {
    console.log($event);
  }

  treeChartSelection($event: any): void {
    console.log($event);
  }

  remove(idx: number): void {
    this.cs.removeResume(this.resumes[idx].id);
    this.getSkillData();

  }

}

import { Component, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Resume } from '../../models/resume';
import { Skill } from '../../models/skill';
import { Work } from '../../models/work';
import { Project } from '../../models/project';
import { Publication } from '../../models/publication';
import { Award } from '../../models/award';
import { Education } from '../../models/education';
import { SkillLevel } from '../../lists/skill.level';
import { CompareService } from '../../services/compare.service';
import { UtilServices } from '../../services/util.service';
import { DatabaseServices } from '../../services/db.service';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['compare.component.scss']
})

export class CompareComponent implements AfterViewInit {
  skillData: Array<any>;
  timelineData: Array<any>;
  timelineGroups: Array<any>;
  treeChartData: Skill;
  mapData: Array<any>;
  skillMap: Map<string, Array<any>>;
  resumes: Array<Resume>;
  matchedSkills: number;

  resumeOrdering: Array<any>;

  constructor(
    private cs: CompareService,
    private cd: ChangeDetectorRef,
    private db: DatabaseServices,
    private util: UtilServices
  ) {
    this.resumeOrdering = new Array<any>(
      { value: 'age', display: 'Age' },
      { value: 'yoe', display: 'Years of Experience' },
      { value: 'avgjd', display: 'Average Job Duration' },
      { value: 'locs', display: 'Number of Locations' },
      { value: 'numskill', display: 'Number of Skills' },
      { value: 'langs', display: 'Number of Languages' },
      { value: 'base', display: 'Base Score' },
      { value: 'bonus', display: 'Bonus Score' },
      { value: 'basebonus', display: 'Base+Bonus Score' },
    );
    this.resumes = this.cs.getResumes() || new Array<Resume>();
    this.skillData = new Array<any>();
    this.treeChartData = new Skill();
    this.treeChartData.name = 'Skills'; //root
    this.timelineData = new Array<any>();
    this.timelineGroups = new Array<any>();
    this.mapData = new Array<any>();
    this.skillMap = new Map<string, Array<any>>();
    // skill, person, skillLevel, minSkillLevel, maxSkillLevel
  }

  ngAfterViewInit(): void {
    // go through resumes and find matching skills 
    this.getTimelineData();
    this.getSkillData();
    this.getTreeChartData();
    this.getMapData();
  }

  getYearsOfExperience(resume: Resume): number {
    return this.util.getYearsOfExperience(resume);
  }

  calculateAvgJobDuration(resume: Resume): string {
    return this.util.calculateAvgJobDuration(resume);
  }

  getNumberOfLocations(resume: Resume): number {
    return this.util.getNumberOfLocations(resume);
  }

  getNumberOfSkills(resume: Resume): number {
    return this.util.getNumberOfSkills(resume);
  }

  getNumberOfLanguages(resume: Resume): number {
    return this.util.getNumberOfLanguages(resume);
  }

  reorderResumes($event): void {
    switch ($event.value) {
      case 'age':
        this.resumes.sort((a: Resume, b: Resume) => {
          return this.getAge(b.birthDay) - this.getAge(a.birthDay);
        });
        break;
      case 'yoe':
        this.resumes.sort((a: Resume, b: Resume) => {
          return this.util.getYearsOfExperience(b) - this.util.getYearsOfExperience(a);
        })
        break;
      case 'avgjd':
        this.resumes.sort((a: Resume, b: Resume) => {
          return parseFloat(this.util.calculateAvgJobDuration(b)) - parseFloat(this.util.calculateAvgJobDuration(a));
        });
        break;
      case 'locs':
        this.resumes.sort((a: Resume, b: Resume) => {
          return this.util.getNumberOfLocations(b) - this.util.getNumberOfLocations(a);
        });
        break;
      case 'numskill':
        this.resumes.sort((a: Resume, b: Resume) => {
          return this.util.getNumberOfSkills(b) - this.util.getNumberOfSkills(a);
        });
        break;
      case 'langs':
        this.resumes.sort((a: Resume, b: Resume) => {
          return this.util.getNumberOfLanguages(b) - this.util.getNumberOfLanguages(a);
        });
        break;
      case 'base':
        this.resumes.sort((a: Resume, b: Resume) => {
          return b.base - a.base;
        });
        break;
      case 'bonus':
        this.resumes.sort((a: Resume, b: Resume) => {
          return b.bonus - a.bonus;
        });
        break;
      case 'basebonus':
        this.resumes.sort((a: Resume, b: Resume) => {
          return (b.base + b.bonus) - (a.base + a.bonus);
        });
        break;
    }
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

  toggleHide(idx: number): void {
    this.resumes[idx].hidden = !this.resumes[idx].hidden;
    this.getSkillData();
    this.getTreeChartData();
    this.getTimelineData();
    this.getMapData();
  }

  toggleVisibility(idx: number): void {
    this.resumes.forEach((r: Resume, id: number) => {
      if (idx === id) return;
      r.highlighted = false;
    });
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
      <div class="timeline-content">
        <h3 class="timeline-title">
          ${item.position} @ ${item.company}
        </h3>
        <p>${this.util.getPrettyDate(item.startDate, item.endDate)}</p>
        ${item.location ?
        `<p>
          <i class="material-icons">place</i>${item.location.address ? item.location.address : ''} ${item.location.city ? item.location.city : ''} ${item.location.country ? item.location.country : ''}
        </p>` : ''}
        <p>
         ${item.description ? item.description : 'No description for event.'}
        </p>
      </div>
    `;
  }

  getTimelineContent(item: any, icon: string): string {
    // <i class="timeline-icon fa ' + icon +'"></i>' + events[j].title,?
    return `<i class="material-icons">${icon}</i>${item.position} @ ${item.company}`;
  }


  getTimelineData(): void {
    let identifier = 0;
    this.timelineGroups = new Array<any>();
    this.timelineData = new Array<any>();
    this.resumes.forEach((r: Resume, idx: number) => {
      if (r.hidden) return;
      // WORK
      let initials = this.util.getInitials(r.firstName, r.lastName);
      let group = {
        id: idx,
        content: `<img src="${r.profilePicture}" class="timeline-profile-pic" style="background-color: ${this.cs.getColorForResume(r.id)}; border-color: ${this.cs.getColorForResume(r.id)};"><div class="timeline-profile-initials"  style="background-color: ${this.cs.getColorForResume(r.id)};"><p class="upper-case">${initials}</p></div>`
      };
      let type = 'range';
      this.timelineGroups.push(group);
      r.work.forEach((w: Work, jdx: number) => {
        w.identifier = identifier;
        w.oldIdx = !w.oldIdx ? idx : w.oldIdx;
        type = w.endDate ? 'range' : 'point';
        let event = {
          id: identifier,
          item: jdx,
          group: idx,
          category: 'WORK',
          resumeID: r.id,
          location: `${w.location.address ? w.location.address : ''} ${w.location.city ? w.location.city : ''} ${w.location.country ? w.location.country : ''}`,
          start: w.startDate,
          type: type,
          title: this.getTimelineTitle(w, idx),
          content: this.getTimelineContent(w, 'work'),
        }
        event['className'] = `timeline-color-${w.oldIdx}`;
        if (w.endDate) event['end'] = w.endDate;
        this.timelineData.push(event);
        identifier++;
      });

      // EDUCATION
      r.education.forEach((e: Education, jdx: number) => {
        e.identifier = identifier;
        e.oldIdx = !e.oldIdx ? idx : e.oldIdx;
        type = e.endDate ? 'range' : 'point';
        let education = {
          position: e.studies,
          company: e.institution
        }
        let event = {
          id: identifier,
          item: jdx,
          group: idx,
          category: 'EDUCATION',
          resumeID: r.id,
          location: e.institution,
          start: e.startDate,
          end: e.endDate,
          type: type,
          title: this.getTimelineTitle(education, idx),
          content: this.getTimelineContent(education, 'school'),
        };
        event['className'] = `timeline-color-${e.oldIdx}`;
        if (e.endDate) event['end'] = e.endDate;
        this.timelineData.push(event);
        identifier++;
      });

      // PROJECTS
      r.projects.forEach((e: Project, jdx: number) => {
        e.identifier = identifier;
        type = e.endDate ? 'range' : 'point';
        e.oldIdx = !e.oldIdx ? idx : e.oldIdx;
        let project = {
          position: e.title,
          company: e.url
        };
        let event = {
          id: identifier,
          item: jdx,
          group: idx,
          category: 'PROJECT',
          resumeID: r.id,
          location: null, // should we add a location?
          start: e.startDate,
          end: e.endDate,
          type: type,
          title: this.getTimelineTitle(project, idx),
          content: this.getTimelineContent(project, 'assignment'),
        };
        event['className'] = `timeline-color-${e.oldIdx}`;
        if (e.endDate) event['end'] = e.endDate;
        this.timelineData.push(event);
        identifier++;
      });

      // PUBLICATIONS
      r.publications.forEach((e: Publication, jdx: number) => {
        e.identifier = identifier;
        e.oldIdx = !e.oldIdx ? idx : e.oldIdx;
        let publication = {
          position: e.title,
          company: e.publisher
        };
        let event = {
          id: identifier,
          item: jdx,
          group: idx,
          category: 'PUBLICATION',
          resumeID: r.id,
          location: null,
          startDate: e.date,
          type: 'point',
          title: this.getTimelineTitle(publication, idx),
          content: this.getTimelineContent(publication, 'note_add'),
        };
        event['className'] = `timeline-color-${e.oldIdx}`;
        this.timelineData.push(event);
        identifier++;
      });

      // AWARDS/CERTIFICATES
      r.awards.forEach((e: Award, jdx: number) => {
        e.identifier = identifier;
        e.oldIdx = !e.oldIdx ? idx : e.oldIdx;
        let award = {
          position: e.title,
          company: e.awarder
        };
        let event = {
          id: identifier,
          item: jdx,
          group: idx,
          category: 'CERTIFICATE/AWARD',
          resumeID: r.id,
          location: null,
          startDate: e.date,
          type: 'point',
          title: this.getTimelineTitle(award, idx),
          content: this.getTimelineContent(award, 'star'),
        };
        event['className'] = `timeline-color-${e.oldIdx}`;
        this.timelineData.push(event);
        identifier++;
      });
    });
  }

  getMapData(): void {
    this.mapData = this.resumes.filter((r: Resume) => { return !r.hidden; });
    this.cd.detectChanges();
  }

  getTreeChartData(): void {
    this.treeChartData = new Skill();
    this.treeChartData.name = 'Skills'; //root
    for (let i = 0; i < this.resumes.length; i++) {
      let currentResume = this.resumes[i];
      if (currentResume.hidden) continue;
      for (let j = 0; j < currentResume.skills.length; j++) {
        let currentSkill = currentResume.skills[j];
        this.generateTreeData(this.treeChartData, currentResume.id, currentSkill, currentResume.skills);
      }
    }
  }

  generateTreeData(currentNode: Skill, resumeID: string, currentSkill: Skill, skillArray: Array<Skill>): void {
    let found = this.getExistingNode(this.treeChartData, currentSkill.name);
    if (found) {
      if (!found.people) found.people = new Array<string>();
      found.people.push(resumeID);
    } else {
      let skillParent = this.findParent(skillArray, currentSkill.name);
      if (skillParent) {
        let foundParent = this.getExistingNode(this.treeChartData, skillParent.name);
        if (foundParent) {
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
    for (let i = 0; i < skillArray.length; i++) {
      let currentSkill = skillArray[i];
      found = this.getParentOfChild(currentSkill, targetNode);
      if (found) return found;
    }
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
    for (let i = 0; i < this.resumes.length; i++) {
      let currentResume = this.resumes[i];
      if (currentResume.hidden) continue;
      for (let j = 0; j < currentResume.skills.length; j++) {
        let currentSkill = currentResume.skills[j];
        this.peopleWithSkill(currentSkill, currentResume);
      }
    }

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
        if (uniqueSkills.get(e.skill).value === this.resumes.filter((r: Resume) => { return !r.hidden; }).length) {
          // match
          let person = this.cs.getResume(this.resumes.map((r: Resume) => { return r.id; }).indexOf(k));
          // console.log(e);
          arr.push({
            area: e.skill,
            name: `${person.firstName} ${person.lastName}`,
            resumeID: person.id,
            value: e.level,
            minValue: 1,
            maxValue: 5
          });
        }
      });

      if (arr.length > 0) this.skillData.push(arr);
    });
    console.log(this.skillMap);
    this.matchedSkills = this.skillData[0] ? this.skillData[0].length : 0;
    // console.log(this.skillData);
    this.cd.detectChanges();
  }

  peopleWithSkill(currentNode, resume): void {
    if (this.skillMap.has(resume.id)) {
      let value = {
        skill: currentNode.name,
        level: this.getLevelAsNumber(currentNode.level.trim()),
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

    for (let i = 0; i < currentNode.children.length; i++) {
      let currentChild = currentNode.children[i];
      this.peopleWithSkill(currentChild, resume);
    }
  }

  highlightResume($event): void {
    // de-highlight all
    this.resumes.forEach((r: Resume) => { r.highlighted = false; });
    this.cs.setResumeID($event);
    if ($event === 'none') return;
    // highlight selection
    let resume = this.resumes.find((r: Resume) => { return r.id === $event; });
    resume.highlighted = true;
    this.cd.detectChanges();
  }

  remove(idx: number): void {
    this.db.getResumeByID(this.resumes[idx].id).selected = false;
    this.cs.removeResume(this.resumes[idx].id);
    this.resumes = this.cs.getResumes();
    this.getSkillData();
    this.getTreeChartData();
    this.getTimelineData();
    this.getMapData();
  }

  onEventSelected($event: any): void {
    this.cs.setEventIDs($event);
  }
}

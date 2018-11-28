import { Component, ViewChild, ElementRef  } from '@angular/core';
import { DatabaseServices } from '../../services/db.service';
import { Resume } from '../../models/resume';
import { Language } from '../../models/language';
import { LANGUAGES } from '../../lists/languages';
import { Router } from '@angular/router';
import { UtilServices } from '../../services/util.service';
import { CompareService } from '../../services/compare.service';
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['list.component.scss']
})

export class ListComponent  {
  @ViewChild('listWrapper', { read: ElementRef }) listWrapper: ElementRef<any>;
  loading: boolean = true;
  showScatterPlot: boolean = false;
  scatterPlotPoints: Array<any>;
  resumes: Array<Resume>;
  resumeOrdering: Array<any>;

  constructor(
    private cs: CompareService,
    private db: DatabaseServices,
    private util: UtilServices,
    private router: Router) {
    this.resumeOrdering = new Array<any>(
      { value: 'age', display: 'Age'},
      { value: 'yoe', display: 'Years of Experience'},
      { value: 'avgjd', display: 'Average Job Duration'},
      { value: 'locs', display: 'Number of Locations'},
      { value: 'numskill', display: 'Number of Skills'},
      { value: 'langs', display: 'Number of Languages'},
      { value: 'base', display: 'Base Score'},
      { value: 'bonus', display: 'Bonus Score'},
      { value: 'basebonus', display: 'Base+Bonus Score'},
    );
    this.resumes = new Array<Resume>();
    this.scatterPlotPoints = new Array<any>();
    if(this.db.getLocalResumes().length === 0 ) {
      this.db.getAllResumes().then((success: any) => {
        this.resumes = success;
        this.loading = false;
      });
    } else {
      this.resumes = db.getLocalResumes();
      // we have resumes in the service
      this.loading = false;
    }
  }

  getLangTooltip(language: Language): string {
    return `${language.name} | ${language.level}`;
  }

  getClassForLanguage(language: Language): string {
    let languageClass = '';
    LANGUAGES.forEach((l: any) => {
      if(l.name.toLowerCase() === language.name.toLowerCase()) {
        languageClass = `flag-icon-${l.code}`;
        return;
      }
    });
    return languageClass;
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
    switch($event.value) {
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

  getComparedResumes(): Array<Resume> {
    return this.cs.getResumes();
  }

  add(idx: number): void {
    this.resumes[idx].selected = true;
    this.cs.addResume(this.resumes[idx]);
  }

  getSanitizedPicture(picture: string): any {
    return this.util.getSanitizedPicture(picture);
  }

  selectResumes($event: any): void {
    if(this.resumes.length === 10) return; //max achieved
    // TODO: open popup
    this.resumes.forEach((r: Resume) => { r.selected = false; });
    this.cs.clearResumes();
    $event.forEach((id: string) => {
      this.resumes.forEach((r: Resume) => {
        if(r.id === id) { 
          r.selected = true;
          this.cs.addResume(r);
        }
      });
    });
  }

  delete(id: string): void {
    let idx = this.resumes.map((r: Resume) => { return r.id; }).indexOf(id);
    this.resumes[idx].selected = false;
    this.cs.removeResume(id);
  }

  view(idx: number): void {
    this.router.navigate(['/view', this.resumes[idx].id]);
  }

  edit(idx: number): void {
    this.router.navigate(['/edit', this.resumes[idx].id]);
  }

  getAge(birthDay: Date): number {
    return this.util.getAge(birthDay);
  }

  compareResumes(): void {
    this.router.navigate(['/compare']);
  }

  scrollDown(): void {
    // this.listWrapper.nativeElement.scrollTop += 300;
    // this.listWrapper.nativeElement.scrollTo({ left: 0, top: this.acc += 300,  behavior: 'smooth'})
    // console.log(this.listWrapper.nativeElement.scrollTop, this.listWrapper.nativeElement.scrollHeight)
  }

  update($event: any): void {
    this.resumes = $event.map((r: any) => { 
      // set score in resume
      r.resume.bonus = r.bonus;
      r.resume.base = r.base;
      return r.resume 
    });
    this.showScatterPlot = this.resumes.filter((r: Resume) => { return r.base !== 0 }).length === 0 ? false : true;
    this.scatterPlotPoints = $event;
    // repopulate compare service
    this.cs.clearResumes();
    // this.resumes.forEach((r: Resume) => { this.cs.addResume(r); });
  }
}

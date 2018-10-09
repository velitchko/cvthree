import { Component, ViewChild, ElementRef  } from '@angular/core';
import { DatabaseServices } from '../../services/db.service';
import { Resume } from '../../models/resume';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
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

  constructor(
    private cs: CompareService,
    private db: DatabaseServices,
    private util: UtilServices,
    private router: Router,
    private sanitization: DomSanitizer) {
    this.resumes = new Array<Resume>();
    this.scatterPlotPoints = new Array<any>();
    this.db.getAllResumes().then((success: any) => {
      this.resumes = success;
      this.loading = false;
    });
  }

  getComparedResumes(): Array<Resume> {
    return this.cs.getResumes();
  }

  add(idx: number): void {
    this.resumes[idx].selected = true;
    this.cs.addResume(this.resumes[idx]);
  }

  selectResumes($event: any): void {
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
    console.log(idx);
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

  getSanitizedPicture(picture) {
    return this.sanitization.bypassSecurityTrustStyle(`url(${picture})`);
  }

  scrollDown(): void {
    // this.listWrapper.nativeElement.scrollTop += 300;
    // this.listWrapper.nativeElement.scrollTo({ left: 0, top: this.acc += 300,  behavior: 'smooth'})
    // console.log(this.listWrapper.nativeElement.scrollTop, this.listWrapper.nativeElement.scrollHeight)
  }

  update($event: any): void {
    this.showScatterPlot = true;
    this.scatterPlotPoints = $event;
    this.resumes = $event.map((r: any) => { return r.resume });
  }
}

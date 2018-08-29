import { Component } from '@angular/core';
import { DatabaseServices } from '../../services/db.service';
import { Resume } from '../../models/resume';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['list.component.scss']
})

export class ListComponent  {
  loading: boolean = true;
  resumes: Array<Resume>;
  resumesToBeCompared: Array<Resume>;
  constructor(private db: DatabaseServices, private router: Router, private sanitization: DomSanitizer) {
    this.resumes = new Array<Resume>();
    this.resumesToBeCompared = new Array<Resume>();
    this.db.getAllResumes().then((success: any) => {
      this.resumes = success;
      this.loading = false;
    });
  }

  add(idx: number): void {
    if(!this.resumesToBeCompared.includes(this.resumes[idx])) {
      this.resumesToBeCompared.push(this.resumes[idx]);
    }
  }

  delete(idx: number): void {
    this.resumesToBeCompared.splice(idx, 1);
  }

  view(idx: number): void {
    this.router.navigate(['/view', this.resumes[idx].id]);
  }

  compareResumes(): void {
    this.db.clearSelectedResumes();
    this.db.updateSelectedResumes(this.resumesToBeCompared);
    this.router.navigate(['/compare']);
  }

  getSanitizedPicture(picture) {
    return this.sanitization.bypassSecurityTrustStyle(`url(${picture})`);
  }
}

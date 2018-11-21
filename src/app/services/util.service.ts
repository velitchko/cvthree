import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Resume } from '../models/resume';
import { Skill } from '../models/skill';
import { Work } from '../models/work';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import * as moment from 'moment';
@Injectable()

export class UtilServices {

  constructor(private sanitization: DomSanitizer) {}

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  }

  getAge(birthDay: Date): number {
    let ageDifMs = Date.now() - birthDay.getTime();
    let ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  getSanitizedPicture(picture: string): SafeStyle {
    let httpsPic = picture.replace('http://localhost:8000/api/v1/', 'https://cvthree.cvast.tuwien.ac.at/api/v1/');
    return this.sanitization.bypassSecurityTrustStyle(`url(${httpsPic})`);
  }

  getDateDifference(a: Date, b: Date): number {
    if(!b) return 0;
    let start = moment(a, 'YYYY-MM-DD');
    let end = b ? moment(b, 'YYYY-MM-DD') : moment(Date.now(), 'YYYY-MM-DD');
    return end.diff(start, 'years');
  }

  getPrettyDate(startDate: Date, endDate: Date): string {
    let str = '';
    str += moment(startDate).format('DD-MM-YYYY') + ' - ';
    str+= endDate ? moment(endDate).format('DD-MM-YYYY') : 'ongoing';
    return str;
  }
  
  getYearsOfExperience(resume: Resume): number {
    let yoe = 0;
    resume.work.forEach((w: Work) => {
      yoe += this.getDateDifference(w.startDate, w.endDate);
    });
    return yoe;
  }

  getNumberOfLanguages(resume: Resume): number {
    return resume.languages.length;
  }

  
  calculateAvgJobDuration(resume: Resume): string {
    let avg = 0;
    resume.work.forEach((w: Work) => {
      avg += this.getDateDifference(w.startDate, w.endDate);
    });
    if(avg === 0 && resume.work.length === 0) return '0'; // otherwise it returns a NaN
    return (Math.ceil((avg / resume.work.length) * 100) / 100).toFixed(1);
  }

  getNumberOfLocations(resume: Resume): number {
    let locations = new Set();
    resume.work.forEach((w: Work) => {
      locations.add(w.location.city);
    });
    return locations.size;
  }

  getNumberOfSkills(resume: Resume): number {
    let skills = 0;
    resume.skills.forEach((s: Skill) => {
      skills++; // amount of root nodes
    });
    // TODO: complete for children
    return skills;
  }

}

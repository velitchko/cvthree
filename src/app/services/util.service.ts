import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Resume } from '../models/resume';
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

}

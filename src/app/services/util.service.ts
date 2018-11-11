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
    return this.sanitization.bypassSecurityTrustStyle(`url(${picture})`);
  }

  getDateDifference(a: Date, b: Date): number {
    let start = moment(a, 'DD/MM/YYYY');
    let end = b ? moment(b, 'DD/MM/YYYY') : moment(Date.now(), 'DD/MM/YYYY');
    return end.diff(b, 'years');
  }

}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Resume } from '../models/resume';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Injectable()

export class UtilServices {

  constructor(private sanitization: DomSanitizer) {}

  getAge(birthDay: Date): number {
    let ageDifMs = Date.now() - birthDay.getTime();
    let ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  getSanitizedPicture(picture: string): SafeStyle {
    return this.sanitization.bypassSecurityTrustStyle(`url(${picture})`);
  }
}

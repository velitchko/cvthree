import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Query } from '../components/search.component/search.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Resume } from '../models/resume';

@Injectable()

export class DatabaseServices {
  resumes: Array<any>;

  constructor(private http: HttpClient) {
    this.resumes = new Array<Resume>();
  }

  transformResume(resume: any): any {
    let body: any = {};

    body.firstName = resume.firstName;
    body.lastName = resume.lastName;
    body.location = resume.location;
    body.birthday = resume.birthDay;
    body.label = resume.label;
    body.profilePicture = resume.profilePicture;
    body.email = resume.email;
    body.phone = resume.phone;
    body.summary = resume.summary;
    body.url = resume.url;
    body.projects = resume.projects;
    body.references = resume.references;
    body.interests = resume.interests;
    body.languages = resume.languages;
    body.skills = resume.skills;
    body.certificates = resume.certificates;
    body.awards = resume.awards;
    body.education = resume.education;
    body.publications = resume.publications;
    body.work = resume.work;
    body.profiles = resume.profiles;
    body.courses = resume.courses;

    return body;
  }

  parseResume(json: any): Resume {
    let resume = new Resume();

    resume.id = json._id;
    resume.firstName = json.firstName;
    resume.lastName = json.lastName;
    resume.location = json.location;
    resume.birthDay = new Date(json.birthday) || null;
    resume.profilePicture = json.profilePicture !== 'default.png' ? json.profilePicture : `${environment.API_PATH}uploads/default.jpg`;
    resume.email = json.email;
    resume.phone = json.phone;
    resume.summary = json.summary;
    resume.url = json.url;
    resume.label = json.label;
    resume.projects = json.projects;
    resume.references = json.references;
    resume.interests = json.interests;
    resume.languages = json.languages;
    resume.skills = json.skills;
    resume.certificates = json.certificates;
    resume.awards = json.awards;
    resume.education = json.education;
    resume.publications = json.publications;
    resume.work = json.work;
    resume.profiles = json.profiles;
    resume.courses = json.courses;
    resume.location = json.location;

    return resume;
  }

  createResume(resume: any): Promise<any> {
    let promise = new Promise<any>((resolve, reject) => {
      this.http.post(`${environment.API_PATH}resume`, this.transformResume(resume)).subscribe((response: any) => {
        resolve(response);
      });
    });
    return promise;
  }
  getLocalResumes(): Array<Resume> {
    return this.resumes;
  }
  
  getAllResumes(): Promise<any> {
    let promise = new Promise<any>((resolve, reject) => {
      this.http.get(`${environment.API_PATH}resumes`).subscribe((response: any) => {
        if(response.message === "OK") {
          response.results.forEach((r: any) => {
            this.resumes.push(this.parseResume(r));
          });
          resolve(this.resumes);
        } else {
          reject(response.message);
        }
      });
    });

    return promise;
  }

  getResume(id: string): Promise<any> {
    let promise = new Promise<any>((resolve, reject) => {
      this.http.get(`${environment.API_PATH}resume/${id}`).subscribe((response: any) => {
        if(response.message === "OK") {
          resolve(this.parseResume(response.results));
        } else {
          reject(response.message);
        }
      });
    });
    return promise;
  }

  deleteResume(id: string): Promise<any> {
    let promise = new Promise<any>((resolve, reject) => {
      this.http.delete(`${environment.API_PATH}resumes/${id}`).subscribe((response: any) => {
        resolve(response);
      });
    });
    return promise;
  }

  updateResume(id: string, resume: any): Promise<any> {
    let promise = new Promise<any>((resolve, reject) => {
      this.http.put(`${environment.API_PATH}resumes/${id}`, this.transformResume(resume)).subscribe((response: any) => {
        resolve(response);
      });
    });
    return promise;
  }

  query(searchTerm: string): Promise<any> {
    let promise = new Promise<any>((resolve, reject) => {
      this.http.post(`${environment.API_PATH}query`, { query: searchTerm }).subscribe((response: any) => {
        resolve(response);
      });
    });
    return promise;
  }

  skillQuery(queries: Array<Query>): Promise<any> {
    let promise = new Promise<any>((resolve, reject) => {
      this.http.post(`${environment.API_PATH}skillquery`, { query: JSON.stringify(queries)}).subscribe((response: any) => {
        if(response.message === "OK") {
          let success = [];
          response.results.forEach((r: any) => {
            success.push({
              base: r.base,
              bonus: r.bonus,
              resume: this.parseResume(r.resume)
            });
          })
          resolve(success);
        }
        if(!response.results) reject(response);
      });
    });

    return promise;
  }
}

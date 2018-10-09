import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Resume } from '../models/resume';

@Injectable()

export class CompareService {
    resumes: Array<Resume>;
    constructor() {
        this.resumes = new Array<Resume>();
    }

    addResume(resume: Resume): void {
        if(this.resumes.includes(resume)) return;
        this.resumes.push(resume);
    }

    getResume(idx: number): Resume {
        return this.resumes[idx];
    }

    getResumes(): Array<Resume> {
        return this.resumes;
    }

    removeResume(id: string): void {
        let idx = this.resumes.map((r: Resume) => { return r.id; }).indexOf(id);
        console.log(idx);
        if(idx < 0) return;
        this.resumes.splice(idx,1);
    }

    clearResumes(): void {
        this.resumes = new Array<Resume>();
    }

}
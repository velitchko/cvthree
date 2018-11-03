import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Resume } from '../models/resume';

@Injectable()

export class CompareService {
    resumes: Array<Resume>;
    colors: Array<string>;
    assignedColors: Map<string, string>; // resume._id, hex(color)
    constructor() {
        this.resumes = new Array<Resume>();
        this.colors = new Array<string>('#3065ff', '#00ccff', '#01ff89', '#87fc70', '#ffdb4c', '#ff9500', '#ff5e3a', '#c644fc', '#ef2ecf', '#f02e6b'); // hex
        this.assignedColors = new Map<string, string>();
        this.setupColors();
    }

    setupColors(): void {
        if(this.resumes.length === 0) return; // cant map colors to no resumes
        this.resumes.forEach((r: Resume, idx: number) => {
            this.assignedColors.set(r.id, this.colors[idx]);
        });
        console.log(this.assignedColors);
    }

    getColorForResume(id: string): string {
        return this.assignedColors.get(id);
    }

    addResume(resume: Resume): void {
        if(this.resumes.includes(resume)) return;
        console.log('adding resume');
        console.log(resume);
        this.resumes.push(resume);
        this.setupColors();
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
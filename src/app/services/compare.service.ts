import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Resume } from '../models/resume';
import { Skill } from '../models/skill';

@Injectable()

export class CompareService {
    resumes: Array<Resume>;
    colors: Array<string>;
    assignedColors: Map<string, string>; // resume._id, hex(color)
    
    private selectedEvents = new BehaviorSubject<Array<any>>(null);
    currentlySelectedEvents = this.selectedEvents.asObservable();

    private selectedResume = new BehaviorSubject<string>('');
    currentlySelectedResume = this.selectedResume.asObservable();
    
    constructor() {
        this.resumes = new Array<Resume>();
        this.colors = new Array<string>('#3065ff', '#00ccff', '#01ff89', '#87fc70', '#ffdb4c', '#ff9500', '#ff5e3a', '#c644fc', '#ef2ecf', '#f02e6b'); // hex
        this.assignedColors = new Map<string, string>();
        this.setupColors();
    }

    setEventIDs(objectIdArr: any): void {
        this.selectedEvents.next(objectIdArr);
    }

    // TODO: Extend for set of IDs (array?)
    setResumeID(id: string): void {
        this.selectedResume.next(id);
    }

    setupColors(): void {
        if(this.resumes.length === 0) return; // cant map colors to no resumes
        this.resumes.forEach((r: Resume, idx: number) => {
            this.assignedColors.set(r.id, this.colors[idx]);
        });
    }

    getColorForResume(id: string): string {
        return this.assignedColors.get(id);
    }

    addResume(resume: Resume): void {
        if(this.resumes.includes(resume)) return;
        this.resumes.push(resume);
        this.setupColors();
    }

    getResume(idx: number): Resume {
        return this.resumes[idx];
    }

    getResumeByID(id: string): Resume {
        return this.resumes.find((r: Resume) => { return r.id === id; });
    }

    getResumes(): Array<Resume> {
        return this.resumes;
    }

    removeResume(id: string): void {
        let idx = this.resumes.map((r: Resume) => { return r.id; }).indexOf(id);
        if(idx < 0) return;
        this.resumes.splice(idx,1);
    }

    clearResumes(): void {
        this.resumes = new Array<Resume>();
    }

    searchForSkill(resumeID: string, skillName: string): Skill {
        return this.recursiveSkillSearch(this.getResumeByID(resumeID).skills, skillName);
    }

    private recursiveSkillSearch(skills: Array<Skill>, skillName: string): Skill {
        let found;
        skills.forEach((s: Skill) => {
            found = this.getExistingNode(s, skillName);
        });
        return found;
    }

    private getExistingNode(currentNode: Skill, target: string): Skill {
        if(currentNode.name.toLowerCase() === target.toLowerCase()) return currentNode;

        for(let i = 0; i < currentNode.children.length; i++) {
            let currentChild = currentNode.children[i];
            let exists = this.getExistingNode(currentChild, target);
            if(exists) return exists;
        }
    }

}
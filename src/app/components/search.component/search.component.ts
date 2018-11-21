import { Component, Output, EventEmitter } from '@angular/core';
import { SkillLevel } from '../../lists/skill.level';
import { LanguageLevel } from '../../lists/language.level';
import { DatabaseServices } from '../../services/db.service';

// @Injectable()
export class Query {
    skills: Array<{ searchSkill: string, searchLevel: string}>;
    languages: Array<{ searchLanguage: string, searchLevel :string}>;

    searchOccupation: string;
    searchLocation: string;

    constructor() {
     this.skills = new Array<{ searchSkill: string, searchLevel: string}>();
     this.languages = Array<{ searchLanguage: string, searchLevel :string}>();
     this.searchLocation = '';
     this.searchOccupation = '';
    }
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['search.component.scss']
})
export class SearchComponent {
    // Converts ENUM list for language levels to iterable array
    // *ngFor = let ll of levels()
    query: Query;
    @Output() results: any;

    skillLevels(): Array<String> {
        const levels = Object.keys(SkillLevel);
        return levels.slice(levels.length/2);
    };

    languageLevels(): Array<String> {
        const levels = Object.keys(LanguageLevel);
        return levels.slice(levels.length/2);
    };

    constructor(private db: DatabaseServices) {
        this.query = new Query();
        this.results = new EventEmitter<any>();
    }

    addSkillQuery(skill: any, level: any): void {
        let skillQ = {
            searchSkill: skill.value,
            searchLevel: level.value
        };
        this.query.skills.push(skillQ);
        skill.value = '';
        level.value = '';
    }

    addLanguageQuery(language: any, level: any = ''): void {
        let langQ = {
            searchLanguage: language.value,
            searchLevel: level.value
        };
        this.query.languages.push(langQ);
        language.value = '';
        //level.value = '';
    }

    removeSkillQuery(idx: number): void {
        this.query.skills.splice(idx, 1);
    }
    
    removeLanguageQuery(idx: number): void {
        this.query.languages.splice(idx, 1);
    }


    submit(): void {
        // submit query to server
        this.db.skillQuery(this.query).then((success) => {
            this.results.emit(success);
        });   
    }
}
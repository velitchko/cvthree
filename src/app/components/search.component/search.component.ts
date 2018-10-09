import { Component, Output, EventEmitter } from '@angular/core';
import { SkillLevel } from '../../lists/skill.level';
import { DatabaseServices } from '../../services/db.service';

// @Injectable()
export class Query {
    searchSkill: string;
    searchLevel: string;

    constructor(skill: string, level: string) {
        this.searchSkill = skill || '';
        this.searchLevel = level || 'BASIC'; 
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
    queries: Array<Query>;
    searchSkill: string;
    searchLevel: string;
    @Output() results: any;

    levels(): Array<String> {
        const levels = Object.keys(SkillLevel);
        return levels.slice(levels.length/2);
    };

    constructor(private db: DatabaseServices) {
        this.queries = new Array<Query>();
        this.results = new EventEmitter<any>();
    }

    addQuery(skill: any, level: any): void {
        this.queries.push(new Query(skill.value, level.value));
        skill.value = '';
        level.value = '';
    }

    removeQuery(idx: number): void {
        this.queries.splice(idx, 1);
    }

    submit(): void {
        // submit query to server
        this.db.skillQuery(this.queries).then((success) => {
            this.results.emit(success);
        });   
    }
}
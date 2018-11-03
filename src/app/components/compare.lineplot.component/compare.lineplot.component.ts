import { Component, PLATFORM_ID, Input, Inject, AfterViewInit, ElementRef, ViewChild, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { SkillLevel } from '../../lists/skill.level';
import { DatabaseServices } from '../../services/db.service';
import * as d3 from 'd3';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-compare-lineplot',
    templateUrl: './compare.lineplot.component.html',
    styleUrls: ['compare.lineplot.component.scss']
})
export class CompareLinePlotComponent implements AfterViewInit, OnChanges {
    constructor() {}


    ngAfterViewInit(): void {}
    ngOnChanges(changes: SimpleChanges): void {}
}
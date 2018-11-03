import { Component, PLATFORM_ID, Input, Inject, AfterViewInit, ElementRef, ViewChild, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { SkillLevel } from '../../lists/skill.level';
import { DatabaseServices } from '../../services/db.service';
import * as d3 from 'd3';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-compare-scatterplot',
    templateUrl: './compare.scatterplot.component.html',
    styleUrls: ['compare.scatterplot.component.scss']
})
export class CompareScatterPlotComponent implements AfterViewInit, OnChanges {
    constructor() {}


    ngAfterViewInit(): void {}
    ngOnChanges(changes: SimpleChanges): void {}
}
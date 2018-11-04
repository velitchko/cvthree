import { Component, PLATFORM_ID, Input, Inject, AfterViewInit, ElementRef, ViewChild, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { SkillLevel } from '../../lists/skill.level';
import { CompareService } from '../../services/compare.service';
import { DatabaseServices } from '../../services/db.service';
import * as d3 from 'd3';
import { BehaviorSubject, config } from 'rxjs';

@Component({
    selector: 'app-compare-scatterplot',
    templateUrl: './compare.scatterplot.component.html',
    styleUrls: ['compare.scatterplot.component.scss']
})
export class CompareScatterPlotComponent implements OnChanges {
    @Input() data: any;

    constructor(private cs: CompareService) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes) {
            console.log('changes');
            console.log(changes);
            if(this.data) {
                this.drawScatterPlot('#scatter-plot', this.data);
            }
        }
    }

    drawScatterPlot(id: string, d: any, options?: any): void {
        d3.select(id).select('svg').remove(); 
        let cfg = {
            radius: 0,
            w: 600,
            h: 600,
            factor: 1,
            factorLegend: .85,
            levels: 20,
            maxValue: 0,
            radians: 2 * Math.PI,
            opacityArea: 0.5,
            ToRight: 5,
            TranslateX: 150,
            TranslateY: 50,
            ExtraWidthX: 100,
            ExtraWidthY: 100,
           };

        if('undefined' !== typeof options){
            for(let i in options){
                if('undefined' !== typeof options[i]){
                cfg[i] = options[i];
                }
            }
        }

        let g = d3.select(id)
            .append('svg')
            .attr('width', cfg.w + cfg.ExtraWidthX)
            .attr('height', cfg.h + cfg.ExtraWidthY)
            .append('g')
            .attr('transform', 'translate(' + cfg.TranslateX + ',' + cfg.TranslateY + ')');
        let axis = d3.scaleLinear().range([0, cfg.w + cfg.ExtraWidthX])

        let axisBottom = d3.axisBottom(axis).ticks(5);

        g.append('g').attr('class', 'axis--bottom')
        .attr('transform','translate(0, ' + cfg.h + cfg.ExtraWidthY + ')').call(axisBottom);

        
    }
}
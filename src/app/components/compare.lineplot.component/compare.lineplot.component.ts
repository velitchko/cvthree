import { Component, PLATFORM_ID, Input, Inject, AfterViewInit, ElementRef, ViewChild, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { SkillLevel } from '../../lists/skill.level';
import { Resume } from '../../models/resume';
import { DatabaseServices } from '../../services/db.service';
import * as d3 from 'd3';
import { CompareService } from '../../services/compare.service';
import { BehaviorSubject } from 'rxjs';
import { svg } from 'leaflet';

@Component({
    selector: 'app-compare-lineplot',
    templateUrl: './compare.lineplot.component.html',
    styleUrls: ['compare.lineplot.component.scss']
})
export class CompareLinePlotComponent implements OnChanges {
    @Input() data: any;
    @Output() selectedResume: EventEmitter<string>;
    constructor(private cs: CompareService) {
        this.selectedResume = new EventEmitter<string>();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes) {
            console.log('changes');
            console.log(changes);
            if(this.data) {
                this.drawScatterPlot('#line-plot', this.data);
            }
        }
    }

    normalizeSkillLevel(level: number): number {
        switch(level) {
            case 1: return 0.2;
            case 2: return 0.4;
            case 3: return 0.6;
            case 4: return 0.8;
            case 5: return 1;
        }
    }

    drawScatterPlot(id: string, d: any, options?: any): void {
        let yCoords = new Map<number, number>();
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
            TranslateX: 50,
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
        let xScale = d3.scaleLinear().domain([0.2, 1]).range([0, cfg.w])

        let axisBottom = d3.axisBottom(xScale).tickFormat((d: any) => {
            switch(d) {
                case 0.2: return 'BASIC';
                case 0.4: return 'NOVICE';
                case 0.6: return 'INTERMEDIATE';
                case 0.8: return 'ADVANCED';
                case 1: return 'EXPERT';
            }
            
        }).ticks(5);
        let pictures = g.append('g').attr('class', 'pictures');
        let skills = [];
        this.data.forEach((d: any) => {
            skills.push(d[0]);
            return;
        });
    
        skills.forEach((skill: any) => {  
           g.append('svg:defs')
            .append('svg:pattern')
            .attr('id', skill.resumeID)
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('patternContentUnits', 'objectBoundingBox')
            .attr('viewBox', '0 0 1 1')
            .append('svg:image')
            .attr('xlink:href', () => {
                return this.cs.getResume(this.cs.getResumes().map((r: Resume) => { return r.id; }).indexOf(skill.resumeID)).profilePicture;
            })
            .attr('width', 1)
            .attr('height', 1)
            .attr('preserveAspectRatio', 'xMidYMid slice')
            .attr('x', 0)
            .attr('y', 0);

            pictures.append('g')
                    .attr('class', 'picture')
                    .append('circle')
                    .attr('r', 25)
                    .attr('cx', () => { 
                        return xScale(this.normalizeSkillLevel(skill.value));
                    })
                    .attr('cy', () => {
                        let y = (cfg.h - cfg.ExtraWidthY);
                        let x = xScale(this.normalizeSkillLevel(skill.value));
                        if( yCoords.has(x)) {
                            let newY = y - 30 - (60*yCoords.get(x));
                            yCoords.set(x, (yCoords.get(x)+1));
                            return newY;
                        } else {
                            yCoords.set(x, 1);
                            return y -30;
                        }
                    })
                     .attr('fill', (d: any) => {
                        return `url(#${skill.resumeID})`;
                    })
                    .style('stroke', () => {
                        return this.cs.getColorForResume(skill.resumeID);
                    })
                    .style('stroke-width', '5')
                    .on('mouseover', () => {
                        this.selectedResume.emit(skill.resumeID);
                    });
                    // .attr('transform', 'translate(' + xScale(skill.value) + ', ' + (cfg.h - cfg.ExtraWidthX - 100) + ')')
        });

        g.append('g').attr('class', 'axis-bottom').attr('width', cfg.w)
        .attr('transform','translate(0, ' + (cfg.h - cfg.ExtraWidthY) + ')').call(axisBottom);       
    }
}
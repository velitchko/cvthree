import { Component, PLATFORM_ID, Input, Inject, AfterViewInit, ElementRef, ViewChild, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { SkillLevel } from '../../lists/skill.level';
import { CompareService } from '../../services/compare.service';
import * as d3 from 'd3';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-compare-scatterplot',
    templateUrl: './compare.scatterplot.component.html',
    styleUrls: ['compare.scatterplot.component.scss']
})
export class CompareScatterPlotComponent implements AfterViewInit, OnChanges {
    @Input() data: any;
    @Output() selectedResume: EventEmitter<string>;

    @ViewChild('scatterplot') scatter: ElementRef;
    private scatterHTML: HTMLElement;


    // d3 svg things
    private items: any;
    private svg: any;
    private tooltip: any;

    constructor(@Inject(PLATFORM_ID) private platformId: Object,
        private cs: CompareService) {
        this.selectedResume = new EventEmitter<string>();
    }

    ngAfterViewInit(): void {
        // start d3 drawing
        if (isPlatformBrowser(this.platformId)) {
            this.scatterHTML = this.scatter.nativeElement;
            // this.createScatterPlot();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.data.currentValue.length !== 0) {
            if (isPlatformBrowser(this.platformId)) {
                this.clearScatterPlot();

                this.scatterHTML = this.scatter.nativeElement;
                this.createScatterPlot();
            }
        }
    }

    getSkillAsText(level: number): string {
        if(level === 0) return '';
        return SkillLevel[level];
    }

    clearScatterPlot(): void {
        // this.svg.selectAll('*').remove();
        d3.select('svg').remove();
    }

    createScatterPlot(): void {
        let margin = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 120 // because of labels
        };

        let width = 700;
        let height = 500;

        this.svg = d3.select(this.scatterHTML)
            .append('svg')
            .attr('height', height)
            .attr('width', width);

        let x = d3.scaleLinear().range([margin.left, width - margin.right - margin.left]);
        let y = d3.scaleLinear().range([height - margin.top - margin.bottom, margin.top]);

        let extentX = d3.extent([1, 5]);
        let extentY = d3.extent([1, 5]);
        let xAxisLabel = this.data[0][0].area;
        let yAxisLabel = this.data[0][1].area;
        x.domain(extentX);
        y.domain(extentY);

        let axisX = d3.axisBottom(x).ticks(5).tickFormat((d: any) => {
            return this.getSkillAsText(d);
        });
        let axisY = d3.axisLeft(y).ticks(5).tickFormat((d: any) => {
            return this.getSkillAsText(d);
        });

        this.svg.append('g')
            .attr('id', 'axis_x')
            .attr('transform', 'translate(0,' + (height - margin.top - margin.bottom) + ')')
            .call(axisX);

        this.svg.append('g')
            .attr('id', 'axis_y')
            .attr('transform', 'translate(' + (margin.left / 2) + ', 0)')
            .call(axisY);

        this.data.forEach((d: any) => {
            this.svg.append('svg:defs')
                .append('svg:pattern')
                .attr('id', d[0].resumeID)
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('patternContentUnits', 'objectBoundingBox')
                .attr('viewBox', '0 0 1 1')
                .append('svg:image')
                .attr('xlink:href', () => {
                    return this.cs.getResumeByID(d[0].resumeID).profilePicture;
                })
                .attr('width', 1)
                .attr('height', 1)
                .attr('preserveAspectRatio', 'xMidYMid slice')
                .attr('x', 0)
                .attr('y', 0);
        });

        this.tooltip = d3.select('body').append('div')
            .attr('class', 'scatter-tooltip')
            .style('opacity', 0);

        d3.select('#axis_x')
            .append('text')
            .attr('transform', `translate(${width - margin.left - margin.right}, -10)`)
            .text(xAxisLabel);

        d3.select('#axis_y')
            .append('text')
            .attr('transform', `translate(${2*margin.right}, 15)`)
            .text(yAxisLabel);

        this.items = this.svg.append('g')
            .attr('transform', `translate(0, ${margin.top})`)
            .selectAll('circle')
            .data(this.data)
            .enter()
            .append('circle')
            .attr('r', 20)
            .attr('class', 'scatter-point')
            .attr('id', (d: any) => { 
                return d[0].resumeID; 
            })
            .attr('cx', (d: any) => {
                let xVal;
                d.forEach((_d: any) => {
                    if(_d.area === xAxisLabel) {
                        xVal = _d.value;
                    }
                });
                return x(+xVal) - 20; 
            }) // add half of height 
            .attr('cy', (d: any) => { 
                let yVal;
                d.forEach((_d: any) => {
                    if(_d.area === yAxisLabel) {
                        yVal = _d.value;
                    }
                })
                return y(+yVal) - 20; 
            }) // add half of width
            .attr('fill', (d: any) => {
                return `url(#${d[0].resumeID})`;
            })
            .attr('stroke-width', '5')
            .attr('stroke', (d: any, i: any, n: any) => {
                return this.cs.getColorForResume(d[0].resumeID);
            })
            .on('mouseover', (d: any, i: any, n: any) => {
                let people = d3.selectAll('.scatter-point');
                people.transition().attr('opacity', 0.2);
                let selection = d3.select(n[i]);
                selection.transition().attr('opacity', 1);
                this.selectedResume.emit(d[0].resumeID);
                let personKnowledge = `<div>${d[0].name}</div>`;
                d.forEach((_d: any) => {
                    personKnowledge += `<div style="color: ${this.cs.getColorForResume(d[0].resumeID)};">${_d.area} - ${this.getSkillAsText(_d.value)}</div>`;
                })
                this.tooltip.html(personKnowledge)
                    .style('left', `${d3.event.pageX + 20}px`)
                    .style('top', `${d3.event.pageY - 20}px`)
                    .transition()
                    .duration(200) // ms
                    .style('opacity', 1) // started as 0!
            })
            // .on('mousemove', (d: any) => {
            //     this.tooltip.style('left', `${d3.event.pageX + 20}px`)
            //         .style('top', `${d3.event.pageY - 20}px`)
            // })
            .on('mouseout', () => {
                let people = d3.selectAll('.scatter-point');
                people.transition().attr('opacity', 1);
                this.selectedResume.emit('none');
                this.tooltip.transition().duration(200).style('opacity', 0);
            })
            .on('click', (d: any, i: any, n: any) => {
                let people = d3.selectAll('.scatter-point');
                people.transition().attr('opacity', 0.2);
                let selection = d3.select(n[i]);
                selection.transition().attr('opacity', 1);
                this.selectedResume.emit(d[0].resumeID);
            });
    }
}
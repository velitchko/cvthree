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
    private overlaps: any;
    private overlappingItems: any; 
    private margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 120 // because of labels
    };
    private x: any;
    private y: any;

    constructor(@Inject(PLATFORM_ID) private platformId: Object,
        private cs: CompareService) {
        this.selectedResume = new EventEmitter<string>();
        this.cs.currentlySelectedResume.subscribe((selection: any) => {
            if(selection) {
                this.highlightNode(selection);
            }
        });
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
                this.checkForOverlap();
                this.scatterHTML = this.scatter.nativeElement;
                this.createScatterPlot();
            }
        }
    }

    highlightNode(selection: string): void {
        if(selection === 'none') {
            d3.selectAll('.scatter-point').transition().attr('opacity', 1).attr('stroke', '#d4d8da');
            return;
        }

        d3.selectAll('.scatter-point').transition().attr('opacity', 0.2);

        // d3.select(`#${selection}`).transition().attr('opacity', 1);
        d3.selectAll('.scatter-point').each((d: any, i: any, n: any) => {
            let node = d3.select(n[i]);
            if(node.attr('id').split(',').includes(selection)) {
                node.transition()
                .attr('stroke', this.cs.getColorForResume(selection))
                .attr('opacity', 1);
                return;
            }
        });
    }

    checkForOverlap(): void {
        let overlaps = new Map<string, Array<any>>();

        for(let i = 0; i < this.data.length; i++) {
            for(let j = i + 1; j < this.data.length; j++) {
                let outPoint = this.data[i];
                let inPoint = this.data[j];
                if(outPoint[0].value === inPoint[0].value && outPoint[1].value === inPoint[1].value) {
                    outPoint.hasOverlap = true;
                    inPoint.hasOverlap = true;
                    let string = `${outPoint[0].value}.${outPoint[1].value}`;
                    if(overlaps.has(string)) {
                        let resArr = overlaps.get(string);
                        if(!resArr.map((r: any) => { return r.resume.id }).includes(inPoint.resume.id) && 
                           !resArr.map((r: any) => { return r.resume.id }).includes(outPoint.resume.id)) {
                         resArr.push(inPoint);
                         resArr.push(outPoint);
                     }
                    } else {
                        overlaps.set(string, new Array<any>(inPoint, outPoint))
                    }
                }
            }
        }

        this.overlaps = overlaps;
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

        let width = 700;
        let height = 500;

        this.svg = d3.select(this.scatterHTML)
            .append('svg')
            .attr('height', height)
            .attr('width', width);

        this.x = d3.scaleLinear().range([this.margin.left, width - this.margin.right - this.margin.left]);
        this.y = d3.scaleLinear().range([height - this.margin.top - this.margin.bottom, this.margin.top]);

        let extentX = d3.extent([1, 5]);
        let extentY = d3.extent([1, 5]);
        let xAxisLabel = this.data[0][0].area;
        let yAxisLabel = this.data[0][1].area;
        this.x.domain(extentX);
        this.y.domain(extentY);

        let axisX = d3.axisBottom(this.x).ticks(5).tickFormat((d: any) => {
            return this.getSkillAsText(d);
        });
        let axisY = d3.axisLeft(this.y).ticks(5).tickFormat((d: any) => {
            return this.getSkillAsText(d);
        });

        this.svg.append('g')
            .attr('id', 'axis_x')
            .attr('transform', 'translate(0,' + (height - this.margin.top - this.margin.bottom) + ')')
            .call(axisX);

        this.svg.append('g')
            .attr('id', 'axis_y')
            .attr('transform', 'translate(' + (this.margin.left / 2) + ', 0)')
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
            .attr('transform', `translate(${width - this.margin.left - this.margin.right}, -10)`)
            .text(xAxisLabel);

        d3.select('#axis_y')
            .append('text')
            .attr('transform', `translate(${2*this.margin.right}, 15)`)
            .text(yAxisLabel);

        this.items = this.svg.append('g')
            .attr('transform', `translate(0, ${this.margin.top})`)
            .selectAll('circle')
            .data(this.data.filter((p: any) => { return !p.hasOverlap; }))
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
                return this.x(+xVal) - 20; 
            }) // add half of height 
            .attr('cy', (d: any) => { 
                let yVal;
                d.forEach((_d: any) => {
                    if(_d.area === yAxisLabel) {
                        yVal = _d.value;
                    }
                })
                return this.y(+yVal) - 20; 
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
            .on('mousemove', (d: any) => {
                this.tooltip.style('left', `${d3.event.pageX + 20}px`)
                    .style('top', `${d3.event.pageY - 20}px`)
            })
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
        
            let g = this.svg.append('g');
            this.overlappingItems = g.attr('transform', `translate(0, ${this.margin.top})`);
            this.overlaps.forEach((v ,k) => {
                this.overlappingItems
                .append('circle')
                .attr('class', 'scatter-point')
                .attr('r', 20)
                .attr('id', () => {
                    let ids = ``;
                    v.forEach((p: any) => {
                        ids += `${p[0].resumeID},`
                    });
                    return ids;
                })
                .attr('cx', () => {
                    return this.x(+k.split('.')[1]) + 20;
                }) // add half of height 
                .attr('cy', () => {
                    return this.y(+k.split('.')[0]) - 20;
                }) // add half of width
                .attr('fill', '#f2f2f2')
                .attr('stroke-width', 4)
                .attr('stroke', '#d4d8da')
                .on('mouseover', (d: any, i: any, n: any) => {
                    let html = '';
                    v.forEach((pers: any) => {
                        let resume = this.cs.getResumeByID(pers[0].resumeID);
                        html += `
                            <div class="scatterplot-cluster-point">
                                <img class="scatterplot-profile-pic" src=${resume.profilePicture} style="border-color: ${this.cs.getColorForResume(resume.id)};">
                                <p>${resume.firstName} ${resume.lastName} : ${pers[0].area} | ${this.getSkillAsText(pers[0].value)}, ${pers[1].area} | ${this.getSkillAsText(pers[1].value)}</p>
                            </div>
                        `;
                    });
                    this.tooltip.html(html)
                    .style('left', `${d3.event.pageX + 20}px`)
                    .style('top', `${d3.event.pageY - 20}px`)
                    .transition()
                    .duration(200) // ms
                    .style('opacity', 1) // started as 0!
                })
                .on('mouseout', (d: any, i: any, n: any) => {
                    d3.select(n[i])
                    .transition()
                    .duration(250)
                    .attr('stroke', '#d4d8da');
                    this.tooltip.transition().duration(200).style('opacity', 0);
                });
               
               
                g.append('text')
                .attr('class', 'all')
                .attr('x', () => {
                    return this.x(+k.split('.')[1]) + 15;
                }) // add half of height 
                .attr('y', () => {
                    return this.y(+k.split('.')[0]) - 15;
                }) // add 
                .text(v.length);

            this.overlappingItems.merge(this.overlappingItems);
            });
    }
    
}
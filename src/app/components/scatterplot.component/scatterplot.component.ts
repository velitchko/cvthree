import { Component, PLATFORM_ID, Input, Inject, AfterViewInit, ElementRef, ViewChild, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { SkillLevel } from '../../lists/skill.level';
import { DatabaseServices } from '../../services/db.service';
import * as d3 from 'd3';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-scatterplot',
    templateUrl: './scatterplot.component.html',
    styleUrls: ['scatterplot.component.scss']
})
export class ScatterPlotComponent implements AfterViewInit, OnChanges {
    @Input() points: any;
    @Output() selection: EventEmitter<Array<string>>;

    private selectedItems: Array<string>;

    @ViewChild('scatterplot') scatter: ElementRef;
    private scatterHTML: HTMLElement;

    
    // d3 svg things
    private brush: any;
    private items: any;
    private svg: any;
    private tooltip: any;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        this.selection = new EventEmitter<Array<string>>();
    }

    ngAfterViewInit(): void {
        // start d3 drawing
        if (isPlatformBrowser(this.platformId)) {
            this.selectedItems = new Array<string>();
            this.scatterHTML = this.scatter.nativeElement;
            this.createScatterPlot();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log(this.points);
        if(!changes.points.firstChange) {
            if (isPlatformBrowser(this.platformId)) {
                this.clearScatterPlot();
                this.scatterHTML = this.scatter.nativeElement;
                this.createScatterPlot();
            }
        }
    }


    clearScatterPlot(): void {
        console.log(this.svg.selectAll('*'));
        this.svg.selectAll('*').remove();
        d3.select('svg').remove();
    }

    createScatterPlot(): void {
        let margin = {
            top: 20,
            right: 0,
            bottom: 50,
            left: 85
        };

        let width = 500;
        let height = 500;

        this.svg = d3.select(this.scatterHTML)
            .append('svg')
            .attr('height', height)
            .attr('width', width);

        let x = d3.scaleLinear().range([margin.left, width - margin.right - margin.left]);
        let y = d3.scaleLinear().range([height - margin.top - margin.bottom, margin.top]);

        let xArr = [];
        this.points.forEach((p: any) => { xArr.push(p.bonus); });
        let extentX = d3.extent(xArr);
        let extentY = d3.extent([1, 10]);

        x.domain(extentX);
        y.domain(extentY);

        let axisX = d3.axisBottom(x);
        let axisY = d3.axisLeft(y);

        this.svg.append('g')
            .attr('id', 'axis_x')
            .attr('transform', 'translate(0,' + (height - margin.top - margin.bottom + margin.bottom / 2) + ')')
            .call(axisX);

            this.svg.append('g')
            .attr('id', 'axis_y')
            .attr('transform', 'translate(' + (margin.left / 2) + ', 0)')
            .call(axisY);

        this.points.forEach((d: any) => {
            this.svg.append('svg:defs')
                .append('svg:pattern')
                .attr('id', d.resume.id)
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('patternContentUnits', 'objectBoundingBox')
                .attr('viewBox', '0 0 1 1')
                .append('svg:image')
                .attr('xlink:href', d.resume.profilePicture)
                .attr('width', 1)
                .attr('height', 1)
                .attr('preserveAspectRatio', 'xMidYMid slice')
                .attr('x', 0)
                .attr('y', 0);
        });

        this.brush = d3.brush()
                       .on('brush', this.brushItems())
                       .on('end', this.brushEnd());
        // .on('end', this.displayTable(this));

        this.svg.append('g').call(this.brush);
        
        this.tooltip = d3.select('body').append('div')
                            .attr('class', 'tooltip')
                            .style('opacity', 0);

        d3.select('#axis_x')
            .append('text')
            .attr('transform', 'translate(360, -10)')
            .text('Contextual knowledge score');

        d3.select('#axis_y')
            .append('text')
            .attr('transform', 'rotate(-90) translate(-20, 15)')
            .text('Base score');

        this.items = this.svg.append('g')
            .attr('transform', `translate(0, ${margin.top})`)
            .selectAll('circle')
            .data(this.points)
            .enter()
            .append('circle')
            .attr('r', 20)
            .attr('id', (d: any) => { return d.resume.id; })
            .attr('cx', (d: any) => { return x(+d.bonus) + 20; }) // add half of height 
            .attr('cy', (d: any) => { return y(+d.base) - 20; }) // add half of width
            .attr('fill', (d: any) => {
                return `url(#${d.resume.id})`;
            })
            .attr('class', 'non_brushed')
            .on('mouseover', (d: any) => {
                this.tooltip.html(`${d.base}, ${d.bonus}`)
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
                this.tooltip.transition().duration(200).style('opacity', 0);
            })
            .on('click', (d: any, i: any, n: any) => {
                if(!d3.event.ctrlKey || !d3.event.shiftKey) {
                    d3.select(n[i]).attr('class', 'brushed');
                    this.selectedItems.push(d.resume.id);
                }
                // ctrl + click to add element to    selection
                if(d3.event.ctrlKey && !d3.event.shiftKey) {
                    // d3.select(d).attr('class', 'brushed');
                    d3.select(n[i]).attr('class', 'brushed');
                    this.selectedItems.push(d.resume.id);
                }
                // ctrl + shift click to remove element from selection
                if(d3.event.ctrlKey && d3.event.shiftKey) {
                    d3.select(n[i]).attr('class', 'non_brushed');
                    this.selectedItems.splice(this.selectedItems.indexOf(d.resume.id) , 1);
                }
                this.selection.emit(this.selectedItems);
            });

     
    }

    brushItems(): (d, i) => void {
        return (d,i) => {
            this.items.attr("class", "non_brushed");
                
            let selection = d3.event.selection;  
            if(!selection) return;
            
            let x0 = selection[0][0],
                x1 = selection[1][0],
                y0 = selection[0][1],
                y1 = selection[1][1];

            this.items.filter(function() {
                let cx = d3.select(this).attr('cx');
                let cy = d3.select(this).attr('cy');
                return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
            }).attr('class', 'brushed');
        }
    }

    brushEnd(): (d, i) => void {
        return (d, i) => {
            let items = d3.selectAll('.brushed').data().map((r: any) => { return r.resume.id });
            this.selectedItems = items;
            this.selection.emit(this.selectedItems);
        }
    }
}
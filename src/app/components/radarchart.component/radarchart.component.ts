import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges  } from '@angular/core';
import { DatabaseServices } from '../../services/db.service';
import { Resume } from '../../models/resume';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { UtilServices } from '../../services/util.service';
import { CompareService } from '../../services/compare.service';
import { SkillLevel } from '../../lists/skill.level';
import * as d3 from 'd3';

@Component({
  selector: 'app-radarchart',
  templateUrl: './radarchart.component.html',
  styleUrls: ['radarchart.component.scss']
})

export class RadarChartComponent implements OnChanges {
    @Input() data: any;
    private config = {
      w: 600,
      h: 600,
      maxValue: 100,
      levels: 5,
      ExtraWidthX: 100
    };
    constructor(private cs: CompareService) {
     
    }
    ngOnChanges(changes: SimpleChanges): void {
      if(changes) {
        console.log('changes');
        console.log(changes);
        if(this.data) {
          this.drawRadarChart('#chart', this.data, this.config);
        }
      }
    }

    getSkillAsText(level: number): string {
        return SkillLevel[level];
    }

    drawRadarChart(id: string, d: any, options: any): void {
        console.log('redraw');
        let initialData = d;
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
        
        cfg.maxValue = 100;
        if(!d[0]) return; // data isn't structured correctly
        let allAxis = d[0].map((i, j) => { return i.area; });
        let total = allAxis.length;
    
        d3.select(id).select('svg').remove();
    
        let g = d3.select(id)
            .append('svg')
            .attr('width', cfg.w+cfg.ExtraWidthX)
            .attr('height', cfg.h+cfg.ExtraWidthY)
            .append('g')
            .attr('transform', 'translate(' + cfg.TranslateX + ',' + cfg.TranslateY + ')');
    
        let series = 0;
    
        let axis = g.selectAll('.axis')
            .data(allAxis)
            .enter()
            .append('g')
            .attr('class', 'axis');
        
        axis.append('line')
          .attr('x1', cfg.w/2)
          .attr('y1', cfg.h/2)
          .attr('x2', (d, i) => { return cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total)); })
          .attr('y2', (d, i) => { return cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total)); })
          .attr('class', 'line')
          .style('stroke', 'black')
          .style('stroke-width', '2px');
        
    
        axis.append('text')
          .attr('class', 'legend')
          .text((d: any) => { return d; })
          .style('font-family', 'sans-serif')
          .style('font-size', '11px')
          .attr('text-anchor', 'middle')
          .attr('dy', '1.5em')
          .attr('transform', (d, i) => { return 'translate(0, -10)'; })
          .attr('x', (d, i) => { return cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-60*Math.sin(i*cfg.radians/total); })
          .attr('y', (d, i) => { return cfg.h/2*(1-Math.cos(i*cfg.radians/total))-20*Math.cos(i*cfg.radians/total); });
    
     
        d.forEach((y, x) => {
          let dataValues = [];
          g.selectAll('.nodes')
           .data(y, (j: any, i: any): any => {
            // console.log(j, i);
            let value = (j.value - j.minValue) / (j.maxValue - j.minValue) * 100;
            dataValues.push([
                cfg.w/2*(1-(parseFloat(Math.max(value, 0).toString())/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)), 
                cfg.h/2*(1-(parseFloat(Math.max(value, 0).toString())/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
            ]);
          });
          dataValues.push(dataValues[0]);
          g.selectAll('.area')
                 .data([dataValues])
                 .enter()
                 .append('polygon')
                 .attr('class', 'radar-chart-serie' + series)
                 .style('stroke-width', '2px')
                 .style('stroke', () => { 
                     console.log(y[0]);
                     console.log(this.cs.getColorForResume(y[0].resumeID));
                     return this.cs.getColorForResume(y[0].resumeID);
                    //  return this.cs.getColorForResume(); 
                    })
                 .attr('points',(d) => {
                   let str = '';
                   for(let pti = 0; pti < d.length; pti++){
                     str = str + d[pti][0] + ',' + d[pti][1] + ' ';
                   }
                   return str;
                  })
                 .style('fill', () => { return this.cs.getColorForResume(y[0].resumeID); })
                 .style('fill-opacity', cfg.opacityArea)
                 .on('mouseover', function() {
                          let z = 'polygon.' + d3.select(this).attr('class');
                          g.selectAll('polygon')
                           .transition()
                           .style('fill-opacity', 0.1); 
                          g.selectAll(z)
                           .transition()
                           .style('fill-opacity', .7);
                          })
                 .on('mouseout', () => {
                          g.selectAll('polygon')
                           .transition()
                           .style('fill-opacity', cfg.opacityArea);
                 });
          series++;
        });
        series = 0;
        
        let axis2 = g.selectAll('.axis2')
            .data(allAxis)
            .enter()
            .append('g')
            .attr('class', 'axis2');
    
    let tooltip = d3.select('body').append('div').attr('class', 'toolTip');
        axis2.append('line')
          .attr('x1', cfg.w/2)
          .attr('y1', cfg.h/2)
          .attr('x2', (d, i) => { return cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total)); })
          .attr('y2', (d, i) => { return cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total)); })
          .attr('class', 'line')
          .style('stroke', 'transparent')
          .style('stroke-width', '10px')
        .on('mouseover', (d) => {
          let html = '<div>';
              for(let i = 0; i < initialData.length; i++){
              let propertyData = initialData[i];
              for(let j = 0; j < propertyData.length; j++){
                let grade = propertyData[j];
                if (grade.area == d){
                  html += '<div>' + grade.name + ': ' + this.getSkillAsText(grade.value) + '</div>';
                }
              }
            }
              html += '</div>';
                tooltip
                  .style('left', d3.event.pageX - 80 + 'px')
                  .style('top', d3.event.pageY - 80 + 'px')
                  .style('display', 'inline-block')
                  .html(html);
                })
            .on('mouseout', (d) => { tooltip.style('display', 'none');});
    
        }
}
    
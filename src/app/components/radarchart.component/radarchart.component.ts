import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
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
  @Output() selectedResume: EventEmitter<string>;
  private config = {
    w: 600,
    h: 600,
    maxValue: 100,
    levels: 5,
    ExtraWidthX: 100
  };
  constructor(private cs: CompareService) {
    this.selectedResume = new EventEmitter<string>();
    this.cs.currentlySelectedResume.subscribe((selection: any) => {
      if (selection) {
        this.highlightArea(selection);
      }
    })
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes && this.data) {
      this.drawRadarChart('#chart', this.data); // this.config
    }
  }

  getSkillAsText(level: number): string {
    return SkillLevel[level];
  }

  highlightArea(selection: string): void {
    // deselect all other polygons
    d3.selectAll('polygon')
      .transition()
      .style('fill-opacity', 0.1);
    // highlight selected
    let area = d3.select(`[id="${selection}"]`);
    area.transition()
      .style('fill-opacity', .7);
  }

  drawRadarChart(id: any, data: any): void {
    // sort data so things are aligned
    data.forEach((d) => {
      d.sort((a, b) => { return a.area > b.area ? 1 : -1; });
    });

    let margin = {
      top: 20,
      bottom: 20,
      left: 30,
      right: 30
    };
    let cfg = {
      radius: 6,
      w: 650,
      h: 650,
      factor: 1,
      factorLegend: .85,
      levels: 5,
      maxValue: 0,
      radians: 2 * Math.PI,
      ToRight: 5,
      TranslateX: 10,
      TranslateY: 20,
    };

    cfg.maxValue = Math.max(cfg.maxValue, parseFloat(d3.max(data, (i: any) => {
      return d3.max(i.map((o: any) => {
        return o.value;
      }));
    })));
    let allAxis = (data[0].map((i: any) => {
      return i.area;
    }));
    let total = allAxis.length;
    let radius = cfg.factor * Math.min((cfg.w - margin.right - margin.left) / 2, (cfg.h - margin.top - margin.bottom) / 2);

    let svg = d3.select(id).select('svg'),
      polyPoints = [];
    if (svg.node()) {
      svg.selectAll('polygon').each((d: any, i: any, n: any) => {
        polyPoints.push(d3.select(n[i]).attr('points'));
      });
      svg.remove();
    }

    let g = d3.select(id)
      .append('svg')
      .attr('width', cfg.w - margin.left - margin.right)
      .attr('height', cfg.h - margin.top - margin.bottom)
      .attr('class', 'graph-svg-component')
      .append('g')
      .attr('transform', 'translate(' + cfg.TranslateX + ',' + cfg.TranslateY + ')');

    // Circular segments
    for (let j = 1; j <= cfg.levels; j++) {
      let levelFactor = cfg.factor * radius * (j / cfg.levels);
      g.selectAll('.levels')
        .data(allAxis)
        .enter()
        .append('svg:line')
        .attr('x1', (d: any, i: any) => { return levelFactor * (1 - cfg.factor * Math.sin(i * cfg.radians / total)); })
        .attr('y1', (d: any, i: any) => { return levelFactor * (1 - cfg.factor * Math.cos(i * cfg.radians / total)); })
        .attr('x2', (d: any, i: any) => { return levelFactor * (1 - cfg.factor * Math.sin((i + 1) * cfg.radians / total)); })
        .attr('y2', (d: any, i: any) => { return levelFactor * (1 - cfg.factor * Math.cos((i + 1) * cfg.radians / total)); })
        .attr('class', 'line')
        .style('stroke', 'grey')
        .style('stroke-opacity', '0.75')
        .style('stroke-width', '0.5px')
        .attr('transform', 'translate(' + ((cfg.w - margin.left - margin.right) / 2 - levelFactor) + ', ' + ((cfg.h - margin.top - margin.bottom) / 2 - levelFactor) + ')');
    }

    // Text indicating at what % each level is
    for (let j = 1; j <= cfg.levels; j++) {
      let levelFactor = cfg.factor * radius * (j / cfg.levels);
      g.selectAll('.levels')
        .data([1]) //dummy data
        .enter()
        .append('svg:text')
        .attr('x', (d: any) => { return levelFactor * (1 - cfg.factor * Math.sin(0)); })
        .attr('y', (d: any) => { return levelFactor * (1 - cfg.factor * Math.cos(0)); })
        .attr('class', 'legend')
        .attr('transform', 'translate(' + ((cfg.w - margin.right - margin.left) / 2 - levelFactor + cfg.ToRight) + ', ' + ((cfg.h - margin.top - margin.bottom) / 2 - levelFactor) + ')')
        .attr('fill', '#737373')
        .text(this.getSkillAsText(j));
    }

    let series = 0;
    let tooltip = d3.select('body').append('div').attr('class', 'toolTip');
    let axis = g.selectAll('.axis')
      .data(allAxis)
      .enter()
      .append('g')
      .attr('class', 'axis')
      .on('mouseover', (d: any) => {
        let html = '';
        let map = new Map<string, number>();
        for (let i = 0; i < data.length; i++) {
          let propertyData = data[i];
          for (let j = 0; j < propertyData.length; j++) {
            let grade = propertyData[j];
            if (grade.area === d) map.set(grade.resumeID, grade.value);
          }
        }
        let sortedMap = new Map<string, number>([...map.entries()].sort((a, b) => { return b[1] - a[1]; }));
        sortedMap.forEach((v: any, k: any) => {
          html += `<div style='color: ${this.cs.getColorForResume(k)};'>${this.cs.getResumeByID(k).firstName} ${this.cs.getResumeByID(k).lastName} : ${v === '' ? 'No knowledge provided.' : this.getSkillAsText(v)}</div>`;
        });
        tooltip
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY + 'px')
          .style('display', 'inline-block')
          .html(html);
      })
      .on('mouseout', () => {
        tooltip.style('display', 'none');
      });

    axis.append('line')
    .attr('x1', (cfg.w - margin.left - margin.right) / 2)
    .attr('y1', (cfg.h - margin.top - margin.bottom) / 2)
    .attr('x2', (d, i) => { return (cfg.w - margin.left - margin.right) / 2 * (1 - cfg.factor * Math.sin(i * cfg.radians / total)); })
    .attr('y2', (d, i) => { return (cfg.h - margin.top - margin.bottom) / 2 * (1 - cfg.factor * Math.cos(i * cfg.radians / total)); })
    .attr('class', 'line')
    .style('stroke', '#D4D8DA')
    .style('stroke-width', '2px');

    axis.append('text')
      .attr('class', 'legend')
      .text((d: any) => { return d; })
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .attr('transform', (d, i) => { return 'translate(0, -10)'; })
      .attr('x', (d, i) => { return (cfg.w - margin.left - margin.right) / 2 * (1 - cfg.factorLegend * Math.sin(i * cfg.radians / total)) - 60 * Math.sin(i * cfg.radians / total); })
      .attr('y', (d, i) => { return (cfg.h - margin.top - margin.bottom) / 2 * (1 - Math.cos(i * cfg.radians / total)) - 20 * Math.cos(i * cfg.radians / total); });

    data.forEach((y, x) => {
      let dataValues = [];
      g.selectAll('.nodes')
        .data(y, (j: any, i: any): any => {
          dataValues.push([
            (cfg.w - margin.right - margin.left) / 2 * (1 - (parseFloat(Math.max(j.value, 0).toString()) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total)),
            (cfg.h - margin.top - margin.bottom) / 2 * (1 - (parseFloat(Math.max(j.value, 0).toString()) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total))
          ]);
        });
      dataValues.push(dataValues[0]);

      g.selectAll('.area')
        .data([dataValues])
        .enter()
        .append('polygon')
        .attr('id', y[0].resumeID)
        .attr('points', (d: any) => {
          if (polyPoints[x])
            return polyPoints[x];
          else
            return d3.range(d.length).map(() => {
              return (cfg.w / 2) + ',' + (cfg.h / 2)
            }).join(' ');
        })
        .attr('class', 'radar-chart-series_' + series)
        .style('stroke-width', 2)
        .style('stroke', this.cs.getColorForResume(y[0].resumeID))
        .style('fill-opacity', .1)
        .on('mouseover', (d: any, i: any, n: any) => {
          this.selectedResume.emit(y[0].resumeID);
          let z = 'polygon.' + d3.select(n[i]).attr('class');
          // g.selectAll('polygon')
          //   .transition()
          //   .duration(250)
          //   .style('fill-opacity', .7);
          g.selectAll(z)
            .transition()
            .duration(250)
            .style('fill-opacity', .7);

        })
        .on('mouseout', () => {
          g.selectAll('polygon')
            .transition()
            .duration(250)
            .style('fill-opacity', .2);
            this.selectedResume.emit('none');
        })
        .transition()
        .duration(250)
        .attr('points', (d: any) => {
          let str = '';
          for (let pti = 0; pti < d.length; pti++) {
            str = str + d[pti][0] + ',' + d[pti][1] + ' ';
          }
          return str;
        })
        .style('fill', () => {
          return this.cs.getColorForResume(y[0].resumeID)
        })

      series++;
    });

    series = 0;

    data.forEach((y, x) => {
      let c = g.selectAll('.nodes')
        .data(y).enter()
        .append('svg:circle')
        .attr('class', 'radar-chart-series_' + series)
        .attr('r', cfg.radius)
        .attr('cx', (j: any, i: any) => {
          return (cfg.w - margin.left - margin.right) / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total));
        })
        .attr('cy', (j: any, i: any) => {
          return (cfg.h - margin.top - margin.bottom) / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total));
        })
        .attr('data-id', (j: any) => {
          return j.area;
        })
        .style('stroke-width', 2)
        .style('stroke', this.cs.getColorForResume(y[0].resumeID))
        .style('fill-opacity', 1)
        .style('fill', 'white')
 
      series++;
    });
  }
}

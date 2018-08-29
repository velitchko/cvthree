import { Inject, Component, AfterViewInit, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Resume } from '../../models/resume';
import { Skill } from '../../models/skill';
import { Language } from '../../models/language';
import { Work } from '../../models/work';
import { Education } from '../../models/education';
import { DatabaseServices } from '../../services/db.service';
import { UtilServices } from '../../services/util.service';
import { ActivatedRoute, Params  } from '@angular/router';
import * as d3 from 'd3';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['view.component.scss']
})
export class ViewComponent implements AfterViewInit {
  selectedId: string;
  resume: Resume;
  age: number;
  loading: boolean = true;

  @ViewChild('languages') languages: ElementRef;
  private languageHTML: HTMLElement;

  @ViewChild('skills') skills: ElementRef;
  private skillHTML: HTMLElement;

  @ViewChild('timeline') timeline: ElementRef;
  private timelineHTML: HTMLElement;

  constructor(
    private db: DatabaseServices,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID)
    private platformId: Object,
    private util: UtilServices
  ) {
    this.resume = new Resume();
    this.route.params.subscribe( (param: Params) => {
      this.selectedId = param['id'];
      this.db.getResume(this.selectedId).then((success: any) => {
        this.resume = success;
        this.age = this.util.getAge(this.resume.birthDay);
        this.loading = false;
      });
    });
  }

  ngAfterViewInit(): void {
    if(isPlatformBrowser(this.platformId)) {
      this.languageHTML = this.languages.nativeElement;
      this.createLanguages(this.resume.languages);
      this.createSkills(this.resume.skills);
      // this.createTimeline(this.resume.work, this.resume.education);
    }
  }
  createTimeline(work: Array<Work>, education: Array<Education>): void {}

  createLanguages(languages: Array<Language>): void {
    languages.forEach((l: any, idx: number) => {
      this.createDonut(l, idx);
    })
  }

  createSkills(skills: Array<Skill>): void {
    skills.forEach((s: any, idx: number) => {
      this.createBar(s, idx);
    });
  }

  createBar(skill: Skill, id: number): void {

  }

  createSunburst(): void {
    const width = window.innerWidth,
          height = window.innerHeight,
          maxRadius = (Math.min(width, height) / 2) - 5;

      const formatNumber = d3.format(',d');

      const x = d3.scaleLinear()
          .range([0, 2 * Math.PI])
          .clamp(true);

      const y = d3.scaleSqrt()
          .range([maxRadius*.1, maxRadius]);

      const color = d3.scaleOrdinal(d3.schemeSet3);

      const partition = d3.partition();

      const arc = d3.arc()
          .startAngle((d: any) => x(d.x0))
          .endAngle((d: any) => x(d.x1))
          .innerRadius((d: any) => Math.max(0, y(d.y0)))
          .outerRadius((d: any) => Math.max(0, y(d.y1)));

      const middleArcLine = d => {
          const halfPi = Math.PI/2;
          const angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
          const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);

          const middleAngle = (angles[1] + angles[0]) / 2;
          const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
          if (invertDirection) { angles.reverse(); }

          const path = d3.path();
          path.arc(0, 0, r, angles[0], angles[1], invertDirection);
          return path.toString();
      };

      const textFits = d => {
          const CHAR_SPACE = 6;

          const deltaAngle = x(d.x1) - x(d.x0);
          const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
          const perimeter = r * deltaAngle;

          return d.data.name.length * CHAR_SPACE < perimeter;
      };

      const svg = d3.select('body').append('svg')
          .style('width', '100vw')
          .style('height', '100vh')
          .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
          .on('click', () => focusOn()); // Reset zoom on canvas click

      d3.json('https://gist.githubusercontent.com/mbostock/4348373/raw/85f18ac90409caa5529b32156aa6e71cf985263f/flare.json', (error, root) => {
          if (error) throw error;

          root = d3.hierarchy(root);
          root.sum(d => d.size);

          const slice = svg.selectAll('g.slice')
              .data(partition(root).descendants());

          slice.exit().remove();

          const newSlice = slice.enter()
              .append('g').attr('class', 'slice')
              .on('click', d => {
                  d3.event.stopPropagation();
                  focusOn(d);
              });

          newSlice.append('title')
              .text((d: any) => d.data.name + '\n' + formatNumber(d.value));

          newSlice.append('path')
              .attr('class', 'main-arc')
              .style('fill', (d: any): any => color((d.children ? d : d.parent).data.name))
              .attr('d', <any>arc);

          newSlice.append('path')
              .attr('class', 'hidden-arc')
              .attr('id', (_, i) => `hiddenArc${i}`)
              .attr('d', middleArcLine);

          const text = newSlice.append('text')
              .attr('display', d => textFits(d) ? null : 'none');

          // Add white contour
          text.append('textPath')
              .attr('startOffset','50%')
              .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
              .text((d: any) => d.data.name)
              .style('fill', 'none')
              .style('stroke', '#fff')
              .style('stroke-width', 5)
              .style('stroke-linejoin', 'round');

          text.append('textPath')
              .attr('startOffset','50%')
              .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
              .text((d: any) => d.data.name);
      });

      function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
          // Reset to top-level if no data point specified

          const transition = svg.transition()
              .duration(750)
              .tween('scale', () => {
                  const xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                      yd = d3.interpolate(y.domain(), [d.y0, 1]);
                  return t => { x.domain(xd(t)); y.domain(yd(t)); };
              });

          transition.selectAll('path.main-arc')
              .attrTween('d', (d: any) => () => arc(d));

          transition.selectAll('path.hidden-arc')
              .attrTween('d', d => () => middleArcLine(d));

          transition.selectAll('text')
              .attrTween('display', d => () => textFits(d) ? null : 'none');

          this.moveStackToFront(svg, d);

          //


      }
  }

  moveStackToFront(svg, elD): void {
   svg.selectAll('.slice').filter(d => d === elD)
      .each(function(d) {
        this.parentNode.appendChild(this);
        if (d.parent) { this.moveStackToFront(svg, d.parent); }
      });
  }

  createDonut(language: Language, id: number): void {
    // maps languages proficiency to donut fill
    const skillLevel = {
			'A1' : 16.6666666667,
			'A2' : 33.3333333334,
			'B1' : 50.0000000001,
			'B2' : 66.6666666668,
			'C1' : 83.3333333335,
			'C2' : 100
		};

    // setup data in form of { language, proficiency }
    const dataset = [
      skillLevel[language.level],       // colored area
      100 - skillLevel[language.level]  // transparent area
    ];

    // donut dimensions
    const width = 250;
    const height = 250;
    const donutWidth = 75;
    const dataSize = 25;
    const duration = 750;
    const radius = Math.min(width, height) / 2;
    // color scheme
    const color = ['#00d1b2', '#c5f9f2'];
    // create SVG and append
    const svg = d3.select(this.languageHTML)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('class', `g-${id}`)
            .attr('transform', `translate(${width / 2}, ${height / 2})`);
    // load data into pie and append
    const arc = d3.arc()
             .outerRadius(radius - donutWidth + dataSize)
             .innerRadius(radius - donutWidth);
    // create angles
    const pie = d3.pie()
             .value((d: any) => d);
    // draw svg
    const path = svg.selectAll('path')
             .data(pie(dataset))
             .enter().append('path')
             .attr('d', <any>arc)
             .attr('fill', (d, i) => {
               return color[i];
             })
             .attr('class', 'arc')
             .transition()
             .delay((d, i) => {
               if(i === 1) return 0;
               return i * duration;
             })
             .duration((d,i ) => {
               if(i === 1) return 0;
               return duration;
             })
             .attrTween('d', (d: any) => {
                if(d.index === 1) return;
                let i = d3.interpolate(d.startAngle+0.1, d.endAngle);
                return (t: any) => {
                 d.endAngle = i(t);
                 return arc(d);
                }
            });
    // append text labels language name + proficiency
    const g = d3.select(`.g-${id}`)

    g.append('text')
     .attr('text-anchor', 'middle')
     .attr('fill', '#454647')
     .attr('font-size', '1.5em')
		 .attr('y', -5)
	   .text(language.name);

    g.append('text')
     .attr('text-anchor', 'middle')
     .attr('font-weight', 'bold')
     .attr('fill', '#454647')
     .attr('font-size', '2.5em')
     .attr('y', 35)
     .text(language.level);
    // http://zeroviscosity.com/d3-js-step-by-step/step-1-a-basic-pie-chart
  }
}

import { Inject, Component, AfterViewInit, PLATFORM_ID, ViewChild, ElementRef, KeyValueChanges, KeyValueDiffer, KeyValueDiffers } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Resume } from '../../models/resume';
import { Skill } from '../../models/skill';
import { Language } from '../../models/language';
import { Work } from '../../models/work';
import { Education } from '../../models/education';
import { DatabaseServices } from '../../services/db.service';
import { UtilServices } from '../../services/util.service';
import { ActivatedRoute, Params, Router  } from '@angular/router';
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
  private resumeDiff: KeyValueDiffer<string, any>;

  @ViewChild('languages') languages: ElementRef;
  private languageHTML: HTMLElement;

  @ViewChild('skills') skills: ElementRef;
  private skillHTML: HTMLElement;

  @ViewChild('timeline') timeline: ElementRef;
  private timelineHTML: HTMLElement;

  constructor(
    private db: DatabaseServices,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private util: UtilServices,
    private differs: KeyValueDiffers
  ) {
    this.resume = new Resume();
    this.resumeDiff = this.differs.find(this.resume).create();
    this.route.params.subscribe( (param: Params) => {
      this.selectedId = param['id'];
      this.db.getResume(this.selectedId).then((success: any) => {
        this.resume = success;
        this.age = this.util.getAge(this.resume.birthDay);
        this.loading = false;
      });
    });
  }

  ngDoCheck(): void {
      const changes = this.resumeDiff.diff(this.resume);
      if (changes && isPlatformBrowser(this.platformId)) {
        this.clearSVGs();
        this.createLanguages(this.resume.languages);
        this.createSkills(this.resume.skills);
      }
  }

  ngAfterViewInit(): void {
    if(isPlatformBrowser(this.platformId)) {
      this.languageHTML = this.languages.nativeElement;
      this.createLanguages(this.resume.languages);

      this.skillHTML = this.skills.nativeElement;
      this.createSkills(this.resume.skills);
      // this.createTimeline(this.resume.work, this.resume.education);
    }
  }

  edit(id: string): void {
    this.router.navigate(['/edit', id]);
  }

  clearSVGs(): void {
    if(isPlatformBrowser(this.platformId)) d3.selectAll('svg').remove();
  }


  createTimeline(work: Array<Work>, education: Array<Education>): void {}

  createLanguages(languages: Array<Language>): void {
    console.log('creating languages');
    languages.forEach((l: any, idx: number) => {
      this.createDonut(l, idx);
    })
  }

  createSkills(skills: Array<Skill>): void {
    // OLD VERSION - used barcharts
    // skills.forEach((s: any, idx: number) => {
    //   this.createBar(s, idx);
    // });
    //
    this.createSunburst(skills);
  }

  createBar(skills: Array<Skill>): void {
    // TODO should go through skills and add
    // size attribute to leaf nodes (=1)
    this.createSunburst(skills);
  }

  getSkillOpacity(level: string): string {
    switch(level) {
      case 'BASIC': return '33';
      case 'NOVICE': return '66';
      case 'INTERMEDIATE': return '99';
      case 'ADVANCED': return 'CC';
      case 'EXPERT': return 'FF';
      default: return 'FF';
    }
    // 20% - #33
    // 40% - #66
    // 60% - #99
    // 80% - #CC
    // 100% - #FF
  }

  createSunburst(skills: Array<Skill>): void {
    if(skills.length === 0) return;
    let skillData = {
      name: 'Skills',
      children: skills
    };
    // possibly check data structure here
    // TODO add highlighting
    // Use opacity or saturation to distinguish expertise
    let width = 600;
    let height = 600;
    let maxRadius = (Math.min(width, height) / 2) - 5;
    let formatNumber = d3.format(',d');

    let x = d3.scaleLinear()
                .range([0, 2 * Math.PI])
                .clamp(true);

    let y = d3.scaleSqrt()
                .range([maxRadius*.1, maxRadius]);

    let color = d3.scaleOrdinal(d3.schemeSet1);

    let partition = d3.partition();

    let arc = d3.arc()
                  .startAngle((d: any) => x(d.x0))
                  .endAngle((d: any) => x(d.x1))
                  .innerRadius((d: any) => Math.max(0, y(d.y0)))
                  .outerRadius((d: any) => Math.max(0, y(d.y1)));

    let middleArcLine = d => {
      let halfPi = Math.PI/2;
      let angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
      let r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);

      let middleAngle = (angles[1] + angles[0]) / 2;
      let invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
      if (invertDirection) { angles.reverse(); }

      let path = d3.path();
      path.arc(0, 0, r, angles[0], angles[1], invertDirection);
      return path.toString();
    };

    let textFits = d => {
      let CHAR_SPACE = 6;

      let deltaAngle = x(d.x1) - x(d.x0);
      let r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
      let perimeter = r * deltaAngle;

      return d.data.name.length * CHAR_SPACE < perimeter;
    };

    let svg = d3.select(this.skillHTML).append('svg')
                  .style('width', width)
                  .style('height', height)
                  .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
                  .on('click', () => focusOn()); // Reset zoom on canvas click
    // TODO add profile picture to middle via pattern def
    // on one of the paths fill="url(#picture)"
    svg.append("defs")
         .append('pattern')
         .attr('id', 'picture')
         .attr('patternUnits', 'userSpaceOnUse')
         .attr('width', 300)
         .attr('height', 300)
         .append("image")
         .attr("xlink:href", "./pic.png")
         .attr('width', 300)
         .attr('height', 300);

    let root = d3.hierarchy(skillData);
    console.log(root);
  // /  console.log(root);
    root.sum((d: any) => d.size || 1);

    let slice = svg.selectAll('g.slice')
                     .data(partition(root).descendants());

    slice.exit().remove();

    let newSlice = slice.enter()
                          .append('g').attr('class', 'slice')
                          .on('click', d => {
                            d3.event.stopPropagation();
                            focusOn(d);
                          });

    newSlice.append('title')
            .text((d: any) => d.data.name + '\n' + formatNumber(d.value));

    newSlice.append('path')
            .attr('class', 'main-arc')
            .style('fill', (d: any) => {
              console.log(d);
              console.log(d.children);
              return color((d.children ? d : d.parent).data.name) + this.getSkillOpacity(d.data.level);
            })
            .attr('d', <any>arc);

    newSlice.append('path')
            .attr('class', 'hidden-arc')
            .attr('id', (_, i) => `hiddenArc${i}`)
            .attr('d', middleArcLine);

    let text = newSlice.append('text')
                         .attr('class', 'label')
                         .attr('display', d => textFits(d) ? null : 'none');

    // Add white contour
    text.append('textPath')
        .attr('startOffset','50%')
        .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
        .text((d: any) => d.data.name)
        .style('fill', 'none')
        .style('stroke', '#fff')
        .style('stroke-width', 3)
        .style('stroke-linejoin', 'round');

    text.append('textPath')
        .attr('startOffset','50%')
        .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
        .text((d: any) => d.data.name);



    function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
      // Reset to top-level if no data point specified
      let transition = svg.transition()
                            .duration(750)
                            .tween('scale', () => {
                              let xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                              yd = d3.interpolate(y.domain(), [d.y0, 1]);
                              return t => { x.domain(xd(t)); y.domain(yd(t)); };
                            });

      transition.selectAll('path.main-arc')
                .attrTween('d', (d: any) => () => arc(d));

      transition.selectAll('path.hidden-arc')
                .attrTween('d', d => () => middleArcLine(d));

      transition.selectAll('text')
                .attrTween('display', d => () => textFits(d) ? null : 'none');

      moveStackToFront(d);

      function moveStackToFront(elD) {
        svg.selectAll('.slice')
           .filter(d => d === elD)
           .each(function(d: any) {
             // cast to HTML element type so typescript doenst complain
             (<HTMLElement>this).parentNode.appendChild(<HTMLElement>this);
             if (d.parent) { moveStackToFront(d.parent); }
           });
      }
    }
  }

  createDonut(language: Language, id: number): void {
    console.log(language.name + ' ' + language.level);
    // maps languages proficiency to donut fill
    let skillLevel = {
			'A1' : 16.6666666667,
			'A2' : 33.3333333334,
			'B1' : 50.0000000001,
			'B2' : 66.6666666668,
			'C1' : 83.3333333335,
			'C2' : 100
		};

    // setup data in form of { language, proficiency }
    let dataset = [
      skillLevel[language.level],       // colored area
      100 - skillLevel[language.level]  // transparent area
    ];

    // donut dimensions
    let width = 250;
    let height = 250;
    let donutWidth = 75;
    let dataSize = 25;
    let duration = 750;
    let radius = Math.min(width, height) / 2;
    // color scheme
    let color = ['#00d1b2', '#c5f9f2'];
    // create SVG and append
    let svg = d3.select(this.languageHTML)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('class', `g-${id}`)
            .attr('transform', `translate(${width / 2}, ${height / 2})`);
    // load data into pie and append
    let arc = d3.arc()
             .outerRadius(radius - donutWidth + dataSize)
             .innerRadius(radius - donutWidth);
    // create angles
    let pie = d3.pie()
             .value((d: any) => d);
    // draw svg
    let path = svg.selectAll('path')
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
    let g = d3.select(`.g-${id}`)

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
  }

}

import { Inject, Component, PLATFORM_ID, ViewChild, ElementRef, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Resume } from '../../models/resume';
import { Skill } from '../../models/skill';
import { Language } from '../../models/language';
import { Work } from '../../models/work';
import { Project } from '../../models/project';
import { Publication } from '../../models/publication';
import { Award } from '../../models/award';
import { Education } from '../../models/education';
import { DatabaseServices } from '../../services/db.service';
import { UtilServices } from '../../services/util.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Timeline } from 'vis';
import * as d3 from 'd3';
import * as moment from 'moment';

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
  tooltip: any;
  isBrowser: boolean;
  private resumeDiff: KeyValueDiffer<string, any>;

  @ViewChild('languages') languages: ElementRef;
  private languageHTML: HTMLElement;

  // @ViewChild('skills') skills: ElementRef;
  // private skillHTML: HTMLElement;

  @ViewChild('timeline') timelineContainer: any;
  timeline: any;

  timelineData: Array<any>;
  timelineGroups: Array<any>;

  skillData: Skill;

  constructor(
    private db: DatabaseServices,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private router: Router,
    @Inject(PLATFORM_ID) private _platformId: Object,
    private util: UtilServices,
    private differs: KeyValueDiffers
  ) {
    this.isBrowser = isPlatformBrowser(this._platformId);
    this.resume = new Resume();
    this.resumeDiff = this.differs.find(this.resume).create();
    this.route.params.subscribe((param: Params) => {
      this.selectedId = param['id'];
      this.db.getResume(this.selectedId).then((success: any) => {
        this.resume = success;
        this.age = this.util.getAge(this.resume.birthDay);
        this.timelineGroups = new Array<any>();
        this.timelineData = Array<any>();
        this.getTimelineData();
        this.loading = false;
      });
    });
  }


  getTimelineTitle(item: any, i: number): string {
    return `
      <div class="timeline-content">
        <h3 class="timeline-title">
          ${item.position} @ ${item.company}
        </h3>
        <p>${this.util.getPrettyDate(item.startDate, item.endDate)}</p>
        ${item.location ?
        `<p>
          <i class="material-icons">place</i>${item.location.address ? item.location.address : ''} ${item.location.city ? item.location.city : ''} ${item.location.country ? item.location.country : ''}
        </p>` : ''}
        <p>
        ${item.description ? item.description : 'No description for event.'}
        </p>
      </div>
    `;
  }

  getTimelineContent(item: any, icon: string): string {
    // <i class="timeline-icon fa ' + icon +'"></i>' + events[j].title,?
    return `<i class="material-icons">${icon}</i>${item.position} @ ${item.company}`;
  }

  getTimelineData(): void {
    let identifier = 0;
    let type = 'range';
    this.resume.work.forEach((w: Work, idx: any) => {
      w.identifier = identifier;
      type = w.endDate ? 'range' : 'point';
      let event = {
        id: identifier,
        item: idx,
        category: 'WORK',
        location: `${w.location.address ? w.location.address : ''} ${w.location.city ? w.location.city : ''} ${w.location.country ? w.location.country : ''}`,
        start: w.startDate,
        type: type,
        title: this.getTimelineTitle(w, idx),
        content: this.getTimelineContent(w, 'work'),
        className: `timeline-event`
      }
      if (w.endDate) event['end'] = w.endDate;
      this.timelineData.push(event);
      identifier++;
    });
    this.resume.education.forEach((e: Education, idx: any) => {
      e.identifier = identifier;
      type = e.endDate ? 'range' : 'point';
      let education = {
        position: e.studies,
        company: e.institution,
        location: {
          address: e.institution
        }
      };
      let event = {
        id: identifier,
        item: idx,
        category: 'EDUCATION',
        location: e.institution,
        start: e.startDate,
        type: type,
        title: this.getTimelineTitle(education, idx),
        content: this.getTimelineContent(education, 'school'),
        className: `timeline-event`
      };
      if (e.endDate) {
        event['end'] = e.endDate;
      } else {
        event['end'] = moment().format('DD-MM-YYYY');
      }
      this.timelineData.push(event);
      identifier++;
    });

    this.resume.publications.forEach((p: Publication, idx: any) => {
      p.identifier = identifier;
      let publication = {
        position: p.title,
        company: p.publisher
      };
      let event = {
        id: identifier,
        item: idx,
        category: 'PUBLICATION',
        location: null,
        startDate: p.date,
        type: 'point',
        title: this.getTimelineTitle(publication, idx),
        content: this.getTimelineContent(publication, 'note_add'),
        className: `timeline-event`
      };
      this.timelineData.push(event);
      identifier++;
    });
    this.resume.projects.forEach((p: Project, idx: any) => {
      p.identifier = identifier;
      type = p.endDate ? 'range' : 'point';
      let project = {
        position: p.title,
        company: p.url
      };
      let event = {
        id: identifier,
        item: idx,
        category: 'PROJECT',
        location: null, // should we add a location?
        start: p.startDate,
        end: p.endDate,
        type: type,
        title: this.getTimelineTitle(project, idx),
        content: this.getTimelineContent(project, 'assignment'),
        className: `timeline-event`
      };
      if (p.endDate) event['end'] = p.endDate;
      this.timelineData.push(event);
      identifier++;
    });

    this.resume.awards.forEach((a: Award, idx: any) => {
      a.identifier = identifier;
      let award = {
        position: a.title,
        company: a.awarder
      };
      let event = {
        id: identifier,
        item: idx,
        category: 'CERTIFICATE/AWARD',
        location: null,
        startDate: a.date,
        type: 'point',
        title: this.getTimelineTitle(award, idx),
        content: this.getTimelineContent(award, 'star'),
        className: `timeline-event`
      };
      this.timelineData.push(event);
      identifier++;
    });
    if(this.isBrowser) this.createTimeline();
  }

  ngDoCheck(): void {
    const changes = this.resumeDiff.diff(this.resume);
    if (changes && this.isBrowser) {
      this.clearSVGs();
      this.createLanguages(this.resume.languages);
      this.createSkills(this.resume.skills);
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.languageHTML = this.languages.nativeElement;
      this.createLanguages(this.resume.languages);

      // this.skillHTML = this.skills.nativeElement;
      // this.createSkills(this.resume.skills);
      // this.createTimeline(this.resume.work, this.resume.education);
    }
  }

  edit(id: string): void {
    this.router.navigate(['/edit', id]);
  }

  clearSVGs(): void {
    if (isPlatformBrowser(this._platformId)) d3.selectAll('svg').remove();
  }

  clearFilter(): void {
    this.timeline.setItems(this.timelineData);
  }

  filterByEventType($event): void {
    let filteredEvents = this.timelineData.filter((e: any) => {
      return e.category === $event.value.toUpperCase();
    });
    this.timeline.setItems(filteredEvents);
  }

  filterByLocation($event: any): void {
    let filteredEvents = this.timelineData
      .filter((e: any) => {
        return e.location.includes($event.target.value);
      });
    // .map((e: any) => { return e.id });
    this.timeline.setItems(filteredEvents);
  }
  createTimeline(): void {
    let options = {
      showMinorLabels: true,
      showMajorLabels: true,
      zoomMin: 86400000 * 365, // 1 year in ms
      zoomMax: 86400000 * 365 * 20, // 10 years in ms
      minHeight: '350px',
      showCurrentTime: false,
      tooltip: {
        followMouse: true,
        overflowMethod: 'cap'
      }
    }
    this.timeline = new Timeline(this.timelineContainer.nativeElement, this.timelineData);
    this.timeline.setOptions(options);
  }

  createLanguages(languages: Array<Language>): void {
    languages.forEach((l: any, idx: number) => {
      this.createDonut(l, idx);
    });
  }

  createSkills(skills: Array<Skill>): void {
    // OLD VERSION - used barcharts
    // skills.forEach((s: any, idx: number) => {
    //   this.createBar(s, idx);
    // });
    //
    // tooltip
    this.tooltip = d3.select('body').append('div')
      .attr('class', 'tree-tooltip')
      .style('opacity', 0);
    this.skillData = new Skill();
    this.skillData.name = 'Skills';
    this.skillData.children = skills;
    this.drawTree('#skill-tree', this.skillData);
  }

  getProfilePicture(resume: Resume): string {
    return resume.profilePicture;
  }

  drawTree(id: string, data: any): void {
    // First check this out : https://medium.com/@c_behrens/enter-update-exit-6cafc6014c36 to understand how enter, update, exit works
    // Tree already in proper format
    d3.select(id).select('svg').remove();

    // set the dimensions and margins of the diagram
    let margin = { top: 20, right: 30, bottom: 30, left: 30 },
      width = 700, // - margin.left - margin.right,
      height = 600; // - margin.top - margin.bottom;
    let nodeRadius = 25;
    let nodeThickness = 15;
    let duration = 250;

    // declares a tree layout and assigns the size
    // TODO: the size of the tree needs to be dynamic (based on skills/nodes per level) - otherwise occlusion
    let treemap = d3.tree()
      // .size([360, 250]) //angle = 2*PI, radius = 250
      .nodeSize([nodeRadius * 4, nodeRadius * 4])
      .separation(function (a, b) { return (a.parent == b.parent ? 1 : 2); });


    function radialPoint(x, y) {
      return [y * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
    }

    let root;

    let nodes = d3.hierarchy(data, function (d: any) {
      return d.children;
    });

    root = treemap(nodes);
    let nodeData = root.descendants();
    let linkData = root.descendants().slice(1);
    let svg = d3.select(id).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('class', 'chart'),
      g = svg.append('g')
        .attr('transform',
          'translate(' + (width / 2) + ',' + (height / 2) + ')'); //make sure the center of circle is in the center of svg

    // adds the links between the nodes
    let links = g.selectAll('.link')
      .data(root.links());

    let linkEnter = links.enter().append('path')
      .attr('class', 'link')
      .attr('d', d3.linkRadial().angle((d: any) => { return 0; }).radius((d: any) => { return 0; }))
      .attr('stroke', function (d, i) { return '#D4D8DA'; })
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.75);

    let linkUpdate = links.merge(linkEnter)
      .transition()
      .duration(duration)
      .attr('d', d3.linkRadial()
        .angle(function (d: any) { return d.x; })
        .radius(function (d: any) { return d.y; }));

    // adds each node as a group
    let node = g.selectAll('.node')
      .data(nodeData);

    //arrange each node on svg
    let nodeEnter = node.enter().append('g').attr('class', 'node');

    // adds the circle to the node  
    this.getNode(nodeEnter, nodeRadius - 2, nodeThickness - 2, nodeData);
    // adds the text to the node
    nodeEnter.append('text')
      .attr('class', 'all')
      .text(function (d: any) { return d.data.name; })
      .attr('dy', (d: any) => {
        if (d.data.name === 'Skills') return '.5em';
        return '1em';
      })
      .attr('x', function (d: any) {
        if (d.data.name === 'Skills') return -18;
        return d.x < Math.PI ? 35 : -35;
      })
      .style('text-anchor', function (d: any) { return d.x < Math.PI ? 'start' : 'end'; })
    // .attr('transform', function (d: any) { 
    //   if(d.data.name === 'Skills') return;
    //   return 'rotate(' + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ')'; 
    // });




    let nodeUpdate = node.merge(nodeEnter)
      .transition()
      .duration(duration)
      .attr('transform', function (d: any) { return 'translate(' + radialPoint(d.x, d.y) + ')'; });
  }

  // this.createSunburst(skills);
  getNode(node: any, circleSize: number, thickness: number, nodeData: any): void {
    // return;
    node.append("circle") //background circle fill
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", circleSize)
      .attr("fill", "#f2f2f2")
      .attr('stroke', '#00d1b2')
      .attr('stroke-opacity', (d: any) => {
        return this.getSkillOpacity(d.data.level.trim());
      })
      .attr('stroke-width', 4)
      .on('mouseover', (d: any, i: any, n: any) => {
        this.tooltip.html(`Knowledge of ${d.data.name} - ${d.data.level ? d.data.level : 'Not entered.'}`)
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
      });
  }

  createBar(skills: Array<Skill>): void {
    // TODO should go through skills and add
    // size attribute to leaf nodes (=1)
    // this.createSunburst(skills);
  }

  getSkillOpacity(level: string): number {
    switch (level) {
      case 'BASIC': return 0.2;
      case 'NOVICE': return 0.4;
      case 'INTERMEDIATE': return 0.6;
      case 'ADVANCED': return 0.8;
      case 'EXPERT': return 1;
      default: return 1;
    }
    // in hex
    // 20% - #33
    // 40% - #66
    // 60% - #99
    // 80% - #CC
    // 100% - #FF
  }

  // createSunburst(skills: Array<Skill>): void {
  //   if (skills.length === 0) return;
  //   let skillData = {
  //     name: 'Skills',
  //     children: skills
  //   };
  //   // possibly check data structure here
  //   // TODO add highlighting
  //   // Use opacity or saturation to distinguish expertise
  //   let width = 500;
  //   let height = 500;
  //   let maxRadius = (Math.min(width, height) / 2) - 5;
  //   let formatNumber = d3.format(',d');

  //   let x = d3.scaleLinear()
  //     .range([0, 2 * Math.PI])
  //     .clamp(true);

  //   let y = d3.scaleSqrt()
  //     .range([maxRadius * .1, maxRadius]);

  //   let color = d3.scaleOrdinal(d3.schemeSet1);

  //   let partition = d3.partition();

  //   let arc = d3.arc()
  //     .startAngle((d: any) => x(d.x0))
  //     .endAngle((d: any) => x(d.x1))
  //     .innerRadius((d: any) => Math.max(0, y(d.y0)))
  //     .outerRadius((d: any) => Math.max(0, y(d.y1)));

  //   let middleArcLine = d => {
  //     let halfPi = Math.PI / 2;
  //     let angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
  //     let r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);

  //     let middleAngle = (angles[1] + angles[0]) / 2;
  //     let invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
  //     if (invertDirection) { angles.reverse(); }

  //     let path = d3.path();
  //     path.arc(0, 0, r, angles[0], angles[1], invertDirection);
  //     return path.toString();
  //   };

  //   let textFits = d => {
  //     let CHAR_SPACE = 6;

  //     let deltaAngle = x(d.x1) - x(d.x0);
  //     let r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
  //     let perimeter = r * deltaAngle;

  //     return d.data.name.length * CHAR_SPACE < perimeter;
  //   };

  //   let svg = d3.select(this.skillHTML).append('svg')
  //     .style('width', width)
  //     .style('height', height)
  //     .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
  //     .on('click', () => focusOn()); // Reset zoom on canvas click
  //   // TODO add profile picture to middle via pattern def
  //   // on one of the paths fill="url(#picture)"
  //   svg.append("defs")
  //     .append('pattern')
  //     .attr('id', 'picture')
  //     .attr('patternUnits', 'userSpaceOnUse')
  //     .attr('width', 300)
  //     .attr('height', 300)
  //     .append("image")
  //     .attr("xlink:href", "./pic.png")
  //     .attr('width', 300)
  //     .attr('height', 300);

  //   let root = d3.hierarchy(skillData);
  //   // /  console.log(root);
  //   root.sum((d: any) => d.size || 1);

  //   let slice = svg.selectAll('g.slice')
  //     .data(partition(root).descendants());

  //   slice.exit().remove();

  //   let newSlice = slice.enter()
  //     .append('g').attr('class', 'slice')
  //     .on('click', d => {
  //       d3.event.stopPropagation();
  //       focusOn(d);
  //     });

  //   newSlice.append('title')
  //     .text((d: any) => d.data.name + '\n' + formatNumber(d.value));

  //   newSlice.append('path')
  //     .attr('class', 'main-arc')
  //     .style('fill', (d: any) => {
  //       return color((d.children ? d : d.parent).data.name) + this.getSkillOpacity(d.data.level);
  //     })
  //     .attr('d', <any>arc);

  //   newSlice.append('path')
  //     .attr('class', 'hidden-arc')
  //     .attr('id', (_, i) => `hiddenArc${i}`)
  //     .attr('d', middleArcLine);

  //   let text = newSlice.append('text')
  //     .attr('class', 'label')
  //     .attr('display', d => textFits(d) ? null : 'none');

  //   // Add white contour
  //   text.append('textPath')
  //     .attr('startOffset', '50%')
  //     .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
  //     .text((d: any) => d.data.name)
  //     .style('fill', 'none')
  //     .style('stroke', '#fff')
  //     .style('stroke-width', 3)
  //     .style('stroke-linejoin', 'round');

  //   text.append('textPath')
  //     .attr('startOffset', '50%')
  //     .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
  //     .text((d: any) => d.data.name);



  //   function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
  //     // Reset to top-level if no data point specified
  //     let transition = svg.transition()
  //       .duration(750)
  //       .tween('scale', () => {
  //         let xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
  //           yd = d3.interpolate(y.domain(), [d.y0, 1]);
  //         return t => { x.domain(xd(t)); y.domain(yd(t)); };
  //       });

  //     transition.selectAll('path.main-arc')
  //       .attrTween('d', (d: any) => () => arc(d));

  //     transition.selectAll('path.hidden-arc')
  //       .attrTween('d', d => () => middleArcLine(d));

  //     transition.selectAll('text')
  //       .attrTween('display', d => () => textFits(d) ? null : 'none');

  //     moveStackToFront(d);

  //     function moveStackToFront(elD) {
  //       svg.selectAll('.slice')
  //         .filter(d => d === elD)
  //         .each(function (d: any) {
  //           // cast to HTML element type so typescript doenst complain
  //           (<HTMLElement>this).parentNode.appendChild(<HTMLElement>this);
  //           if (d.parent) { moveStackToFront(d.parent); }
  //         });
  //     }
  //   }
  // }

  createDonut(language: Language, id: number): void {
    // maps languages proficiency to donut fill
    let skillLevel = {
      'A1': 16.6666666667,
      'A2': 33.3333333334,
      'B1': 50.0000000001,
      'B2': 66.6666666668,
      'C1': 83.3333333335,
      'C2': 100
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
        if (i === 1) return 0;
        return i * duration;
      })
      .duration((d, i) => {
        if (i === 1) return 0;
        return duration;
      })
      .attrTween('d', (d: any) => {
        if (d.index === 1) return;
        let i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
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

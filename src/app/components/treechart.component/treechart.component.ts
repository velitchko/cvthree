import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { DatabaseServices } from '../../services/db.service';
import { Resume } from '../../models/resume';
import { Skill } from '../../models/skill';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { UtilServices } from '../../services/util.service';
import { CompareService } from '../../services/compare.service';
import { SkillLevel } from '../../lists/skill.level';
import * as d3 from 'd3';


@Component({
  selector: 'app-treechart',
  templateUrl: './treechart.component.html',
  styleUrls: ['treechart.component.scss']
})

export class TreeChartComponent implements OnChanges {
  @Input() data: any;
  @Output() selectedResume: EventEmitter<string>;
  tooltip: any;

  constructor(private cs: CompareService) {
    this.selectedResume = new EventEmitter<string>();

    this.cs.currentlySelectedResume.subscribe((selection: any) => {
      if (selection) {
        selection === 'none' ? this.unhighlightNodes() : this.highlightNodes(selection);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {

      if(!this.tooltip) {
        this.tooltip = d3.select('body').append('div')
                          .attr('class', 'tree-tooltip')
                          .style('opacity', 0);
      }
      if (this.data) this.drawTree('#tree-chart', this.data);
    }
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
  }

  getNumericSkill(level: string): number {
    switch (level) {
      case 'BASIC': return 1;
      case 'NOVICE': return 2;
      case 'INTERMEDIATE': return 2;
      case 'ADVANCED': return 4;
      case 'EXPERT': return 5;
      default: return 0;
    }
  }


  unhighlightNodes(): void {
    d3.selectAll('.node circle')
      .each((d: any, i: any, n: any) => {
        d3.select(n[i])
          .transition()
          .duration(250)
          .attr('stroke-width', 6)
          .attr('stroke-opacity', 1)
          .attr('stroke', '#D4D8DA');
      });

    d3.selectAll('path.link')
      .each((d: any, i: any, n: any) => {
        d3.select(n[i])
          .transition()
          .duration(250)
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 1)
          .attr('stroke', '#D4D8DA');
      });
  }

  highlightNodes(resumeID: string): void {
    // highlight nodes
    d3.selectAll('.node circle')
      .each((d: any, i: any, n: any) => {
        if (d.data.people.includes(resumeID) || d.data.name === 'Skills') {
          d3.select(n[i])
            .transition()
            .duration(250)
            .attr('stroke-opacity', () => {
              return this.getSkillOpacity(d.data.level.trim());
            })
            .attr('stroke-width', 8)
            .attr('stroke', () => {
              return this.cs.getColorForResume(resumeID);
            });
        }
      });
    // highlight edges
    let root = d3.hierarchy(this.data, function (d: any) { return d.children; });
    let links = root.links();
    links.forEach((l: any) => {
      d3.selectAll('path.link').each((dl: any, il: any, nl: any) => {
        if (!dl.target.data.people.includes(resumeID)) return;
       // if (l.source.data.name === dl.target.parent.data.name && dl.source.data.name === l.target.parent.data.name) {
          d3.select(nl[il])
            .transition()
            .duration(250)
            .attr('stroke-width', 4)
            .attr('stroke', () => {
              return this.cs.getColorForResume(resumeID);
            });
       //  }
      });
    })
  }

  drawTree(id: string, data: any): void {
    // First check this out : https://medium.com/@c_behrens/enter-update-exit-6cafc6014c36 to understand how enter, update, exit works
    // Tree already in proper format
    d3.select(id).select('svg').remove(); 
    // set the dimensions and margins of the diagram
    let margin = { top: 40, right: 40, bottom: 40, left: 40 },
      width = 700 - margin.left - margin.right, // - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;
    let nodeRadius = 25;
    let nodeThickness = 10;
    let duration = 250;

      let treemap = d3.cluster()
      .size([2*Math.PI,  Math.max(width, height)/2 - nodeRadius*4])
      .separation(function() { return .5; });
      
    let root;

    let nodes = d3.hierarchy(data, function (d: any) {
      return d.children;
    });

    root = treemap(nodes);
    let nodeData = root.descendants();
    let linkData = root.descendants().slice(1);
    let svg = d3.select(id).append('svg')
      .attr('width', width)
      .attr('height', height)
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
      .attr('dy', '.35em')
      .attr('x', function (d: any) { 
        if(d.data.name === 'Skills') return -12;
        return d.x < Math.PI ? 35 : -35; 
      })
      .style('text-anchor', function (d: any) { 
        if(d.data.name === 'Skills') return '';
        return d.x < Math.PI ? 'start' : 'end'; 
      })
      .attr('transform', function (d: any) { 
        if(d.data.name === 'Skills') return;
        return 'rotate(' + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ')'; 
      });

    let nodeUpdate = node.merge(nodeEnter)
      .transition()
      .duration(duration)
      .attr('transform', function (d: any) { return 'translate(' + d3.pointRadial(d.x, d.y) + ')'; });
  }

  getExistingNode(currentNode: any, target: any): Skill {
    if (currentNode.name.toLowerCase() === target.toLowerCase()) return currentNode;

    for (let i = 0; i < currentNode.children.length; i++) {
      let currentChild = currentNode.children[i];
      let exists = this.getExistingNode(currentChild, target);
      if (exists) return exists;
    }
  }

  getNode(node: any, circleSize: number, thickness: number, nodeData: any): void {
    let donutData = new Array<any>();
    nodeData.forEach((n: any) => {
      let nodeArr = new Array<any>();
      n.data.people.forEach((p: any) => {
        nodeArr.push({ name: n.data.name, skills: [p, 1]});
      });
      donutData.push(nodeArr);
    });
    node.append("circle") //background circle fill
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", circleSize)
      .attr("fill", "#f2f2f2")
      .attr('stroke', (d: any) => {
        return d.data.name === 'Skills' ? '#d3d3d3' : 'none';
      })
      .attr('stroke-width', (d: any) => {
        return d.data.name === 'Skills' ? 6 : 0;
      })
      .on('mouseover', (d: any) => {
        let peoplesKnowledge = `${d.data.name}`;
        let map = new Map<string, string>();
        d.data.people.forEach((p: any) => {
          let person = this.cs.getResumeByID(p);
          let skill;
          person.skills.forEach((s: Skill) => {
            skill = this.getExistingNode(s, d.data.name);
            
            if(skill) {
              map.set(`${person.id}`, skill.level);
            }
          });
        });
        
        let sortedMap = new Map([...map.entries()].sort((a, b) => { return this.getNumericSkill(b[1]) - this.getNumericSkill(a[1]); }))
        sortedMap.forEach((v: any, k: any) => {
          peoplesKnowledge += `<div style="color: ${this.cs.getColorForResume(k)};">${this.cs.getResumeByID(k).firstName} - ${v === "" ? 'No knowledge provided' : v}</div>`;
        })
        this.tooltip.html(peoplesKnowledge)
        .style('left', `${d3.event.pageX + 20}px`)
        .style('top', `${d3.event.pageY - 20}px`)
        .transition()
        .duration(200) // ms
        .style('opacity', 1) // started as 0!
      })
      .on('mouseout', (d: any) => {
        this.tooltip.transition().duration(200).style('opacity', 0);
      });

    let arc = d3.arc()
      .innerRadius(circleSize - thickness)
      .outerRadius(circleSize);
    let pie = d3.pie().value((d: any) => { return d.skills[1]; });

    node.selectAll('path')
      .data((d: any, i: any) => {
        return pie(donutData[i]);
      })
      .enter()
      .append('g')
      .append('path')
      .attr('d', <any>arc)
      .attr('fill', (d: any) => { return this.cs.getColorForResume(d.data.skills[0]); })
      .on('mouseover', (d: any, i: any, n: any) => {
        if (d.data.skills[0]) this.selectedResume.emit(d.data.skills[0]);
      })
      .on('mouseout', (d: any, i: any, n: any) => {
        this.selectedResume.emit('none');
      });
  }

}
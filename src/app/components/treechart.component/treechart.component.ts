import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { DatabaseServices } from '../../services/db.service';
import { Resume } from '../../models/resume';
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

  constructor(private cs: CompareService) {
    this.selectedResume = new EventEmitter<string>();

    this.cs.currentlySelectedResume.subscribe((selection: any) => {
      if (selection) {
        console.log(selection);
        selection === 'none' ? this.unhighlightNodes() : this.highlightNodes(selection);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      // TODO: redraw on input changes
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


  unhighlightNodes(): void {
    d3.selectAll('circle.node')
      .each((d: any, i: any, n: any) => {
        d3.select(n[i])
          .transition()
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 1)
          .attr('stroke', '#D4D8DA');
      });

    d3.selectAll('path.link')
      .each((d: any, i: any, n: any) => {
        d3.select(n[i])
          .transition()
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 1)
          .attr('stroke', '#D4D8DA');
      });
  }

  highlightNodes(resumeID: string): void {
    // highlight nodes
    d3.selectAll('circle.node')
      .each((d: any, i: any, n: any) => {
        if (d.data.people.includes(resumeID) || d.data.name === 'Skills') {
          d3.select(n[i])
            .transition()
            .attr('stroke-opacity', () => {
              return this.getSkillOpacity(d.data.level);
            })
            .attr('stroke-width', 4)
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
        if (!dl.data.people.includes(resumeID)) return;
        if (l.source.data.name === dl.parent.data.name && l.target.data.name === dl.data.name) {
          d3.select(nl[il])
            .transition()
            .attr('stroke-width', 4)
            .attr('stroke', () => {
              return this.cs.getColorForResume(resumeID);
            });
        }
      });
    })
  }

  drawTree(id: string, treeData: any): void {
    // First check this out : https://medium.com/@c_behrens/enter-update-exit-6cafc6014c36 to understand how enter, update, exit works
    // Tree already in proper format

    // Setup SVG Element - Start

    let margin = { top: 30, right: 20, bottom: 30, left: 20 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    let circleSize = 25;

    let svg = d3.select(id)
      .append('svg')
      .attr('width', width + margin.right + margin.left)
      .attr('height', height + margin.top + margin.bottom)

    let g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Setup SVG Element - End

    let i = 0,
      duration = 750,
      root;

    // Setup tree

    let treemap = d3.tree()
      .size([width, height]);

    // Get the root

    root = d3.hierarchy(treeData, function (d: any) { return d.children; });

    root.x0 = 0;
    root.y0 = width / 3;

    // Collapse all children, except root's
    // root.children.forEach(collapse);
    // root.children = null;

    // Let's draw the tree
    draw(root, this);

    function draw(source, _self) {

      // Get the treemap, so that we can get nodes and links
      let treeData = treemap(root);

      // Get nodes and links
      let nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

      // Adjust the position of y of each node. Comment out just this line and see how it's different  
      nodes.forEach(function (d: any) { d.y = d.depth * 100 });

      // Add unique id for each node, else it won't work
      let node = g.selectAll('g.node')
        .data(nodes, function (d: any) { return d.id || (d.id = ++i); });
      let thickness = 7; // in pixels

      // Let's append all enter nodes
      let nodeEnter = node
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', function (d) {
          return 'translate(' + source.x0 + ',' + source.y0 + ')';
        })
        .on('click', (d: any) => {
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
          let children = d._children ? d._children : d.children;
          children.forEach((function (child) {
            collapse(child);
          }));
          // // If d has a parent, collapse other children of that parent
          // if (d.parent) {
          //   d.parent.children.forEach(function (element) {
          //     if (d !== element) {
          //       collapse(element);
          //     }
          //   });
          // }
          draw(d, _self);
        });
      // create nodes as donut charts
      _self.getNode(nodeEnter, circleSize, thickness, nodes);
      // Points equally spread along the inside of the circle for each person
      // nodeEnter.each((d: any, i: any, n: any) => {
      //   if (d.data.people.length === 0) return;
      //   let smallRadius = 5;
      //   let radius = circleSize - smallRadius;
      //   let angle = (360 / d.data.people.length) * (Math.PI / 180);
      //   let nodeContainer = d3.select(n[i]);
      //   // console.log(radius, angle, d.data.name, d.data.people.length)
      //   d.data.people.forEach((pers: any, idx: number) => {
      //     // console.log(radius, angle, idx, Math.cos(angle*idx), d.x0, d.y0)
      //     nodeContainer.append('circle')
      //       .attr('r', smallRadius)
      //       .attr('fill', _self.cs.getColorForResume(pers))
      //       .attr('cx', () => {
      //         return radius * Math.cos(angle * idx);
      //       })
      //       .attr('cy', () => {
      //         return radius * Math.sin(angle * idx);
      //       })
      //   });
      // });

      // Add text
      nodeEnter.append('text')
        .attr('dy', '.35em')
        .attr('x', function (d: any) {
          return d.children || d._children ? -1 * circleSize : circleSize;
        })
        .attr('text-anchor', function (d: any) {
          return d.children || d._children ? 'end' : 'start';
        })
        .text(function (d: any) { return d.data.name; });

      // https://github.com/d3/d3-selection/issues/86 to check what merge does
      let nodeUpdate = nodeEnter.merge(node);

      // Do transition of node to appropriate position
      nodeUpdate.transition()
        .duration(duration)
        .attr('transform', function (d) {
          return 'translate(' + d.x + ',' + d.y + ')';
        });


      // Let's update the radius now, which was previously zero.
      nodeUpdate.select('circle.node')
        // .attr('r', circleSize)
        // .attr('stroke-width', 2)
        // .attr('stroke', '#D4D8DA')
        // .attr('fill', function (d: any) {
        //   return d._children ? 'lightsteelblue' : '#fff';
        // })
        .attr('cursor', 'pointer')
      


      // Let's work on exiting nodes
      // Remove the node
      let nodeExit = node.exit().transition()
        .duration(duration)
        .attr('transform', function (d) {
          return 'translate(' + source.x + ',' + source.y + ')';
        })
        .remove();

      // On exit reduce the node circles size to 0
      nodeExit.select('circle')
        .attr('r', 0);

      // On exit reduce the opacity of text labels
      nodeExit.select('text')
        .attr('fill-opacity', 0);


      // Let's draw links
      let link = g.selectAll('path.link')
        .data(links, function (d: any) { return d.id; });

      // Work on enter links, draw straight lines

      let linkEnter = link.enter().insert('path', 'g')
        .attr('class', 'link')
        .attr('stroke-width', 2)
        .attr('source', (d: any) => {
          return d.parent.data.name;
        })
        .attr('target', (d: any) => {
          return d.data.name;
        })
        .attr('stroke', '#D4D8DA')
        .attr('d', function (d) {
          let o = { x: source.x0, y: source.y0 }
          return diagonal(o, o)
        });

      // UPDATE
      let linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position, now draw a link from node to it's parent
      linkUpdate.transition()
        .duration(duration)
        .attr('d', function (d) { return diagonal(d, d.parent) });

      // Remove any exiting links
      let linkExit = link.exit().transition()
        .duration(duration)
        .attr('d', function (d) {
          let o = { x: source.x, y: source.y }
          return diagonal(o, o)
        })
        .remove();

      // Store the old positions for transition.
      nodes.forEach(function (d: any) {
        d.x0 = d.x;
        d.y0 = d.y;
      });

    }

    function diagonal(s, d) {

      // Here we are just drawing lines, we can also draw curves, comment out below path for it.

      let path = `M ${s.x} ${s.y}
          L ${d.x} ${d.y}`;

      // let path = `M ${s.x} ${s.y}
      //         C ${(s.x + d.x) / 2} ${s.y},
      //           ${(s.x + d.x) / 2} ${d.y},
      //           ${d.x} ${d.y}`

      return path
    }

    function collapse(d) {
      // console.log(d);
      if (d.children) {
        d._children = d.children
        d._children.forEach(collapse)
        d.children = null
      }
    }
  }

  getNode(node: any, circleSize: number, thickness: number, nodeData: any): void {
    // console.log('generating node');
    // console.log(data.name, data.people);
    // console.log(data); 
    // return;
    let donutData = new Array<any>();
    nodeData.forEach((n: any) => {
      let nodeArr = new Array<any>();
      n.data.people.forEach((p: any) => {
        nodeArr.push([p, 1]);
      });
      donutData.push(nodeArr);
    });
    // console.log(donutData);
    // return;
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
      });
  
    // node.append("circle") //background circle fill
    //   .attr("cx", 0)
    //   .attr("cy", 0)
    //   .attr("r", circleSize - thickness)
    //   .attr("fill", "#F1F1F1");

    let arc = d3.arc()
      .innerRadius(circleSize - thickness)
      .outerRadius(circleSize);
    let pie = d3.pie().value((d: any) => { return d[1]; });

    // let values = donutData.map(m => { return m[1]; });
    node.selectAll('path')
      .data((d: any, i: any) => {
        return pie(donutData[i]);
      })
      .enter()
      .append('g')
      .append('path')
      .attr('d', <any>arc)
      .attr('fill', (d: any) => { return this.cs.getColorForResume(d.data[0]); })
      .on('mouseover', (d: any) => {
        console.log('mouseover');
        console.log(d);
        if (d.data[0]) this.selectedResume.emit(d.data[0]);
      })
      .on('mouseout', (d: any) => {
        console.log('mouseout');
        this.selectedResume.emit('none');
      })
      .transition()
      .delay((d, i) => { return i * 25; })
      .duration(150)
      .attrTween('d', (d: any) => {
        var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
        return function (t: any) {
          d.endAngle = i(t);
          return arc(d);
        }
      });
  }

}
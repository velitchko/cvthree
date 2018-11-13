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
      if(selection) {
        console.log('selecting ');
        console.log(selection);
      }
    })
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      console.log(changes);
      if(this.data) this.drawTree('#tree-chart', this.data);
    }
  }

  drawTree(id: string, treeData: any): void {
    // First check this out : https://medium.com/@c_behrens/enter-update-exit-6cafc6014c36 to understand how enter, update, exit works
    // Tree already in proper format
    
    // Setup SVG Element - Start

    let margin = { top: 20, right: 20, bottom: 30, left: 20 },
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
    draw(root);

    // console.log(root);

    function draw(source) {

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


      // Let's append all enter nodes
      let nodeEnter = node
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', function (d) {
          return 'translate(' + source.x0 + ',' + source.y0 + ')';
        })
        .on('click', click);

      // Add circle for each enter node, but keep the radius 0

      nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 0)
        .style('fill', function (d: any) {
          return d._children ? 'lightsteelblue' : '#fff';
        });

      // Add text

      nodeEnter.append('text')
        .attr('dy', '.35em')
        .attr('x', function (d: any) {
          return d.children || d._children ? -1*circleSize : circleSize;
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
        .attr('r', circleSize)
        .style('fill', function (d: any) {
          return d._children ? 'lightsteelblue' : '#fff';
        })
        .attr('cursor', 'pointer');

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
        .style('fill-opacity', 0);


      // Let's draw links

      let link = g.selectAll('path.link')
        .data(links, function (d: any) { return d.id; });

      // Work on enter links, draw straight lines

      let linkEnter = link.enter().insert('path', 'g')
        .attr('class', 'link')
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

    function click(d) {
      console.log(d);
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      let children = d._children ? d._children : d.children;
      children.forEach((function(child) {
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
      draw(d);
    }
  }

}
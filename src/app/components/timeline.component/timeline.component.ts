import { Component, Input, ViewChild, ElementRef, AfterViewInit  } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UtilServices } from '../../services/util.service';
import { CompareService } from '../../services/compare.service';
import * as d3 from 'd3';
import { Timeline } from 'vis';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['timeline.component.scss']
})

export class TimelineComponent implements AfterViewInit {
    @Input() events: Array<any>;
    @ViewChild('timeline') timelineContainer: any;
    timeline: any;

    constructor() {

    }

    ngAfterViewInit(): void {
        console.log(this.events);
        this.createTimeline();
    }

    createTimeline(): void {
        let options = {
            showMinorLabels : false,
			showMajorLabels : true,
			zoomMin			: 86400000*365, // 1 year in ms
			zoomMax			: 86400000*365*20, // 10 years in ms
			minHeight		: '250px',
			showCurrentTime : false,
			tooltip: {
				followMouse: true,
				overflowMethod: 'cap'
			}
        }
        this.timeline = new Timeline(this.timelineContainer.nativeElement, this.events);
        this.timeline.setOptions(options);

        this.timeline.on('select', (properties: any) => {
            console.log('select');
            console.log(properties);
        });
    }
}

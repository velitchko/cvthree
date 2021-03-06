import { Component, Input, ViewChild, SimpleChanges, OnChanges, Output, EventEmitter, AfterViewInit  } from '@angular/core';
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

export class TimelineComponent implements OnChanges {
    @Input() events: Array<any>;
    @Input() groups: Array<any>;
    @Output() selectedEvent: EventEmitter<any>;
    @ViewChild('timeline') timelineContainer: any;
    timeline: any;

    constructor(private cs: CompareService) {
        this.selectedEvent = new EventEmitter<any>();
        this.cs.currentlySelectedResume.subscribe((selection: any) => {
            if(selection && this.events && this.timeline) {
                let selectedIDs = new Array<number>();
                this.events.forEach((e: any) => {
                    if(e.resumeID === selection) selectedIDs.push(e.id);
                });

                this.timeline.setSelection(selectedIDs);
            }
        })
        this.cs.currentlySelectedEvents.subscribe((selection: any) => {
            if(!selection) return;
            if(selection.from === 'map' && this.timeline) {
                if(selection.event === undefined) {
                    this.timeline.setSelection();
                } else {
                    this.timeline.setSelection(selection.event, { focus: true, animation: true });
                }
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.events.currentValue.length !== 0) {
            if(!this.timeline) {
                this.createTimeline();
            } else {
                this.timeline.setGroups(this.groups);
                this.timeline.setItems(this.events);
            }
        }
    }

    clearFilter(): void {
        this.timeline.setItems(this.events);
    }

    filterByEventType($event): void {
        let filteredEvents = this.events.filter((e: any) => {
            return e.category === $event.value.toUpperCase();
        });
        this.timeline.setItems(filteredEvents);
    }
   
    filterByLocation($event: any): void {
        let filteredEvents = this.events
            .filter((e: any) => { 
                return  e.location.includes($event.target.value);
            });
            // .map((e: any) => { return e.id });
        this.timeline.setItems(filteredEvents);
    }

    createTimeline(): void {
        let options = {
            showMinorLabels : true,
			showMajorLabels : true,
			zoomMin			: 86400000*365, // 1 year in ms
			zoomMax			: 86400000*365*20, // 10 years in ms
			minHeight		: '250px',
			showCurrentTime : false,
			tooltip: {
				followMouse: true,
				overflowMethod: 'flip'
			}
        }
        this.timeline = new Timeline(this.timelineContainer.nativeElement, this.events, this.groups);
        this.timeline.setOptions(options);

        this.timeline.on('select', (properties: any) => {
            this.selectedEvent.emit({
                event: properties.items[0],
                from: 'timeline'
            });
            // event id
        });
    }
}
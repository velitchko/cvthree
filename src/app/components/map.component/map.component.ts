import { Component, Input, Output, Inject, ViewChild, ElementRef, AfterViewInit, EventEmitter } from '@angular/core';
import { DatabaseServices } from '../../services/db.service';
import { Resume } from '../../models/resume';
import { Work } from '../../models/work';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { UtilServices } from '../../services/util.service';
import { CompareService } from '../../services/compare.service';
import { environment } from '../../../environments/environment';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import * as d3 from 'd3';
declare var L: any;
@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['map.component.scss']
})

export class MapComponent implements AfterViewInit {
    @Input() resumes: any;
    @Output() selectedResume: EventEmitter<string>;
    @Output() selectedEvent: EventEmitter<any>;
    @ViewChild('map') mapContainer: any;
    map: any;
    isBrowser: boolean;
    markers: Array<any>;
    markerClusterGroup: any;

    constructor(@Inject(PLATFORM_ID) private _platformId: Object, private cs: CompareService) {
        this.markers = new Array<any>();
        this.selectedResume = new EventEmitter<string>();
        this.selectedEvent = new EventEmitter<any>();
        this.isBrowser = isPlatformBrowser(this._platformId);

        this.cs.currentlySelectedEvents.subscribe((selection: any)=> {
            if(!selection) return;
            if(selection.from === 'timeline') {
                this.triggerPopup(selection.event);
            }
        });
    }

    ngAfterViewInit(): void {
        if (this.isBrowser) {
            L = require('leaflet');
            // leaflet plugins automatically inject themselves and extend "L"
            require('leaflet.markercluster');   // clustering markers
            // require('leaflet.polyline.snakeanim'); // animation for routing
            // require('polyline-encoded'); // decoding polylines
            // require('leaflet.heat'); // heatmap for leaflet
            this.createMap();
        }
    }

    createMap(): void {
        let options = {
            maxZoom: 18,
            minZoom: 0,
            zoom: 12,
            zoomControl: false,
            animate: true,
            attributionControl: false
        };
        this.map = L.map('map', options).setView([0, 0], 0);
        this.map.invalidateSize();
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: '', //'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.light', // mapbox://styles/velitchko/cjefo9eu118qd2rodaoq3cpj1
            accessToken: environment.MAPBOX_API_KEY,
        }).addTo(this.map);


        this.markerClusterGroup = L.markerClusterGroup({ //https://github.com/Leaflet/Leaflet.markercluster#options
            showCoverageOnHover: false,
            spiderfyOnMaxZoom: true,
            zoomToBoundsOnClick: false,
            animate: true,
            animateAddingMarkers: true,
            //spiderfyDistanceMultiplier: 1.5,
            removeOutsideVisibleBounds: true,
            iconCreateFunction: (cluster: any) => {
                console.log(cluster);
                let events = this.calculateDistributionPerCluster(cluster);
                return L.divIcon({
                    iconSize: [35, 35], // size of the icon
                    className: 'cluster-map-marker',
                    events: events,
                    html: this.getSVGClusterIcon(events, cluster.getAllChildMarkers().length)
                });
            }
            //disableClusteringAtZoom: 17,
        });

        this.resumes.forEach((r: Resume) => {
            this.createMarkers(r);
        });

        this.markerClusterGroup.addTo(this.map);
        this.markerClusterGroup.on('click', (event: any) => {
            this.selectedEvent.emit({
                event: event.sourceTarget.work.identifier,
                from: 'map'
            });
        });
        let bounds = this.markerClusterGroup.getBounds();
        if(bounds._northEast && bounds._southWest) {
            this.map.fitBounds(bounds);
        }
    }

    calculateDistributionPerCluster(cluster: any): Map<string, number> {
        let childMarkers = cluster.getAllChildMarkers();
        let eventMap = new Map<string, number>();
        childMarkers.forEach((c: any) => {
            eventMap.set(c.resumeID, eventMap.get(c.resumeID) ? eventMap.get(c.resumeID) + 1 : 1);
        });
        return eventMap;
    }

    triggerPopup(id: number): void {
        if(id === undefined) this.markerClusterGroup.unspiderfy();
        this.markerClusterGroup.eachLayer((layer: any) => {
            if(layer.work.identifier === id) {
                this.markerClusterGroup.zoomToShowLayer(layer, () => {
                    layer.openPopup();
                });
                return;
            }
        });
    }

    selectResume(resume: Resume): void {
        console.log(resume);
        this.selectedResume.emit(resume.id);
    }

    getColor(id: string): string {
        return this.cs.getColorForResume(id);
    }

    getPopupContent(w: Work): string {
        return `${w.position} @ ${w.company}`;
    }

    getSVGClusterIcon(eventMap: Map<string, number>, childClusterCount: number = 0, cssClass: string = ''): string {
        // add tooltip
        console.log(childClusterCount);
        let data = Array.from(eventMap);
        let width = 35; // in pixels
        let height = 35; // in pixels
        let thickness = 7; // in pixels

        let radius = Math.min(width, height) / 2;

        let svg = d3.select('body').append('svg')
            .remove() // remove it after creating so we can create the icon and then return the HTML as a string to L
            .attr('class', 'custom-cluster-icon')
            .attr('width', width)
            .attr('height', height)

        let g = svg.append('g')
            .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');
        // in case that no themes are asssociated with the event
        // the cluster marker only appears as a gray circle
        // so we do 2 circles one outer, one inner
        // outerone gets covered by the donut chart if there are themes
        g.append("circle") //background circle fill
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", radius)
            .attr("fill", "#afafaf");
        g.append("circle") //background circle fill
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", radius - thickness)
            .attr("fill", "#F1F1F1");

        let arc = d3.arc()
            .innerRadius(radius - thickness)
            .outerRadius(radius);

        let pie = d3.pie();
        let values = data.map(m => { return m[1]; });

        let path = g.selectAll('path')
            .data(pie(values))
            .enter()
            .append('g')
            .append('path')
            .attr('d', <any>arc)
            .attr('fill', (d: any, i: number) => {
                return this.cs.getColorForResume(data[i][0]);
            })
            .transition()
            .delay((d, i) => { return i * 500; })
            .duration(500)
            .attrTween('d', (d: any) => {
                var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
                return function (t: any) {
                    d.endAngle = i(t);
                    return arc(d);
                }
            });
        if (childClusterCount) {
            g.append('text')
                .text(childClusterCount)
                .attr('text-anchor', 'middle')
                .attr('fill', '#5a5a5a')
                .attr('dy', '.35em');
        }
        return `<svg xmlns="http://www.w3.org/2000/svg" class="${cssClass}" viewBox="0 0 35 35">${svg.html()}</svg>`;
    }

    getSVGIcon(color: string): string {
        let svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
          <path fill="${color}" d="M23.2,6.3A12.3,12.3,0,0,0,18.7,1.81,12.08,12.08,0,0,0,12.5.15,12.08,12.08,0,0,0,6.3,1.81,12.3,12.3,0,0,0,1.81,6.3,12.08,12.08,0,0,0,.15,12.5a12.08,12.08,0,0,0,1.66,6.2,12.3,12.3,0,0,0,4.5,4.49,12.08,12.08,0,0,0,6.2,1.66,12.08,12.08,0,0,0,6.2-1.66,12.3,12.3,0,0,0,4.49-4.49,12.08,12.08,0,0,0,1.66-6.2A12.08,12.08,0,0,0,23.2,6.3Z"/>
        </svg>
      `;
        return svg;
    }

    createMarkers(resume: Resume): void {
        let icon = L.divIcon({
            iconSize: [25, 25],
            className: 'default-map-marker',
            html: this.getSVGIcon(this.cs.getColorForResume(resume.id))
        });
        resume.work.forEach((w: Work) => {
            let marker = L.marker([w.location.lat, w.location.lng], { icon: icon });
            marker.work = w;
            marker.resumeID = resume.id;
            marker.bindPopup(this.getPopupContent(w));
            // marker.addTo(this.map);
            this.markers.push(marker);
            this.markerClusterGroup.addLayer(marker);
        });
    }
}
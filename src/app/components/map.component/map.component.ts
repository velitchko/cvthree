import { Component, Input, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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

declare var L: any;
@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['map.component.scss']
})

export class MapComponent implements AfterViewInit {
    @Input() resumes: any;
    @ViewChild('map') mapContainer: any;
    map: any;
    isBrowser: boolean;
    constructor(@Inject(PLATFORM_ID) private _platformId: Object, private cs: CompareService) {
        this.isBrowser = isPlatformBrowser(this._platformId);
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

        this.resumes.forEach((r: Resume) => {
            this.createMarkers(r);
        });
    }

    getPopupContent(w: Work): string {
        return `${w.position} @ ${w.company}`;
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
            iconSize: [25,25],
            className: 'default-map-marker',
            html: this.getSVGIcon(this.cs.getColorForResume(resume.id))
        });
        console.log(resume);
        resume.work.forEach((w: Work) => {
            let marker = L.marker([w.location.lat, w.location.lng], { icon: icon });
            marker.bindPopup(this.getPopupContent(w));
            marker.addTo(this.map);
        });
    }
}
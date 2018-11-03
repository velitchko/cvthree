import { Component, Input, Inject, ViewChild, ElementRef, AfterViewInit  } from '@angular/core';
import { DatabaseServices } from '../../services/db.service';
import { Resume } from '../../models/resume';
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
    @Input() events: any;
    @ViewChild('map') mapContainer: any;
    map: any;
    isBrowser: boolean;
    constructor(@Inject(PLATFORM_ID) private _platformId: Object) {
        this.isBrowser = isPlatformBrowser(this._platformId);
    }


    ngAfterViewInit(): void {
        if(this.isBrowser) {
            L = require('leaflet');
            // leaflet plugins automatically inject themselves and extend "L"
            // require('leaflet.markercluster');   // clustering markers
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
        this.map = L.map('map', options).setView([0,0], 0);
        this.map.invalidateSize();
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: '', //'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: 'mapbox.light', // mapbox://styles/velitchko/cjefo9eu118qd2rodaoq3cpj1
      accessToken: environment.MAPBOX_API_KEY,
      }).addTo(this.map);
    }

    createMarker(): void {}
}
import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'CVTHREE';
  loading: boolean = true;

  constructor(private cd: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.loading = false;
    this.cd.detectChanges();
  }
}

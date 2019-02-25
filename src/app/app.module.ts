import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app.routing.module';

// COMPONENTS
import { AppComponent } from './app.component';
import { MenuComponent } from './components/menu.component/menu.component';
import { AddComponent } from './components/add.component/add.component';
import { HomeComponent } from './components/home.component/home.component';
import { FooterComponent } from './components/footer.component/footer.component';
import { ViewComponent } from './components/view.component/view.component';
import { ListComponent } from './components/list.component/list.component';
import { EditComponent } from './components/edit.component/edit.component';
import { CompareComponent } from './components/compare.component/compare.component';
import { TreeComponent } from './components/tree.component/tree.component';
import { FileUploadComponent } from './components/file.upload.component/file.upload.component';
import { SearchComponent } from './components/search.component/search.component';
import { ScatterPlotComponent } from './components/scatterplot.component/scatterplot.component';
import { CompareScatterPlotComponent } from './components/compare.scatterplot.component/compare.scatterplot.component';
import { CompareLinePlotComponent } from './components/compare.lineplot.component/compare.lineplot.component';
import { TreeChartComponent } from './components/treechart.component/treechart.component';
import { RadarChartComponent } from './components/radarchart.component/radarchart.component';
import { TimelineComponent } from './components/timeline.component/timeline.component';
import { MapComponent } from './components/map.component/map.component';
// SERVICES
import { CompareService } from './services/compare.service';
import { DatabaseServices } from './services/db.service';
import { UtilServices } from './services/util.service';
// PIPES
// DIRECTIVES
import { LinkDirective } from './directives/link.directive';
// forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// DRAG & DROP FILE UPLOAD MODULE
import { FileDropModule } from 'ngx-file-drop';

// material ui
import {CdkTreeModule} from '@angular/cdk/tree';
import {
  MAT_DATE_LOCALE,
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatStepperModule,
  MatTreeModule
 } from '@angular/material';

export const APP_ID = 'cvthree';

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: APP_ID }),
    CdkTreeModule,
    FileDropModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatStepperModule,
    MatTreeModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    AppComponent,
    MenuComponent,
    AddComponent,
    HomeComponent,
    FooterComponent,
    ViewComponent,
    ListComponent,
    EditComponent,
    CompareComponent,
    TreeComponent,
    FileUploadComponent,
    SearchComponent,
    ScatterPlotComponent,
    CompareScatterPlotComponent,
    CompareLinePlotComponent,
    TreeChartComponent,
    RadarChartComponent,
    TimelineComponent,
    MapComponent,
    LinkDirective
  ],
  providers: [
    CompareService,
    DatabaseServices,
    UtilServices,
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'}, // Locale for datepicker
    { provide: 'WINDOW', useFactory: getWindow },
    { provide: 'DOCUMENT', useFactory: getDocument }
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }

export function getWindow() {
  return (typeof window !== "undefined") ? window : null;
}

export function getDocument() {
  return (typeof document !== "undefined") ? document : null;
}

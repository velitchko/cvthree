import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app.routing.module';
// DRAG & DROP FILE UPLOAD MODULE
import { FileDropModule } from 'ngx-file-drop';
// COMPONENTS
import { AppComponent } from './app.component';
import { MenuComponent } from './components/menu.component/menu.component';
import { AddComponent } from './components/add.component/add.component';
import { HomeComponent } from './components/home.component/home.component';
import { ViewComponent } from './components/view.component/view.component';
import { ListComponent } from './components/list.component/list.component';
import { EditComponent } from './components/edit.component/edit.component';
import { CompareComponent } from './components/compare.component/compare.component';
import { FileUploadComponent } from './components/file.upload.component/file.upload.component';
// SERVICES
import { DatabaseServices } from './services/db.service';
import { UtilServices } from './services/util.service';
// PIPES

// forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// material ui
import {
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
 } from '@angular/material';

export const APP_ID = 'cvthree';

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: APP_ID }),
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
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    FileDropModule
  ],
  declarations: [
    AppComponent,
    MenuComponent,
    AddComponent,
    HomeComponent,
    ViewComponent,
    ListComponent,
    EditComponent,
    CompareComponent,
    FileUploadComponent
  ],
  providers: [ DatabaseServices, UtilServices ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }

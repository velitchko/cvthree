// angular
import { Component, OnInit, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, ChangeDetectorRef, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Resume } from '../../models/resume';
import { Profile } from '../../models/profile';
import { Work } from '../../models/work';
import { Location } from '../../models/location';
import { Publication } from '../../models/publication';
import { Course } from '../../models/course';
import { Education } from '../../models/education';
import { Award } from '../../models/award';
import { Skill } from '../../models/skill';
import { Interest } from '../../models/interest';
import { Language } from '../../models/language';
import { Reference } from '../../models/reference';
import { Project }  from '../../models/project';
import { LanguageLevel } from '../../lists/language.level';
import { SkillLevel } from '../../lists/skill.level';
import { DatabaseServices } from '../../services/db.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { environment } from '../../../environments/environment';

// regex for input validation
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
//TODO const PHONE_REGEX = ;
const URL_REGEX = /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/;

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['edit.component.scss']
})

export class EditComponent implements OnInit {
  // end Resume format (initialized when attempting to create DB entry)
  resume: Resume;
  private resumeDiff: KeyValueDiffer<string, any>;
  step = 0;

  selectedId: string;

  // loading spinner trigger
  uploading: boolean = false;
  saving: boolean = false;
  saved: boolean = false;
  unsaved: boolean = false;

  // internal objects used for data-binding
  language: Language;
  profile: Profile;
  skill: Skill;
  interest: Interest;
  reference: Reference;
  publication: Publication;
  project: Project;
  work: Work;

  // geocoder from google used on client side only!
  geocoder: any;

  // FormControl Elements TODO Combine to one formgroup and validate that?
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(EMAIL_REGEX)
  ]);
  urlFormControl = new FormControl('', [
    Validators.pattern(URL_REGEX)
  ]);
  firstNameFormControl = new FormControl('', [
    Validators.required
  ]);
  lastNameFormControl = new FormControl('', [
    Validators.required
  ]);
  birthdayFormControl = new FormControl('', [
      Validators.required
  ]);
  occupationFormControl = new FormControl('', [
    Validators.required
  ]);
  generalAddressFormControl = new FormControl('', [
    Validators.required
  ]);
  generalCityFormControl = new FormControl('', [
    Validators.required
  ]);
  generalCountryFormControl = new FormControl('', [
    Validators.required
  ]);
  eventAddressFormControl = new FormControl('', [
    Validators.required
  ]);
  eventCityFormControl = new FormControl('', [
    Validators.required
  ]);
  eventCountryFormControl = new FormControl('', [
    Validators.required
  ]);
  eventStartdateFormControl = new FormControl('', [
    Validators.required
  ]);
  eventEnddateFormControl = new FormControl('', [
    // if provided should be after starting date
  ]);
  eventCategoryFormControl = new FormControl('', [
    Validators.required
  ]);
  eventTitleFormControl = new FormControl('', [
    Validators.required
  ]);

  // Converts ENUM list for language levels to iterable array
  // *ngFor = let ll of levels()
  levels(): Array<String> {
   const levels = Object.keys(LanguageLevel);
   return levels.slice(levels.length/2);
 };

  proficiencies(): Array<String> {
    const proficiencies = Object.keys(SkillLevel);
    return proficiencies.slice(proficiencies.length/2);
  };

  constructor(
    private db: DatabaseServices,
    private cd: ChangeDetectorRef,
    private differs: KeyValueDiffers,
    private router: Router,
    private route: ActivatedRoute) {
      this.route.params.subscribe( (param: Params) => {
        this.selectedId = param['id'];
        this.db.getResume(this.selectedId).then((success: any) => {
          this.resume = success;
          this.resumeDiff = this.differs.find(this.resume).create();
        });
      });
  }

  ngOnInit(): void {
    
  }

  
  ngDoCheck(): void {
    if(!this.resumeDiff) return;
    const changes = this.resumeDiff.diff(this.resume);
    if (changes) {
      this.resumeChanged(changes);
    }
  }
  
  resumeChanged(changes: KeyValueChanges<string, any>) {
    this.saved = false;
    this.saving = false;
    this.unsaved = true;
    this.cd.detectChanges();
    /* If you want to see details then use
      changes.forEachRemovedItem((record) => ...);
      changes.forEachAddedItem((record) => ...);
      changes.forEachChangedItem((record) => ...);
    */
  }

  setStep(index: number): void {
    this.step = index;
  }

  nextStep(): void {
    this.step++;
  }

  prevStep(): void {
    this.step--;
  }

  save(): void {
    this.saveResume();
  }

  generalInfoOK(): boolean {
    return this.firstNameFormControl.valid && this.lastNameFormControl.valid
        && this.birthdayFormControl.valid && this.occupationFormControl.valid
        && this.generalAddressFormControl.valid && this.generalCityFormControl.valid
        && this.generalCountryFormControl.valid;
  }

  contactInfoOK(): boolean {
    return this.emailFormControl.valid; // && phone here
  }

  languageInfoOK(): boolean {
    return this.resume.languages.length > 0; // name + level required
  }

  skillInfoOK(): boolean {
    return this.resume.skills.length > 0; // name + level required
  }

  interestInfoOK(): boolean {
    return this.resume.interests.length > 0; // name required
  }

  eventInfoOK(): boolean {
    return this.resume.work.length > 0; // title, address, city, country, type, startdate required
  }

  referenceInfoOK(): boolean {
    return this.resume.references.length > 0; // reference + employer required
  }

  onFileInput(event: any): void {

  }

  updateProfilePicture($event): void {
    this.resume.profilePicture = `${environment.API_PATH}${$event}`;
    this.cd.detectChanges();
  }

  clearPicture(): void {
    this.resume.profilePicture = `${environment.API_PATH}uploads/default.jpg`;
    this.cd.detectChanges();
  }

  addNetwork(url: any, handle: any) {
    this.profile = new Profile();

    this.profile.url = url.value;
    this.profile.username = handle.value;
    
    this.resume.profiles.push(this.profile);

    url.value = '';
    handle.value = '';
  }

  addLanguage(lang: any, level: any): void {
    this.language = new Language();

    this.language.name = lang.value;
    this.language.level = level.value;

    this.resume.languages.push(this.language);

    lang.value = '';
    level.value = '';
  }

  deleteLanguage(idx: any): void {
    this.resume.languages.splice(idx, 1);
  }

  addInterest(interest: any): void {
    this.interest = new Interest();

    this.interest.name = interest.value;

    this.resume.interests.push(this.interest);

    interest.value = '';
  }

  deleteInterest(idx: any): void {
    this.resume.interests.splice(idx, 1);
  }

  addReference(reference: any, employer: any, position: any): void {
    this.reference = new Reference();

    this.reference.reference = reference.value;
    this.reference.company = employer.value;
    this.reference.position = position.value;
    
    this.resume.references.push(this.reference);

    reference.value = '';
    employer.value = '';
    position.value = '';
  }

  deleteReference(idx: any): void {
    this.resume.references.splice(idx, 1);
  }

  // TODO: move this to util / DB presave
  geoCode(address: string, city: string, postalcode: number, country: string): Promise<any> {
    let promise = new Promise<any>((resolve, reject) => {
      // TODO: geocoding http requests here
      // using google maps currently
    });

    return promise;
  }

  addEvent(): void {

  }

  skillsUpdated($event: any): void {
    this.resume.skills = $event;
    console.log(this.resume.skills);
  }

  deleteEvent(idx: any): void {
    this.resume.work.splice(idx, 1);
  }

  saveResume(): void {
    this.saving = true;
    this.db.updateResume(this.resume.id, this.resume).then((success: any) => {
      if(success.message === "OK") {
        this.saving = false;
        this.saved = true;
        this.unsaved = false;
        this.cd.detectChanges();
      }
      else console.log(success);
    })
  }

  view(): void {
    this.router.navigate(['/view', this.resume.id]);
  }
}

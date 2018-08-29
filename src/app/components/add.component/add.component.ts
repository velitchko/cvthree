// angular
import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
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
import { Router } from '@angular/router';

// regex for input validation
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
//const PHONE_REGEX = ;
const URL_REGEX = /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/;

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['add.component.scss']
})

export class AddComponent  {
  // end Resume format (initialized when attempting to create DB entry)
  resume: Resume;
  step = 0;

  // loading spinner trigger
  uploading: boolean = false;
  saving: boolean = false;
  saved: boolean = false;
  edit: boolean = false;

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

  constructor( private db: DatabaseServices, private ref: ChangeDetectorRef, @Inject(PLATFORM_ID) private platformId: Object, private router: Router ) {
    this.resume = new Resume();
    if(isPlatformBrowser(this.platformId)) {
    }
  }

  ngOnInit():void {}

  ngAfterViewInit():void {}

  ngOnDestroy():void {}

  setStep(index: number): void {
    this.step = index;
  }

  nextStep(): void {
    this.step++;
  }

  prevStep(): void {
    this.step--;
  }

  editMode(): void {
    // enter edit mode
    this.edit = true;
  }

  save(): void {
    // edit edit model
    this.edit = false;
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

  clearPicture(): void {
    this.resume.profilePicture = '';
  }

  addNetwork() {
    this.profile = new Profile();

    this.resume.profiles.push(this.profile);
  }

  addLanguage(lang: any, level: any): void {
    this.language = new Language();

    this.resume.languages.push(this.language);
    lang.value = '';
    level.value = '';
  }

  deleteLanguage(idx: any): void {
    this.resume.languages.splice(idx, 1);
  }

  addSkill(skill: any, proficiency: any): void {
    this.skill = new Skill();

    this.resume.skills.push(this.skill);
  }

  deleteSkill(idx: any): void {
    this.resume.skills.splice(idx, 1);
  }

  addInterest(interest: any): void {
    this.interest = new Interest();

    this.resume.interests.push(this.interest);

  }

  deleteInterest(idx: any): void {
    this.resume.interests.splice(idx, 1);
  }

  addReference(reference: any, employer: any): void {
    this.reference = new Reference();

    this.resume.references.push(this.reference);

  }

  deleteReference(idx: any): void {
    this.resume.references.splice(idx, 1);
  }

  geoCode(address: string, city: string, postalcode: number, country: string, callback: Function): void {

  }

  addEvent(): void {

  }

  deleteEvent(idx: any): void {
    this.resume.work.splice(idx, 1);
  }

  // TODO refactor
  saveResume(): void {
    this.saving = true;

  }

  view(): void {
    this.router.navigate(['/view', this.resume.id]);
  }
}

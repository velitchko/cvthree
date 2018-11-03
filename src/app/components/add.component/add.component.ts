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
import * as moment from 'moment';
import { environment } from '../../../environments/environment';

// regex for input validation
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
//TODO const PHONE_REGEX = ;
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

  constructor(
    private db: DatabaseServices,
    private ref: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router ) {
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

  updateProfilePicture($event: any): void {
    this.resume.profilePicture = `${environment.API_PATH}${$event}`;
    this.ref.detectChanges();
  }

  clearPicture(): void {
    this.resume.profilePicture = '';
  }

  addNetwork(acc: any, network: any, url: any) {
    this.profile = new Profile();
    this.profile.network = network.value;
    this.profile.username = acc.value;
    this.profile.url = url.value;

    this.resume.profiles.push(this.profile);

    url.value = '';
    acc.value = '';
    network.value = '';
  }

  deleteNetwork(idx: any): void {
    this.resume.profiles.splice(idx, 1);
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

  saveSkills($event: any): void {
    console.log('skills saved');
    console.log($event);
    this.resume.skills = $event;
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

  addReference(reference: any, position: any, employer: any): void {
    this.reference = new Reference();
    this.reference.company = employer.value;
    this.reference.reference = reference.value;
    this.reference.position = position.value;
    this.resume.references.push(this.reference);

    reference.value = '';
    position.value = '';
    employer.value = '';
  }

  deleteReference(idx: any): void {
    this.resume.references.splice(idx, 1);
  }

  geoCode(address: string, city: string, postalcode: number, country: string): Promise<any> {
    let promise = new Promise<any>((resolve, reject) => {
      // TODO geocoding http requests here
      // using google maps currently
    });

    return promise;
  }

  addEvent(title: any, desc: any, company: any, position: any, url: any, address: any, postalcode: any, city: any, country: any, startDate: any, endDate: any): void {
    let location = new Location();
    location.address = address.value;
    location.postalCode = postalcode.value;
    location.city = city.value;
    location.country = country.value;

    let work = new Work();
    work.startDate = moment(startDate.value, 'DD-MM-YYYY').toDate();
    work.endDate = moment(endDate.value, 'DD-MM-YYYY').toDate();
    work.location = location;
    work.description = desc.value;
    work.summary = title.value;
    work.company = company.value;
    work.position = position.value;
    work.url = url.value;

    this.resume.work.push(work);

    title.value = '';
    desc.value = '';
    company.value = '';
    position.value = '';
    url.value = '';
    address.value = '';
    postalcode.value = '';
    city.value = '';
    country.value = '';
    startDate.value = '';
    endDate.value = '';

    this.ref.detectChanges();
  }

  deleteEvent(idx: any): void {
    this.resume.work.splice(idx, 1);
  }

  addEducation(institution: any, studies: any, degree: any, startDate: any, endDate: any): void {
    let education = new Education();

    education.institution = institution.value;
    education.studies = studies.value;
    education.degree = degree.value;
    education.startDate = moment(startDate.value, 'DD-MM-YYYY').toDate();
    education.endDate = moment(endDate.value, 'DD-MM-YYYY').toDate();

    this.resume.education.push(education);

    institution.value = '';
    studies.value = '';
    degree.value = '';
    startDate.value = '';
    endDate.value = '';

    this.ref.detectChanges();
  }

  deleteEducation(idx: any): void {
    this.resume.education.splice(idx, 1);
  }

  addProject(title: any, url: any, summary: any, startDate: any, endDate: any): void {
    let project = new Project();

    project.title = title.value;
    project.url = url.value;
    project.summary = summary.value;
    project.startDate = moment(startDate.value, 'DD-MM-YYYY').toDate();
    project.endDate = moment(endDate.value, 'DD-MM-YYYY').toDate();

    this.resume.projects.push(project);

    title.value = '';
    url.value = '';
    summary.value = '';
    startDate.value = '';
    endDate.value = '';

    this.ref.detectChanges();
  }

  deleteProject(idx: any): void {
    this.resume.projects.splice(idx, 1);
  }

  addPublication(title: any, publisher: any, summary: any, url: any, date: any): void {
    let publication = new Publication();
    publication.title = title.value;
    publication.publisher = publisher.value;
    publication.summary = summary.value;
    publication.url = url.value;
    publication.date = moment(date.value, 'DD-MM-YYYY').toDate();

    this.resume.publications.push(publication);

    title.value = '';
    publisher.value = '';
    summary.value = '';
    url.value = '';
    date.value = '';

    this.ref.detectChanges();
  }

  deletePublication(idx: any): void {
    this.resume.publications.splice(idx, 1);
  }

  addCertificateAward(title: any, awarder: any, summary: any, date: any): void {
    let award = new Award();
    award.title = title.value;
    award.awarder = awarder.value;
    award.summary = summary.value;
    award.date = moment(date.value, 'DD-MM-YYYY').toDate();

    this.resume.awards.push(award);

    title.value = '';
    summary.value = '';
    awarder.value = '';
    date.value =  '';
    this.ref.detectChanges();
  }

  deleteCertificateAward(idx: any): void { 
    this.resume.awards.splice(idx, 1);
  }


  saveResume(): void {
    this.saving = true;
    this.db.createResume(this.resume).then((success: any) => {
      if(success.message === "OK") this.saving = false;
      else console.log(success);
    });
  }

  view(): void {
    this.router.navigate(['/view', this.resume.id]);
  }
}

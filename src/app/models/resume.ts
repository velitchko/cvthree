import { Profile } from './profile';
import { Work } from './work';
import { Location } from './location';
import { Publication } from './publication';
import { Course } from './course';
import { Education } from './education';
import { Award } from './award';
import { Skill } from './skill';
import { Interest } from './interest';
import { Language } from './language';
import { Reference } from './reference';
import { Project }  from './project';
import { environment } from '../../environments/environment';

export class Resume {
  id: string; // Managed by MongoDB
  firstName: string;
  lastName: string;
  birthDay: Date;
  label: string; //occupation
  profilePicture: string; //url to pic
  email: string;
  phone: string;
  summary: string;
  url: string; //personal website
  location: Location;
  profiles: Array<Profile>;
  work: Array<Work>;
  publications: Array<Publication>;
  courses: Array<Course>;
  education: Array<Education>;
  awards: Array<Award>;
  certificates: Array<Award>;
  skills: Array<Skill>;
  interests: Array<Interest>;
  languages: Array<Language>;
  references: Array<Reference>;
  projects: Array<Project>;
  // used for frontend highlighting
  selected?: boolean = false;

  constructor() {
    this.profilePicture = `${environment.API_PATH}uploads/default.jpg`;
    this.profiles = new Array<Profile>();
    this.publications = new Array<Publication>();
    this.work = new Array<Work>();
    this.courses = new Array<Course>();
    this.education = new Array<Education>();
    this.awards = new Array<Award>();
    this.certificates = new Array<Award>();
    this.skills = new Array<Skill>();
    this.interests = new Array<Interest>();
    this.languages = new Array<Language>();
    this.references = new Array<Reference>();
    this.projects = new Array<Project>();
    this.location = new Location();
  }

  toJSON(): any {
    return JSON.stringify(this);
  }
}

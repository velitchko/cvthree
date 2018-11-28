import { Location } from './location';

export class Education {
  institution: string;
  studies: string;
  degree: string;
  startDate: Date;
  endDate: Date;
  identifier?: number;
  oldIdx?: number;
  location: Location;
}

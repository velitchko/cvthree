import { Location } from './location';

export class Work {
  company: string;
  description: string;
  position: string;
  startDate: Date;
  endDate: Date;
  url: string;
  summary: string;
  highlights: Array<string>;
  location: Location;
  identifier?: number;
  oldIdx?: number;
  
  constructor() {
    this.highlights = new Array<string>()
  }
}

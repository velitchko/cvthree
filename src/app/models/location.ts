export class Location {
  address: string;
  postalCode: string;
  city: string;
  country: string;
  lat: number;
  lng: number;

  constructor() {
    this.address = '';
    this.postalCode = '';
    this.city = '';
    this.country = '';
  }
}

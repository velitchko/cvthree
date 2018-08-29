import * as mongoose from 'mongoose';
import * as request from 'request-promise';
import { environment } from '../../environments/environment';

// resource: https://jsonresume.org/schema/
let ResumeSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  label: String,
  birthday: Date,
  profilePicture: String,
  email: String,
  phone: String,
  summary: String,
  url: String,
  location: {
    address: String,
    postalCode: String,
    city: String,
    country: String,
    lat: Number,
    lng: Number
  },
  profiles: [{
    network: String,
    url: String,
    username: String
  }],
  work: [{
    company: String,
    description: String,
    position: String,
    startDate: Date,
    endDate: Date,
    url: String,
    summary: String,
    highlights: [{
      highlight: String
    }],
    location: {
      address: String,
      postalCode: String,
      city: String,
      country: String,
      lat: Number,
      lng: Number
    }
  }],
  publications: [{
    title: String,
    publisher: String,
    date: Date,
    summary: String,
    url: String
  }],
  courses: [{}], // ?
  education: [{
    institution: String,
    studies: String,
    degree: String,
    startDate: Date,
    endDate: Date,
    location: String
  }],
  awards: [{
    title: String,
    date: Date,
    awarder: String,
    summary: String
  }], // honors
  certificates: [{
    title: String,
    date: Date,
    awarder: String,
    summary: String
  }],
  skills: [{ // TODO how to make hierarchical?
    name: String,
    level: String,
    keywords: [String]
  }],
  languages: [{
    name: String,
    level: String
  }],
  interests: [{
    name: String,
    keywords: [String]
  }],
  references: [{
    name: String,
    company: String,
    position: String,
    reference: String
  }],
  projects: [{
    title: String,
    startDate: Date,
    endDate: Date,
    url: String,
    summary: String
  }]
});
// TODO
// finalize schema
// validation
// testing
// error catching and reporting

// make all text fields indexable
ResumeSchema.index({'$**': 'text'});

// set dates - geocode things pre save
ResumeSchema.pre('save', function(next) {
  let _self: any = this;
  let promiseArr = new Array<Promise<any>>();
  _self.work.forEach((w: any) => {
    // geocode location
    let address = `${w.address} ${w.postalCode} ${w.city} ${w.country}`;
    let options = {
      method: 'GET',
      url: 'https://maps.googleapis.com/maps/api/geocode/json',
      qs: {
        address: address,
        key: environment.GMAPS_API_KEY
      }
    };

    promiseArr.push(new Promise<any>((resolve, reject) => {
      request(options).then((response: any) => {
      // check if everything is aite
      // save coords
      // do a resolve
      let coords = JSON.parse(response).results[0].geometry.location;
      w.location.lat = +coords.lat;
      w.location.lng = +coords.lng;
      resolve(w);
    })
    }));
  });


  // once everything resolves rewrite work array and save
  Promise.all(promiseArr).then((success) => {
    console.log('all promises resolved');
    console.log(success);
    next();
  }).catch((err) => {
    console.log('ERROR');
    console.log(err);
    return;
  })
});

let Resume = mongoose.model('Resumes', ResumeSchema);
module.exports = Resume;

import * as mongoose from 'mongoose';
import * as request from 'request-promise';
import { environment } from '../../environments/environment';
import { resolve } from 'q';
let NodeGeocoder  = require('node-geocoder');

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
  skills: [{
    name: String,
    level: String,
    experience: Number,
    children: []
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
    // name: String,
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
ResumeSchema.index({ '$**': 'text' });

function setSkillSizes(skills: any[]): void {
  for(let i = 0; i < skills.length; i++) {
    let s = skills[i];
    if (s.children) setSkillSizes(s);
    else s.size = 1;
  }
}

function preSave(_self: any, next: any): void {
  setSkillSizes(_self.skills);
  let options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: environment.GMAPS_API_KEY,
    formatter: null
  };
  let geocoder = NodeGeocoder(options);
  let addrArr = new Array<string>();
  _self.work.forEach((w: any) => {
    // geocode location
    // if(w.location.lat && w.location.lng) return; // already has lat and lng
    addrArr.push(`${w.location.address} ${w.location.postalCode} ${w.location.city} ${w.location.country}`);
  });
  geocoder.batchGeocode(addrArr).then((success) => {
    success.forEach((s: any, idx: number) => {
      _self.work[idx].location.lat = s.value[0].latitude;
      _self.work[idx].location.lng = s.value[0].longitude;
    });
    next();
  }).catch((err) => {
    console.log('Could not geocode');
    console.log(err);
    next();
  })
}

// set dates - geocode things pre save
ResumeSchema.pre('save', function (next) {
  preSave(this, function(){
    console.log('presave - next');
    next();
  });
});

ResumeSchema.pre('findOneAndUpdate', function (next) {
  this.findOne({_id: this.getQuery()._id }, (err, doc) => {
    if(err) return;  
    preSave(doc, function() {
      console.log('preupdate - next');
      next();
    })
  });
});

let Resume = mongoose.model('Resumes', ResumeSchema);
module.exports = Resume;


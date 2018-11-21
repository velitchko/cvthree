import { ngExpressEngine, NgSetupOptions } from '@nguniversal/express-engine';

import * as mongoose from 'mongoose';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as multer from 'multer';
import * as slash from 'slash';
import * as fs from 'fs';
import * as path from 'path';
import * as request from 'request';
import * as score from './score';

let Resume = require('./db/schemas/resume');

export function createApi(distPath: string, ngSetupOptions: NgSetupOptions) {
  const UPLOAD_DIR_PATH = 'uploads';

  const api = express();

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
      cb(null, Date.now()  + '-' + file.originalname)
    }
  });

  const upload = multer({ storage: storage });

  mongoose.connect('mongodb://localhost/cvthree', { useNewUrlParser: true });

  api.use(bodyParser.json());
  api.use(bodyParser.urlencoded({ extended: true }));

  api.set('view engine', 'html');
  api.set('views', distPath);

  // Angular Express Engine
  api.engine('html', ngExpressEngine(ngSetupOptions));

  // Server static files from distPath
  api.get('*.*', express.static(distPath));

  //
  // function readJSONFile(filename, callback) {
  //   fs.readFile(filename, function (err, data: any) {
  //     if(err) {
  //       callback(err);
  //       return;
  //     }
  //     try {
  //       callback(null, JSON.parse(data));
  //     } catch(exception) {
  //       callback(exception);
  //     }
  //   });
  // }
  //
  // function getBirthday(): Date {
  //   let bday = new Date();
  //   return bday;
  // }
  //
  // function getPhone(): String {
  //   let phone = '';
  //   return phone;
  // }
  //
  // function getLevel(): String {
  //   let level = '';
  //   return level;
  // }
  //
  // function extractHostname(url): String {
  //   var hostname;
  //   //find & remove protocol (http, ftp, etc.) and get hostname
  //
  //   if (url.indexOf("//") > -1) {
  //       hostname = url.split('/')[2];
  //   }
  //   else {
  //       hostname = url.split('/')[0];
  //   }
  //
  //   //find & remove port number
  //   hostname = hostname.split(':')[0];
  //   //find & remove "?"
  //   hostname = hostname.split('?')[0];
  //
  //   return hostname;
  // }
  //
  // function extractRootDomain(url): String {
  //   var domain = extractHostname(url),
  //       splitArr = domain.split('.'),
  //       arrLen = splitArr.length;
  //
  //   //extracting the root domain here
  //   //if there is a subdomain
  //   if (arrLen > 2) {
  //       domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
  //       //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
  //       if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
  //           //this is using a ccTLD
  //           domain = splitArr[arrLen - 3] + '.' + domain;
  //       }
  //   }
  //   return domain;
  // }
  //
  // function saveResume(json: any) {
  //   let resume = new Resume();
  //   resume.firstName = json.firstName;
  //   resume.lastName = json.lastName;
  //   resume.label = json.headline;
  //   resume.birthDay = getBirthday();// gen randomly
  //   resume.email = `${json.firstName}.${json.lastName}@gmail.com`;
  //   resume.profilePicture = ''; // set default
  //   resume.phone = getPhone(); // randomize
  //   resume.summary = json.summary;
  //   resume.url = json.url;
  //   resume.location.address = '';
  //   resume.locationcity = json.city;
  //   resume.location.country = 'USA';
  //   // address / postalCode/ city / country / lat / lng
  //   json.links.forEach((l: any) => {
  //     resume.profiles.push({
  //       username: `@${resume.firstName.toLowerCase()}`,
  //       url: l.url,
  //       network: extractRootDomain(l.url)
  //     });
  //   });
  //   resume.profiles // [network, url, username]
  //   json.workExperiences.forEach((w: any) => {
  //     let hl;
  //     if(w.highlights) {
  //       hl = new Array<string>();
  //       w.highlights.forEach((h: any) => {
  //         hl.push(h);
  //         // missing
  //       });
  //     }
  //     resume.work.push({
  //       company: w.company,
  //       description: w.description,
  //       position: w.title,
  //       startDate: w.dateRange.startDate ? w.dateRange.startDate.isoDate : null,
  //       endDate: w.dateRange.endDate ? w.dateRange.endDate.isoDate : null,
  //       url: '',
  //       summary: '',
  //       location: {
  //           address: '',
  //           city: w.location,
  //           postalCode: '',
  //           country: '',
  //       },
  //       highlights: hl || [],
  //     });
  //   });
  //    // [company, description, position, startD, endD, url, summary, highlights [str], location]
  //   json.publications.forEach((p: any) => {
  //     resume.publications.push({
  //       title: p.title,
  //       publisher: '',
  //       date: p.date ? p.date.isoDate : null,
  //       summary : p.description,
  //       url: p.url,
  //     })
  //   });
  //   // [title, publisher, date, summary, url/doi]
  //   //resume.courses // ??
  //   json.educations.forEach((e: any) => {
  //     resume.education.push({
  //       institution: e.school,
  //       studies: e.field,
  //       degree: e.degree,
  //       startDate: e.dateRange.startDate ? e.dateRange.startDate.isoDate : null,
  //       endDate: e.dateRange.endDate ? e.dateRange.endDate.isoDate : null,
  //       location: e.location
  //     });
  //   });
  //   json.awards.forEach((a: any) => {
  //     resume.awards.push({
  //       title: a.title,
  //       summary: a.summary,
  //       awarder: '', // missing
  //       date: a.date ? a.date.isoDate : null
  //     });
  //   });
  //    // [title, date, awarder, summary]
  //   json.certifications.forEach((c: any) => {
  //     resume.certificates.push({
  //       title: c.title,
  //       date: c.dateRange.endDate ? c.dateRange.endDate.isoDate : c.dateRange.startDate ? c.dateRange.startDate.isoDate : null,
  //       awarder: '',
  //       summary: c.description
  //     });
  //   });
  //  // [title, date, awarder, summary]
  //   json.skills.split(',').forEach((s: string) => {
  //     resume.skills.push({
  //       name: s,
  //       level: getLevel(),
  //       keywords: []
  //     })
  //   });
  //   // [name, level, keywords[str]]
  //   // resume.languages // [name, level]
  //   // resume.interests // [name, keywords[str]]
  //   // resume.references // [name, company, position, reference]
  //   // resume.projects // [title, startD, endD, url, summary]
  //   Resume.findOne({ firstName: resume.firstName, lastName: resume.lastName}, (err, found) => {
  //     if(!found) {
  //       resume.save();
  //     } else {
  //       console.log(`${found.firstName} ${found.lastName} exists`);
  //     }
  //   });
  //
  // }
  //
  //
  // api.get('/migrate', (req: express.Request, res: express.Response) => {
  //   readJSONFile('./src/resumes.json', function (err, json) {
  //      if(err) { throw err; }
  //      let idx = 0;
  //      console.log(json.resumes.length)
  //      for(let i = 0; i < json.resumes.length; i++) {
  //        //saveResume(json.data[i]);
  //        console.log(json.resumes[i].firstName + ' ' + json.resumes[i].lastName);
  //        saveResume(json.resumes[i]);
  //      }
  //    });
  //
  // });

  /**
   * Get resumes by id
   */
  api.get('/api/v1/resume/:id', (req: express.Request, res: express.Response) => {
    console.log('get resume ' + req.params.id);
    Resume.findOne({ _id : req.params.id }, (err, resume) => {
      if(err) {
        console.log(err);
        res.status(500).json({ message: 'ERROR', error: err, results: null });
      } else {
        res.status(200).json({ message: 'OK', results: resume });
      }
    });
  });

  /**
   * Get all resumes
   */
  api.get('/api/v1/resumes', (req: express.Request, res: express.Response) => {
    console.log('get resumes');
    Resume.find({}, (err, resumes) => {
      if(err) {
        console.log(err);
        res.status(500).json({ message: 'ERROR', error: err, results: [] });
      } else {
        res.status(200).json({ message: 'OK', results: resumes });
      }
    });
  });

  /**
   * Create new resume
   */
  api.post('/api/v1/resume', (req: express.Request, res: express.Response) => {
    console.log('post resume');
    let cv = new Resume();
    cv.firstName = req.body.firstName;
    cv.lastName = req.body.lastName;
    cv.label = req.body.label
    cv.birthday = req.body.birthday;
    cv.profilePicture = req.body.profilePicture || 'default.png';
    cv.email = req.body.email;
    cv.phone = req.body.phone;
    cv.summary = req.body.summary;
    cv.url = req.body.url;
    cv.location = req.body.location;
    cv.profiles = req.body.profiles;
    cv.work = req.body.work;
    cv.publications = req.body.publications;
    cv.courses = req.body.courses;
    cv.education = req.body.education;
    cv.awards = req.body.awards;
    cv.skills = req.body.skills;
    cv.certificates = req.body.certificates;
    cv.languages = req.body.languages;
    cv.interests = req.body.interests;
    cv.references = req.body.references;
    cv.projects = req.body.projects;

    cv.save((err, resume) => {
      if(err) {
        console.log(err);
        res.status(500).json({ message: 'ERROR', error: err, results: null });
      } else {
        console.log(resume);
        res.status(200).json({ message: 'OK', results: resume });
      }
    })
  });

  /**
   * Update resume
   */
  api.put('/api/v1/resumes/:id', (req: express.Request, res: express.Response) => {
    console.log('put resume ' + req.params.id);
    Resume.findOneAndUpdate({ _id : req.params.id }, { $set : req.body }, (err, resume) => {
      if(err) {
        console.log(err);
        res.status(500).json({ message: 'ERROR', error: err, results: null });
      } else {
        res.status(200).json({ message: 'OK', results: resume });
      }
    });
  });

  /**
   * Delete resume
   */
  api.delete('/api/v1/resume/:id', (req: express.Request, res: express.Response) => {
    console.log('delete resume ' + req.params.id);
    Resume.remove({ _id : req.params.id }, (err, resume) => {
      if(err) {
        console.log(err);
        res.status(500).json({ message: 'ERROR', error: err, results: [] });
      } else {
        res.status(200).json({ message: 'OK', results: null });
      }
    });
  });

  /**
   * Upload profile picture
   */
  api.post('/api/v1/uploads', upload.single("file"), (req: express.Request, res: express.Response) => {
    let filePath = req.file.path;
    console.log('upload req recieved ' + filePath);
    res.status(200).json({ "message" : 'file uploaded', "path" : slash(path.normalize(filePath)) });
  });

  /**
   * Get profile picture
   */
  api.get('/api/v1/uploads/:id', (req: express.Request, res: express.Response) => {
    if(req.params.id) {
      res.status(200).sendFile(path.resolve(`${UPLOAD_DIR_PATH}/${req.params.id}`));
    } else {
      res.status(404).json({ "message" : `${req.params.id} does not exist.`});
    }
  });

  /**
   * Search
   */
  api.post('/api/v1/skillquery', (req: express.Request, res: express.Response) => {
    let query = JSON.parse(req.body.query);
    let results = [];
    let subQs = [];
  
    // build query on-demand otherwise it will return all resumes
    if(query.searchLocation !== "") {
      // options i = case insensitive
      subQs.push({ 'location.city' : { $regex: query.searchLocation, $options: 'i' }});
      subQs.push({ 'location.country' : { $regex: query.searchLocation, $options: 'i' }});
      subQs.push({ 'location.address' : { $regex: query.searchLocation, $options: 'i' }});
    }

    if(query.searchOccupation !== "") {
      subQs.push({ 'label' : { $regex: query.searchOccupation, $options: 'i' }});
    }

    if(query.languages.length !== 0) {
      let languages = [];
      query.languages.forEach((q: any) => {
        languages.push(q.searchLanguage);
      });
      let regex = languages.map(function(l) { return new RegExp(l, "i"); });
      subQs.push({ 'languages.name' : { $in: regex }}); 
      // because in can only work with strings
      // we need to wrap the whole query around RegExp
    }

    let mongooseQ = {}; 
    subQs.length !== 0 ? mongooseQ['$or'] = subQs : '';
    Resume.find(mongooseQ, (err, resumes) => {
      if(err) {
        console.log(err); 
        res.status(500).json({ message: 'ERR', results: err});
      }
      resumes.forEach((r) => {
        let base = score.baseScore(r.skills, query.skills);
        let bonus = score.bonusScore(r.skills, query.skills);
        // if base is 0 and skills were requested return
        // else append to results
        if(base === 0 && query.skills.length !== 0) return;
        results.push({
          resume: r,
          base: base,
          bonus: bonus
        });
      });
      res.status(200).json({ message: 'OK', results: results });
    });
    //res.status(200).json({ message: 'OK', results: []});
  });

  api.post('/api/v1/query', (req: express.Request, res: express.Response) => {
    console.log('querying ');
    console.log(req.body.query);
    Resume.find( {$text: { $search: req.body.query } }, (err, resumes) => {
      if(err) {
        console.log(err);
        res.status(500).json({ message: 'ERROR', error: err, results: [] });
      } else {
        res.status(200).json({ message: 'OK', results: resumes });
      }
    });
  });

 

  // All regular routes use the Universal engine
  api.get('*', (req, res) => res.render('index', { req }));

  return api;
}

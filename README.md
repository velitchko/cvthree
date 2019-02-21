# CVTHREE

## Changelog
v2.5.0 - Prototype  
v2.0.0 - Angular 6 (update)  
v1.0.0 - Angular 2 

## Database Setup
Go to [MongoDB](https://www.mongodb.com/) download and setup MongoDB.

## Import Database
With administrator open a command line interface navigate to where MongoDB is installed and execute the following command:
`mongorestore --db cvthree db_dump/cvthree`

This should create and import all records from the database dump.

## Installing dependencies

run `npm install`

## Setting up API keys
This application requires a Mapbox API key.
You can set up your API key by following the guide here: [Mapbox API Key Guide](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/)

## Running the application

run `npm run dev` 
the application should be available at `http://localhost:8000`

## About

Interactive exploration environment for comparing multiple CVs.
Analytics soon tm.

## TODO's
Fixing the page to add/edit CV's (buggy)

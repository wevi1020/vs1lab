// File origin: VS1LAB A3

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();

/**
 * The module "geotag" exports a class GeoTagStore. 
 * It represents geotags.
 * 
 * TODO: implement the module in the file "../models/geotag.js"
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 * 
 * TODO: implement the module in the file "../models/geotag-store.js"
 */
// eslint-disable-next-line no-unused-vars

const GeoTagExamples = require('../models/geotag-examples');
const GeoTagStore = require('../models/geotag-store');

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

// TODO: extend the following route example if necessary
const store = new GeoTagStore(); // Erstelle den Speicher
router.get('/', (req, res) => {
  const latitude = 49.01379;
  const longitude = 8.390071;

  // Beispiel-Tags nur hinzufügen, wenn der Speicher leer ist
  if (store.getNearbyGeoTags(latitude, longitude, 1000).length === 0) {
      GeoTagExamples.populateStore(store); // Beispiel-Tags laden
      console.log("Beispiel-Tags wurden geladen:", store.getNearbyGeoTags(latitude, longitude, 1000));
  }

  // Alle Tags aus dem Speicher holen
  const allTags = store.getNearbyGeoTags(latitude, longitude, 1000);

  // Tags an die HTML-Seite übergeben
  res.render('index', { taglist: allTags, latitude, longitude });
  console.log("An die EJS-Datei übergebene Tags:", allTags);
});


/**
 * Route '/tagging' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests cary the fields of the tagging form in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Based on the form data, a new geotag is created and stored.
 *
 * As response, the ejs-template is rendered with geotag objects.
 * All result objects are located in the proximity of the new geotag.
 * To this end, "GeoTagStore" provides a method to search geotags 
 * by radius around a given location.
 */

router.post('/tagging', (req, res) => {
  console.log("Formulardaten:", req.body);

  const { name, latitude, longitude, hashtag } = req.body;
  console.log("Empfangen:", name, latitude, longitude, hashtag);

  const newTag = new GeoTag(name, parseFloat(latitude), parseFloat(longitude), hashtag);
  store.addGeoTag(newTag); // Speichert das neue GeoTag

  const allTags = store.getNearbyGeoTags(parseFloat(latitude), parseFloat(longitude), 1000); // Alle Tags holen
  console.log("Aktuelle Tags im Speicher:", allTags);

  res.render('index', { taglist: allTags, latitude, longitude });
});

/**
 * Route '/discovery' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests cary the fields of the discovery form in the body.
 * This includes coordinates and an optional search term.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * As response, the ejs-template is rendered with geotag objects.
 * All result objects are located in the proximity of the given coordinates.
 * If a search term is given, the results are further filtered to contain 
 * the term as a part of their names or hashtags. 
 * To this end, "GeoTagStore" provides methods to search geotags 
 * by radius and keyword.
 */

router.post('/discovery', (req, res) => {
  console.log("Formulardaten:", req.body);

  // Eingaben aus dem Formular auslesen
  const latitude = parseFloat(req.body.latitude || 49.01379); // Fallback auf Standardkoordinaten
  const longitude = parseFloat(req.body.longitude || 8.390071);
  const keyword = req.body.keyword || ""; // Fallback auf leeren String

  console.log("Empfangen: Search Latitude:", searchLatitude, "Search Longitude:", searchLongitude, "Keyword:", keyword);

  // Tags im Umkreis suchen 
  const nearbyTags = store.getNearbyGeoTags(searchLatitude, searchLongitude, 1000);
  console.log("Tags im Umkreis (vor Filterung):", nearbyTags);

  // Falls ein Keyword angegeben ist, die Tags filtern
  const filteredTags = keyword
    ? nearbyTags.filter(tag => tag.name.includes(keyword) || tag.hashtag.includes(keyword))
    : nearbyTags;

  console.log("Gefundene Tags (nach Filterung):", filteredTags);

   // Aktuelle Standortkoordinaten an die Seite übergeben
   const currentLatitude = 49.01379; 
   const currentLongitude = 8.390071;

  // Tags und Koordinaten an die HTML-Seite übergeben
  res.render('index', { taglist: filteredTags, latitude: currentLatitude, longitude: currentLongitude, searchLatitude, searchLongitude });
});

module.exports = router;

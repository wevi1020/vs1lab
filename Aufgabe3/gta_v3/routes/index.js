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
router.get('/', (req, res) => {
  const exampleTags = [
      { name: 'Castle', latitude: 49.01379, longitude: 8.404435, hashtag: '#sight' },
      { name: 'IWI', latitude: 49.01379, longitude: 8.390071, hashtag: '#edu' }
  ];
  res.render('index', { taglist: exampleTags }); // Übergibt taglist an das Template
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
  const { name, latitude, longitude, hashtag } = req.body; // Formulardaten auslesen
  const newTag = new GeoTag(name, parseFloat(latitude), parseFloat(longitude), hashtag); // Neues GeoTag erstellen
  store.addGeoTag(newTag); // GeoTag im Store speichern
  const nearbyTags = store.getNearbyGeoTags(parseFloat(latitude), parseFloat(longitude)); // Tags in der Nähe holen
  res.render('index', { taglist: nearbyTags });
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
  const { latitude, longitude, keyword } = req.body; // Koordinaten und Stichwort auslesen
  const tags = store.searchNearbyGeoTags(
    parseFloat(latitude),
    parseFloat(longitude),
    1, // Suchradius
    keyword // Optionales Stichwort
  );
  res.render('index', { taglist: tags }); // Ergebnisliste anzeigen
});

module.exports = router;

// File origin: VS1LAB A3, A4

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
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 */
// eslint-disable-next-line no-unused-vars
const GeoTagExamples = require('../models/geotag-examples');
const GeoTagStore = require('../models/geotag-store');

// App routes (A3)

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */
const store = new GeoTagStore(); // Erstelle den Speicher
GeoTagExamples.populateStore(store);

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
    res.render('index', {  taglist: allTags,
      latitude,
      longitude,
      searchLatitude:latitude,
      searchLongitude:longitude });
    console.log("An die EJS-Datei übergebene Tags:", allTags);
});

/** (A3)
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
//POST = suche "search-request"
router.post('/discovery', (req, res) => {//req = stehen Daten vom Client; res = Server schick Daten zum Client
  console.log("Formulardaten:", req.body);

  // Eingaben aus dem Formular auslesen
  const searchLatitude = parseFloat(req.body.latitude || 49.01379); // Fallback auf Standardkoordinaten
  const searchLongitude = parseFloat(req.body.longitude || 8.390071);
  const keyword = req.body.keyword || ""; // Fallback auf leeren String

  console.log("Empfangen: Search Latitude:", searchLatitude, "Search Longitude:", searchLongitude, "Keyword:", keyword);

  // Tags im Umkreis suchen 
  const nearbyTags = store.getNearbyGeoTags(searchLatitude, searchLongitude, 1000);
  console.log("Tags im Umkreis (vor Filterung):", nearbyTags);

  // Falls ein Keyword angegeben ist, die Tags filtern; Syntax fuer if-else
  const filteredTags = keyword
    ? nearbyTags.filter(tag => tag.name.includes(keyword) || tag.hashtag.includes(keyword)) // filter = ersetzt for-Schleife
    : nearbyTags;

  console.log("Gefundene Tags (nach Filterung):", filteredTags);

   // Aktuelle Standortkoordinaten an die Seite übergeben
  const currentLatitude = 49.01379; // Konstante Werte für den aktuellen Standort
  const currentLongitude = 8.390071;

  // Tags und Koordinaten an die HTML-Seite übergeben
  res.render('index', {
      taglist: filteredTags,
      latitude: currentLatitude,
      longitude: currentLongitude,
      searchLatitude,
      searchLongitude 
    });
});

// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */

router.get('/api/geotags', (req, res) => {
  console.log("Suchdaten:", req.query);
  // Mögliche Query-Parameter
  const searchTerm = req.query.searchterm || "";
  const latitude = parseFloat(req.query.latitude) || 49.01379; //String in Float parsen
  const longitude = parseFloat(req.query.longitude) || 8.390071;
  const radius = parseFloat(req.query.radius) || 1000;
 // Filter via searchNearbyGeoTags
 const tags = store.searchNearbyGeoTags(latitude, longitude, radius, searchTerm);
 console.log("Gefundene Tags (nach Filterung):", tags);

 // Rückgabe als JSON
 res.json(tags);
});


/**
 * 
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */
  //POST = Daten erstellen
router.post('/api/geotags', (req, res) => {
  // Daten aus dem JSON-Body
  const { name, latitude, longitude, hashtag } = req.body;//direkter Zugriff auf die Variable, ohne req.body jedes Mal neu zu referenzieren

  // Einfacher Check, ob alle Felder da sind (optional)
  if (!name || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Neues Tag anlegen
  const newTag = store.addGeoTag(new GeoTag(name, latitude, longitude, hashtag));
  // Antwort mit Status 201 (Created)
  res
    .status(201) //Setzt den HTTP-Statuscode der Antwort auf 201 "created = wurde erfolgreich erstellt"
    .location(`/api/geotags/${newTag.id}`)// Gibt die URL der neu erstellten Ressource an. Der Client kann diesen Pfad verwenden, um auf die neu erstellte Ressource zuzugreifen
    .json(newTag);//Sendet das newTag-Objekt als JSON im Antwort-Body
});


/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

router.get('/api/geotags/:id', (req, res) => {
  const id = parseInt(req.params.id); //String in int parsen
  const foundTag = store.getGeoTagById(id);

  if (!foundTag) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  res.json(foundTag);
});



/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */
//PUT = Daten aktualisieren/aendern
router.put('/api/geotags/:id', (req, res) => {
  const id = parseInt(req.params.id);

  // Neue Daten aus dem Body
  const { name, latitude, longitude, hashtag } = req.body;//direkter Zugriff auf die Variable, ohne req.body jedes Mal neu zu referenzieren

  const updatedTag = store.updateGeoTagById(id, {
    name,
    latitude,
    longitude,
    hashtag
  });

  if (!updatedTag) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  res.json(updatedTag);
});



/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */

router.delete('/api/geotags/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const deleted = store.removeGeoTagById(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  res.json(deleted);
});

module.exports = router;

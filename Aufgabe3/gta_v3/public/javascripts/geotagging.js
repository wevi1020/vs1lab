// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

/**
  * A class to help using the HTML5 Geolocation API.
  */


/**
 * A class to help using the Leaflet map service.
 */


/**
 * TODO: 'updateLocation'
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */
import LocationHelper from './location-helper.js';
import MapManager from './map-manager.js';

function updateLocation() {
     // Lese die aktuellen Werte der Formularfelder für die Koordinaten
     const latitudeField = document.getElementById("tagging_latitude").value;
     const longitudeField = document.getElementById("tagging_longitude").value;
 
     // Überprüfe, ob die Felder leer sind
     if (!latitudeField || !longitudeField) {
         console.log("Koordinaten fehlen, GeoLocation API wird verwendet...");
         // Rufe die GeoLocation API nur auf, wenn die Koordinaten fehlen
    LocationHelper.findLocation(locationCallBack);

} else {
    console.log("Koordinaten bereits vorhanden, keine GeoLocation API nötig.");
    // Optional: Rufe die Callback-Funktion direkt mit den vorhandenen Werten auf
    const helper = new LocationHelper(latitudeField, longitudeField);
    locationCallBack(helper);
}
}

function locationCallBack(helper) {
    console.log(helper.latitude + ", " + helper.longitude);

     // Setze die Koordinaten in die Formularfelder
    document.getElementById("tagging_latitude").value = helper.latitude;
    document.getElementById("tagging_longitude").value = helper.longitude;
    document.getElementById("oolatitude").value = helper.latitude;
    document.getElementById("oolongitude").value = helper.longitude;

    // Entferne alte Karten-Elemente, falls vorhanden
    const mapView = document.getElementById("mapView");
    const resultMap = document.getElementById("resultMap");
    if (mapView) mapView.remove();
    if (resultMap) resultMap.remove();

  // Lese das `data-tags`-Attribut
    const mapElement = document.getElementById("map");
    const dataTags = JSON.parse(document.getElementById("map").getAttribute("data-tags"));
console.log("GeoTags aus data-tags:", dataTags);
    const geoTags = JSON.parse(dataTags || "[]"); // Konvertiere JSON-String zu Array
    console.log("GeoTags aus data-tags:", geoTags);

    // Initialisiere die Karte
    const mng = new MapManager();
    console.log("Karte wird initialisiert mit:", helper.latitude, helper.longitude);
    mng.initMap(helper.latitude, helper.longitude);
    console.log("GeoTags, die an updateMarkers übergeben werden:", geoTags);
    mng.updateMarkers(helper.latitude, helper.longitude, dataTags);
    
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    updateLocation();
});
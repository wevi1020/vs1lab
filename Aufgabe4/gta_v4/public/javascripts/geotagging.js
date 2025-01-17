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

const mng = new MapManager();
const maxGeoTagsNumber = 4;
var pageCounter = 0;
var pageNumber = 0;
var allTags = [];

function updateLocation(dataTags) {
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
        
        dataTags ? mng.updateMarkers(helper.latitude, helper.longitude, dataTags) : locationCallBack(helper);
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
    const dataTagsString = mapElement.getAttribute("data-tags");
    let dataTags = [];
    try {
        allTags = JSON.parse(dataTagsString || "[]"); // Konvertiere JSON-String zu Array
        calculatePageNumber();
        dataTags = updateGeoResults();
    } catch (e) {
        console.error("Fehler beim Parsen von data-tags:", e);
    }
    console.log("GeoTags aus data-tags:", allTags);

    // Initialisiere die Karte
    console.log("Karte wird initialisiert mit:", helper.latitude, helper.longitude);
    mng.initMap(helper.latitude, helper.longitude);
    console.log("GeoTags, die an updateMarkers übergeben werden:", dataTags);
    mng.updateMarkers(helper.latitude, helper.longitude, dataTags);
}

// Tagging-Form (POST /api/geotags)
async function handleTagFormSubmit(event) {
    event.preventDefault(); // Seite nicht neu laden
    
    // Formfelder abgreifen
    const lat = document.getElementById("tagging_latitude").value;
    const lng = document.getElementById("tagging_longitude").value;
    const name = document.querySelector("#tag-form input[name='name']").value;
    const hashtag = document.querySelector("#tag-form input[name='hashtag']").value;
  
    // Objekt für den Request-Body
    const newTag = {
      name: name,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      hashtag: hashtag
    };
  
    try {
      // POST an /api/geotags
      const response = await fetch("/api/geotags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTag)//Objekt "newTag" wird in ein String umgewandelt und durch POST verschickt
      });
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
  
      // Antwort auslesen
      const createdTag = await response.json();
      console.log("Neues Tag angelegt:", createdTag);
  
      // Nach dem Anlegen → Discovery-Liste aktualisieren
      await handleDiscoverySubmit();
      
    } catch (error) {
      console.error("Fehler beim Anlegen eines neuen GeoTags:", error);
    }
  }
  
  // Discovery-Form (GET /api/geotags?...)
  // Sucht alle Tags basierend auf dem Keyword + Koordinaten
  async function handleDiscoverySubmit(event) {
    // Falls der event-Parameter übergeben wurde (Submit), abbrechen
    if (event) event.preventDefault();
  
    const keywordField = document.querySelector("#discoveryFilterForm input[name='keyword']");
    const latField = document.getElementById("oolatitude");
    const lngField = document.getElementById("oolongitude");
  
    const keyword = keywordField ? keywordField.value : "";
    const lat = latField ? latField.value : "0";
    const lng = lngField ? lngField.value : "0";
  
    const radius = 1000; 
    pageCounter = 0;
  
    // GET-URL zusammenbauen
    const url = `/api/geotags?searchterm=${encodeURIComponent(keyword)}&latitude=${lat}&longitude=${lng}&radius=${radius}`;
  
    try {
      const response = await fetch(url); //der Link wird verschickt und auf res gewartet
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      allTags = await response.json();
      console.log("Gefundene Tags:", allTags);
  
      calculatePageNumber();
      let dataTags = updateGeoResults();
      // Geolocation / Karte updaten
      updateLocation(dataTags);
      
    } catch (error) {
      console.error("Fehler bei der Discovery-Suche:", error);
    }
  }

  //
  function calculatePageNumber() {
    pageNumber = Math.floor(allTags.length/maxGeoTagsNumber);
      if((pageNumber*maxGeoTagsNumber) < allTags.length)
        pageNumber++;
  }

  //
  function updateGeoResults() {
    let tags = [];
    var start = pageCounter*maxGeoTagsNumber;
    var end = start+maxGeoTagsNumber;

    if (end > allTags.length)
      end = allTags.length;

    console.log("start=", start, " end=", end);
    //
    for(let i = start; i < end; i++)
      tags.push(allTags.at(i));

    // Update der Ergebnisliste
    updateDiscoveryResults(tags);

    var label = document.getElementById("pageDisplay");//Zugriff auf HTML-Dok.
    label.textContent = `${(pageCounter + 1)}/${pageNumber} (${allTags.length})`; //
    return tags;
  }
  
  function updateDiscoveryResults(tags) {
    const list = document.getElementById("discoveryResults");
    if (!list) return;
  
    list.innerHTML = ""; // alle löschen
  
    if (!tags || tags.length === 0) {
      //list.innerHTML = "<li>Keine Tags gefunden</li>";
      return;
    }
  
    tags.forEach(tag => {
      const li = document.createElement("li");
      li.textContent = `${tag.name} (${tag.latitude}, ${tag.longitude}) ${tag.hashtag}`;
      list.appendChild(li);
    });
  }

  function prevGeoPage(){
    if(pageCounter == 0) return; //Verhindert die Möglichkeit am Anfang ins minus zu gehen
    pageCounter--;
    let dataTags = updateGeoResults();
    // Geolocation / Karte updaten
    updateLocation(dataTags);
  }

  
  function nextGeoPage(){
    if(pageCounter == (pageNumber-1)) return; //Verhindert die Möglichkeit am Ende weiter zu klicken
    console.log("pageCounter=", pageCounter, " pageNumber=", pageNumber);
    pageCounter++;
    let dataTags = updateGeoResults();
    // Geolocation / Karte updaten
    updateLocation(dataTags);
  }
  
  /**
   * DOMContentLoaded
   * ---------------------------------------
     Event-Listener
   * aufruf updateLocation()
   */
  document.addEventListener("DOMContentLoaded", () => {// "() =>" =: Syntax direkte Implementierung des listeners
    // Tagging-Form
    const tagForm = document.getElementById("tag-form");
    if (tagForm) {
      tagForm.addEventListener("submit", handleTagFormSubmit);
    }
  
    // Discovery-Form
    const discoveryForm = document.getElementById("discoveryFilterForm");
    if (discoveryForm) {
      discoveryForm.addEventListener("submit", handleDiscoverySubmit);
    }

     //
     const prevLink = document.getElementById("previousGeoPage");
     if (prevLink) {
       prevLink.addEventListener("click", function(event) {
         event.preventDefault();//Ausfuehrung des Standardverhaltens dieses Events wird verhindert (da kein Link angegeben wurde springt es nicht mehr rum)
         prevGeoPage();
       });
     }
 
     //
     const nextLink = document.getElementById("nextGeoPage");
     if (nextLink) {
       nextLink.addEventListener("click", function(event) {
         event.preventDefault();
         nextGeoPage();
       });
     }
     // Geolocation / Karte updaten
     updateLocation();
  });
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
        dataTags = JSON.parse(dataTagsString || "[]"); // Konvertiere JSON-String zu Array
        updatePageLabel(elementNumber);
        //updateGeoResults(dataTags, dataTags.length);
    } catch (e) {
        console.error("Fehler beim Parsen von data-tags:", e);
    }
    console.log("GeoTags aus data-tags:", dataTags);

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
      
    } catch (error) {//faengt Fehler ab, die im try-Block auftreten
      console.error("Fehler beim Anlegen eines neuen GeoTags:", error);
    }
  }
  
  // Discovery-Form (GET /api/geotags?...)
  // Sucht alle Tags basierend auf dem Keyword + Koordinaten

  function handleDiscoverySubmit(event) { //Vorbereitungsfunktion kein ,,async'' notwendig

    // Falls der event-Parameter übergeben wurde (Submit), abbrechen
    if (event) event.preventDefault();//preventDefault() wird nur aufgerufen, wenn tatsächlich ein Ereignisobjekt vorhanden ist; Seite muss nicht neu laden
    pageCounter = 0; //Suche wird neu gestartet
    searchGeoTags(); //GeoTags basierend auf den eingegebenen Suchkriterien finden
  }

  async function searchGeoTags() {
  //Eingabefelder abrufen
    const keywordField = document.querySelector("#discoveryFilterForm input[name='keyword']");
    const latField = document.getElementById("oolatitude");
    const lngField = document.getElementById("oolongitude");

    const keyword = keywordField ? keywordField.value : ""; //if-else Abfrage
    const lat = latField ? latField.value : "0";
    const lng = lngField ? lngField.value : "0";
    const radius = 1000; 
  
    // GET-URL zusammenbauen
    const url = `/api/geotags?searchterm=${encodeURIComponent(keyword)}&latitude=${lat}&longitude=${lng}
                  &radius=${radius}&counter=${pageCounter}&maxNumber=${maxGeoTagsNumber}`; //Query-Parameter
  
    //Fetch Api-um GET-Anfrage an Server zu senden
    try {
      const response = await fetch(url); //Sendet asynchrone GET-Anfrage an definierte URL, wartet auf Serverantwort
      if (!response.ok) { // Prüft ob erfolgreich
        throw new Error(`Server error: ${response.status}`);
      }

      let doUpdate = true;
      //JSON-Extraktion
      let foundTags = await response.json(); //Konvertiert Serverantwort direkt in JavaScript-Objekt; await wartet auf Abschluss der JSON-Konvertierung
      let headers = response.headers; //Extrahiert Zusatzinformationen aus Response-Headern
      pageNumber = headers.get("pageNumber"); //Holt Seitennummer
      let elementNumber = headers.get("elementNumber"); //Holt Elementanzahl
      console.log("Gefundene Tags:", foundTags);

      if(pageCounter > 0 && foundTags.length < maxGeoTagsNumber) { //nicht mehr auf der erdten Seite und weniger Tags gefunden werden als die maximale Seitengröße
       
        if(foundTags.length == 0){ //keine Tags gefunden 
          pageCounter--;  //Seite ein Schritt zurück 
          doUpdate = false; //keine Aktualisierung der Anzeige 
        }
      }

      if(doUpdate)//Aktualisierung der Ergebnisse
        updateGeoResults(foundTags, elementNumber); //Übergibt gefundene Tags, Elementanzahl

    } catch (error) {
      console.error("Fehler bei der Discovery-Suche:", error);
    }
  }

  //Discovery-Widgets
  function updateGeoResults(tags, elementNumber) { //Array mit gefundenen Geotags/Gesamtzahl der Elemente
    updateDiscoveryResults(tags); // Update der Ergebnisliste; Rendert
    updatePageLabel(elementNumber); //aktualisiert Beschriftung/Navigation 
    updateLocation(tags);  // Geolocation / Karte updaten ; Rendert Marker/Position
  }

  //Aktualisiert Seitennavigationsanzeige 
  function updatePageLabel(elementNumber) {
    var label = document.getElementById("pageDisplay");//Zugriff auf HTML-Dok. mit ,,pageDisplay''
    label.textContent = `${(pageCounter + 1)}/${pageNumber} (${elementNumber})`; //Formatiert Text "aktuelle Seite/Gesamtseiten (Gesamtelemente)"
  }
  
  //Aktualisiert die Liste der Discovery-Ergebnisse dynamisch
  function updateDiscoveryResults(tags) {
    const list = document.getElementById("discoveryResults"); //Holt Listenelement 
    if (!list) return; //Bricht ab, wenn Element nicht existiert/ Liste leeren
  
    list.innerHTML = ""; // löscht alle bisherigen Einträge
  
    if (!tags || tags.length === 0) { //stoppt Verarbeitung bei keinen Tags
      //list.innerHTML = "<li>Keine Tags gefunden</li>";
      return;
    }
  
    //Erstellt Listeneinträge für jeden Tag
    tags.forEach(tag => {
      const li = document.createElement("li");
      li.textContent = `${tag.name} (${tag.latitude}, ${tag.longitude}) ${tag.hashtag}`; //zeigt Name, Koordinaten, Hashtag
      list.appendChild(li);
    });
  }

  //geht eine Seite zurück
  function prevGeoPage(){
    if(pageCounter == 0) return; //stoppt am Anfang (geht nicht in minus)
    pageCounter--; 
    searchGeoTags(); //erneute Suche 
  }

  //geht eine Seite vor
  function nextGeoPage(){
    console.log("pageCounter=", pageCounter, " pageNumber=", pageNumber); //Logging der aktuellen Seitennavigation
    pageCounter++;
    searchGeoTags(); //erneute Suche
  }
  
  /**
   * DOMContentLoaded
   * ---------------------------------------
     Event-Listener
   * aufruf updateLocation()
   */

  //Beim START des Clients (d.h. beim Laden der Seite) wird der Listener einmal ausgefuehrt
  document.addEventListener("DOMContentLoaded", () => {// "() =>" =: Syntax direkte Implementierung des listeners
    
    // Tagging-Form
    //Submit-Event-Listener wird zum Tag-Formular hinzugefügt
    const tagForm = document.getElementById("tag-form");//gesuchte Element mit der id wird der Variable zugewiesen
    if (tagForm) {
      tagForm.addEventListener("submit", handleTagFormSubmit);//listener "handleTagFormSubmit" wird dem button aus tag-form hinzugefuegt
    }
  
    // Discovery-Form
    const discoveryForm = document.getElementById("discoveryFilterForm");
    if (discoveryForm) {
      discoveryForm.addEventListener("submit", handleDiscoverySubmit);
    }

     const prevLink = document.getElementById("previousGeoPage");
     if (prevLink) {
       prevLink.addEventListener("click", function(event) {
         event.preventDefault();//Ausführung des Standardverhaltens dieses Events wird verhindert (da kein Link angegeben wurde springt es nicht mehr rum)
         prevGeoPage();
       });
     }
 
     const nextLink = document.getElementById("nextGeoPage");
     if (nextLink) {
       nextLink.addEventListener("click", function(event) {
         event.preventDefault();
         nextGeoPage();
       });
     }

     // Geolocation / Karte updaten
     updateLocation();
     searchGeoTags();
  });
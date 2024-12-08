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
function updateLocation() {
    LocationHelper.findLocation(locationCallBack);
}

function locationCallBack(helper) {
    console.log(helper.latitude + ", " + helper.longitude);
    document.getElementById("tagging_latitude").value = helper.latitude;
    document.getElementById("tagging_longitude").value = helper.longitude;
    document.getElementById("oolatitude").value = helper.latitude;
    document.getElementById("oolongitude").value = helper.longitude;

    document.getElementById("mapView").remove();
    document.getElementById("resultMap").remove();

    mng = new MapManager();
    mng.initMap(helper.latitude, helper.longitude);
    mng.updateMarkers(helper.latitude, helper.longitude);
    
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    updateLocation();
});
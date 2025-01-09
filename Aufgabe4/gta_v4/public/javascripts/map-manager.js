// File origin: VS1LAB A2 

/**
 * from VS1LAB A3
 * 
 * A class to help using the Leaflet map service.
 */
 // eslint-disable-next-line no-unused-vars
 class MapManager {

    #map
    #defaultIcon
    #markers
    constructor() {
        // Default Icon of Leaflet can not be loaded in our environment, so it  was manually added to the repo
        this.#defaultIcon = L.icon({
           iconUrl: '/images/marker.svg',
           shadowUrl: '/images/marker-shadow.svg',
           iconSize: [25, 41],
           iconAnchor: [12, 41],
           popupAnchor: [1, -34],
           shadowSize: [41, 41]
        });
    }
    
    /**
    * Initialize a Leaflet map
    * @param {number} latitude The map center latitude
    * @param {number} longitude The map center longitude
    * @param {number} zoom The map zoom, defaults to 18
    */
    initMap(latitude, longitude, zoom = 18) {
        console.log("Initialisiere Karte mit Leaflet...");
        console.log("Latitude:", latitude, "Longitude:", longitude, "Zoom:", zoom);
        // set up dynamic Leaflet map
        this.#map = L.map('map').setView([latitude, longitude], zoom);
        console.log("Karte erfolgreich initialisiert:", this.#map);

        var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
        L.tileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; ' + mapLink + ' Contributors'}).addTo(this.#map);
            console.log("TileLayer hinzugefügt.");
        this.#markers = L.layerGroup().addTo(this.#map);
        console.log("Marker-Layer hinzugefügt.");
    }

    /**
    * Update the Markers of a Leaflet map
    * @param {number} latitude The map center latitude
    * @param {number} longitude The map center longitude
    * @param {{latitude, longitude, name}[]} tags The map tags, defaults to just the current location
    */
    updateMarkers(latitude, longitude, tags = []) {
        // delete all markers
        this.#markers.clearLayers();
        console.log("Markers werden gelöscht...");

        // Füge einen Marker für die aktuelle Position hinzu
        L.marker([latitude, longitude], { icon: this.#defaultIcon })
            .bindPopup("Your Location")
            .addTo(this.#markers);
            console.log("Marker für die aktuelle Position hinzugefügt:", latitude, longitude);

             // Füge Marker für alle Tags hinzu
            for (const tag of tags) {
                console.log("Füge Marker hinzu für:", tag); // Debug-Ausgabe
                L.marker([tag.latitude,tag.longitude], { icon: this.#defaultIcon })
                    .bindPopup(`${tag.name} ${tag.hashtag}`)
                    .addTo(this.#markers);  

        }
        console.log("Alle Marker hinzugefügt.");

    }
}
export default MapManager;
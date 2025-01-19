// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * A class for in-memory-storage of geotags
 * 
 * Use an array to store a multiset of geotags.
 * - The array must not be accessible from outside the store.
 * 
 * Provide a method 'addGeoTag' to add a geotag to the store.
 * 
 * Provide a method 'removeGeoTag' to delete geo-tags from the store by name.
 * 
 * Provide a method 'getNearbyGeoTags' that returns all geotags in the proximity of a location.
 * - The location is given as a parameter.
 * - The proximity is computed by means of a radius around the location.
 * 
 * Provide a method 'searchNearbyGeoTags' that returns all geotags in the proximity of a location that match a keyword.
 * - The proximity constrained is the same as for 'getNearbyGeoTags'.
 * - Keyword matching should include partial matches from name or hashtag fields. 
 */

class InMemoryGeoTagStore{

    #tags = []; // Privates Array: Nur die Methoden dieser Klasse können darauf zugreifen.
    #nextId = 1;

    /**
     * Fügt ein GeoTag hinzu und vergibt eine ID, falls noch nicht vorhanden.
     * Gibt das neu angelegte Objekt zurück.
     */

    //(neuer Mechanismus)
    addGeoTag(tag) {
        tag["id"] = this.#nextId++;  //Wert dieser ID wird aus this.#nextId genommen
        this.#tags.push(tag); // Fügt das neue Tag zur Liste hinzu
        console.log("Neues Tag hinzugefügt:", tag); // Zeigt die aktuelle Liste auf der Konsole an
        return tag; 
    }

    /**
     * Entfernt alle Tags mit einem bestimmten Namen (alter Mechanismus).
     * -> Für die REST-API brauchen wir zusätzlich eine ID-basierte Methode.
    */

    removeGeoTag(name) {
        this.#tags = this.#tags.filter(tag => tag.name !== name); // Löscht GeoTags anhand ihres Namens.
    }

    /**
     * Löscht Tag anhand der ID.
     * Gibt das gelöschte Tag zurück oder undefined, wenn keines gefunden wurde.
     */

    //(neuer Mechanismus)
    removeGeoTagById(id) { //Methode die id als Parameter akzeptiert
        const index = this.#tags.findIndex(tag => tag.id === id); //Sucht in der privaten #tags-Array nach einem Tag mit der übergebenen id
        if (index !== -1) { //Prüft, ob ein Tag mit der gegebenen ID gefunden wurde
            const deleted = this.#tags[index]; //Speichert das zu löschende Tag
            this.#tags.splice(index, 1); //Entfernt das Tag aus dem Array
            return deleted;
        }
        return undefined;
    }

     /**
     * Sucht anhand der ID das Tag oder gibt undefined zurück.
     */

     //(neuer Mechanismus)
     getGeoTagById(id) {
        return this.#tags.find(tag => tag.id === id);
    }

    /**
     * Aktualisiert ein Tag anhand der ID.
     * newData enthält z.B. { name, latitude, longitude, hashtag }
     * Gibt das aktualisierte Tag zurück oder undefined, wenn nichts gefunden.
     */

    //(neuer Mechanismus)
    updateGeoTagById(id, newData) { //Diese Methode nimmt zwei Parameter: id und newData
        const index = this.#tags.findIndex(tag => tag.id === id); //Sucht im privaten #tags-Array nach einem Tag mit der übergebenen id
        if (index !== -1) { //Prüft, ob ein Tag mit der gegebenen ID gefunden wurde
            const oldTag = this.#tags[index]; //speichert das alte Tag-Objekt
            this.#tags[index] = { //Erstellt ein neues Objekt für das aktualisierte Tag
                ...oldTag, //Kopiert alle Eigenschaften des alten Tags
                ...newData, //Überschreibt die Eigenschaften mit den neuen Daten
                id: oldTag.id // Stellt sicher, dass die ID nicht überschrieben wird.
            };
            return this.#tags[index]; //gibt aktualisierte Objekt zurück
        }
        return undefined;
    }

  /**
     * Liefert alle Tags im gegebenen Radius um (latitude, longitude).
     (alter Mechanismus)*/ 

    getNearbyGeoTags(latitude, longitude, radius = 1) {
        return this.#tags.filter(tag => {
            const distance = Math.sqrt(
                Math.pow(tag.latitude - latitude, 2) + Math.pow(tag.longitude - longitude, 2)
            );
            return distance <= radius; // Nur GeoTags, die im Radius liegen.
        });
    }

     /**
     * Liefert alle Tags im gegebenen Radius,
     * die zusätzlich einem Suchbegriff (keyword) entsprechen.
    (alter Mechanismus)*/

    searchNearbyGeoTags(latitude, longitude, radius = 1, keyword = "") {
        const nearbyTags = this.getNearbyGeoTags(latitude, longitude, radius);
        console.log("Nearby Tags vor Filter:", nearbyTags); // Debugging: Tags im Radius
        console.log("Keyword:", keyword); // Debugging: Das übergebene Keyword
    
        if (keyword) {
            const filteredTags = nearbyTags.filter(tag =>
                tag.name.includes(keyword) || tag.hashtag.includes(keyword)
            );
            console.log("Gefilterte Tags:", filteredTags); // Debugging: Nach Keyword gefilterte Tags
            return filteredTags;
        }
        return nearbyTags; // Wenn kein Keyword, gebe alle Tags zurück
    }
}



module.exports = InMemoryGeoTagStore

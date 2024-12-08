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

    addGeoTag(tag) {
        this.#tags.push(tag);
        console.log("Aktuelle Tags im Speicher:", this.#tags);
    }

    removeGeoTag(name) {
        this.#tags = this.#tags.filter(tag => tag.name !== name); // Löscht GeoTags anhand ihres Namens.
    }

    getNearbyGeoTags(latitude, longitude, radius = 1) {
        return this.#tags.filter(tag => {
            const distance = Math.sqrt(
                Math.pow(tag.latitude - latitude, 2) + Math.pow(tag.longitude - longitude, 2)
            );
            return distance <= radius; // Nur GeoTags, die im Radius liegen.
        });
    }

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

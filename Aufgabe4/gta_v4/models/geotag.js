// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/** * 
 * A class representing geotags.
 * GeoTag objects should contain at least all fields of the tagging form.
 */
class GeoTag {

    constructor(name, latitude, longitude, hashtag) {
        this.name = name; // Der Name des Ortes
        this.latitude = latitude; // Breitengrad (z.B. 49.01 für Karlsruhe)
        this.longitude = longitude; // Längengrad (z.B. 8.39 für Karlsruhe)
        this.hashtag = hashtag; // Hashtag (z.B. #campus)
    }
    
}

module.exports = GeoTag;

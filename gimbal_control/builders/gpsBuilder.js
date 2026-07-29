class GpsBuilder {

    async findAzimuthAngle(startLat, startLon, destLat, destLon) {
        // great circle bearing formula

        // convert degrees → radians
        let φ1 = startLat * Math.PI / 180;
        let φ2 = destLat * Math.PI / 180;
        let λ1 = startLon * Math.PI / 180;
        let λ2 = destLon * Math.PI / 180;

        let Δλ = λ2 - λ1;

        // spherical components
        let y = Math.sin(Δλ) * Math.cos(φ2);
        let x = Math.cos(φ1) * Math.sin(φ2) -
                Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

        // initial bearing
        let θ = Math.atan2(y, x);

        // convert to degrees + normalize
        let bearing = θ * 180 / Math.PI;

        return (bearing + 180) % 360;        
    }

    // This is a tiny bit off, but better accounts for the curvature of the earth than the old formula. Should be plenty accurate for up to 250 nmi
    async findElevationAngle(startLat, startLon, startEl, destLat, destLon, destEl){
        // theta = 90 degrees - (tan^-1(altitude difference / haversine formula))

        let groundDistance = await this.haversine(startLat, startLon, destLat, destLon);

        // account for curvature of the earth
        let R = 6371000;
        let drop = (groundDistance * groundDistance) / (2 * R);

        let elDiff = (destEl - startEl) - drop;
        let theta = Math.atan2(elDiff, groundDistance);
        theta = theta * (180 / Math.PI); // Convert from radians to degrees
        let elevationAngle = 90 - theta;
        return elevationAngle;
    }

    async haversine(startLat, startLon, destLat, destLon){// assuming elevation is in meters
        // formula for finding distance between two gps coordinates
        let radius = 6371000; // earth radius in meters
        
        // convert to radians for formula
        let lat1Radians = startLat * (Math.PI / 180);
        let lat2Radians = destLat * (Math.PI / 180);
        let lon1Radians = startLon * (Math.PI / 180);
        let lon2Radians = destLon * (Math.PI / 180);

        let latDiff = lat2Radians - lat1Radians;
        let lonDiff = lon2Radians - lon1Radians;

        let innerEquation = Math.pow(Math.sin(latDiff / 2), 2) + Math.pow(Math.sin(lonDiff / 2), 2) * Math.cos(lat1Radians) * Math.cos(lat2Radians);
        let outerEquation = 2 * radius * Math.asin(Math.sqrt(innerEquation));

        return outerEquation;
    }

}

export const gpsBuilder = new GpsBuilder();
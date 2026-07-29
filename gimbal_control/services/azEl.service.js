import { pelcoBuilder } from "../builders/pelcoBuilder.js";

class AzElService {
    // This is where automated control to pointing to az/el will happen


    async pointTo(azimuth, elevation){
        // Calibration for gimbal pointing south for better testing on the gulf
        azimuth = azimuth + 180;

        // sanitize negative azimuth
        if (azimuth < 0){
            azimuth = azimuth * -1;
        }
        // sanitize too high azimith
        if (azimuth > 360) {
            azimuth = azimuth % 360;
        }
        // convert azimuth to be usable by pelco-D
        azimuth = azimuth * 100;

        // sanitize the magnitude of elevation
        if (elevation > 90 || elevation < -90) {
            elevation = elevation * 90;
        }
        // convert elevation to be usable by pelco-D
        elevation = elevation * 100;

        // appropriate syntax for negative elevation
        if (elevation < 0){
            elevation = 36000 + elevation;
        }

        // this part looks right
        console.log(azimuth, " ", elevation);

        return(pelcoBuilder.pointTo(azimuth, elevation))
    }
}

export default AzElService;
import { pelcoBuilder } from "../builders/pelcoBuilder.js";

class DisplayService {
    async getAz() {
        let az = await pelcoBuilder.getAz();
        console.log(az);
        az = az / 100; // convert back to degrees
        az = az.toFixed(2); // round to 2 decimal places
        return az;
    }

    async getEl() {
        let el = await pelcoBuilder.getEl();
        console.log(el);
        el = el / 100; // convert back to degrees
        // convert back to negative degrees for consistency
        if (el > 100) {
            el = el - 360;
        }
        el = el.toFixed(2);// round to 2 decimal places
        return el;
    }
}

export default DisplayService;
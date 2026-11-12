import { ampBuilder } from "../builders/ampBuilder";

// most of the work will be done in ampBuilder

class AmplifierService {
    // Control
    async enableRF(){
        //
        ampBuilder.enableRF();
    }

    async disableRF(){
        //
        ampBuilder.disableRF();
    }

    async clearFaults(){
        //
        ampBuilder.clearFaults();
    }

    async softReset(){
        ampBuilder.softReset();
    }

    async setAttenuation(decibels){
        // set attenuation to be that db
        ampBuilder.setAttenuation(decibels);

    }

    // Data
    /*
    async getModuleState(){ 
        let modState = await ampBuilder.getModuleState();
        // may need to process it a bit here
        return modState;
    }
        */

    async getModuleState() {
        const modState = await ampBuilder.getModuleState();
        const response = modState.rawResponse;

        if (!Buffer.isBuffer(response)) {
            throw new Error("Invalid amplifier response.");
        }

        // Verify packet length
        if (response.length !== response[2] + 3) {
            throw new Error("Invalid response length.");
        }

        // Verify command
        if (response[4] !== 0x02) {
            throw new Error("Unexpected response command.");
        }

        // Verify checksum
        let checksum = 0;

        for (let i = 2; i < response.length - 1; i++) {
            checksum ^= response[i];
        }

        if (checksum !== response[response.length - 1]) {
            throw new Error("Invalid response checksum.");
        }

        // Locate telemetry fields by working backward from response tail
        const checksumIndex = response.length - 1;
        const analogAlarmStart = checksumIndex - 8;
        const temperatureIndex = analogAlarmStart - 3;
        const voltageIndex = temperatureIndex - 2;
        const totalCurrentIndex = voltageIndex - 2;

        // Decode telemetry
        const totalCurrent = response.readUInt16BE(totalCurrentIndex) / 100;
        const voltage = response.readUInt16BE(voltageIndex) / 100;
        const temperatureC = response.readUInt16BE(temperatureIndex);
        const temperature = (temperatureC * 9 / 5) + 32;

        return {
            temperature,
            voltage,
            totalCurrent
        };
    }

    async getFaults(){
        // this might actually get a list. may need to handle it differently
        let faults = await ampBuilder.getFaults();
        // may need to process it a bit here
        return faults;
    }

    async getTempAlarmStatus(){
        // figure out what this actually is
        // may not actually need this
        // keep it here for now though
        let tempAlarmStatus = await ampBuilder.getTempalarmStatus();
        // may need to process it a bit here
        return tempAlarmStatus;
    }

    async sendTestCommand(){
        //
        ampBuilder.sendTestCommand();
    }
}

export default AmplifierService;
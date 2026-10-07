import { ampBuilder } from "../builders/ampBuilder";

// most of the work will be done in ampBuilder

class AmplifierService {
    // Control
    async enableRF(){
        //
    }

    async disableRF(){
        //
    }

    async clearFaults(){
        //
    }

    async softwareReset(){
        //
    }

    async setAttenuation(decibels){
        // set attenuation to be that db
    }

    // Data
    async getModuleState(){ 
        let modState = await ampBuilder.getModuleState();
        // may need to process it a bit here
        return modState;
    }

    async getTemp(){
        let temp = await ampBuilder.getTemp();
        // may need to process it a bit here
        return temp;
    }

    async getVoltage(){
        let voltage = await ampBuilder.getVoltage();
        // may need to process it a bit here
        return voltage;
    }

    async getCurrent(){
        let current = await ampBuilder.getCurrent();
        // may need to process it a bit here
        return current;
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
}

export default AmplifierService;
import { pelcoBuilder } from "../builders/pelcoBuilder.js";

class ManualService {

    async manualMove(direction, speed){
        return (pelcoBuilder.buildMove(direction, speed));
    }

    async stop(){
        return(pelcoBuilder.buildStop());
    }
}

export default ManualService;
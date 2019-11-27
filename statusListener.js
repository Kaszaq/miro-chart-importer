const MINIMAL_BOX_WIDTH = 250;
const COLUMN_DIRECT_REPORT_IDENT_WIDTH = 30;
const SPACE_BETWEEN_COLUMNS = 20;//todo: for test different value
const SPACE_BETWEEN_ROWS = 10;//todo: for test different value

const BOX_HEIGHT = 50;

class StatusListener {
    constructor() {
        this.done=false;

    }

    update(perc, text){
        let statusText= text || "Loading";
        perc=perc>1?1:perc;
        // check if modal is open
        // send status update to iframe

    }

    start(text){
        let statusText= text || "Loading";
        // open modal
        // setText and perc 0
    }

    end(){
        this.done=true;
        // close modal
    };
}

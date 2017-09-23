import Controller from './Controller';
import config from '../../../config/relayboard';
import fs from 'fs';
import _ from 'lodash';

const SerialController = class extends Controller {
    constructor(application) {
        super(application);
    }

    get_settings(params,callback) {
        callback({status: 'ok', config: config, connected: this.application.serial.isConnected()})
    }

    get_status(params,callback) {
        callback({status: 'ok', connected: this.application.serial.isConnected()});
    }

    post_save(params,callback) {
        config.port = params.serial_port;
        config.baudrate = params.serial_baudrate;
        config.pins = params.pins;
        fs.writeFile(__dirname+'/../../../config/relayboard.js','export default '+JSON.stringify(config), function(err) {
            if (!err) {
                callback({status:'ok'});
            } else {
                callback({status:'error',message:err})
            }
        });
    }
}

export default SerialController;
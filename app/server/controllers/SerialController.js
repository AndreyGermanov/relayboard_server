import Controller from './Controller';
import config from '../../../config/relayboard';
import fs from 'fs';
import _ from 'lodash';

const SerialController = class extends Controller {
    constructor(application) {
        super(application);
        this.on('request',this.application.serial.processRequest.bind(this.application.serial));
    }

    get_settings(params,callback) {
        callback({status: 'ok', config: this.application.serial.config, connected: this.application.serial.isConnected()})
    }

    get_status(params,callback) {
        callback({status: 'ok', connected: this.application.serial.isConnected()});
    }

    post_save(params,callback) {
        config.port = params.port;
        config.baudrate = parseInt(params.baudrate);
        config.title = params.title ? params.title : this.application.relayboard_id;
        config.pins = _.orderBy(params.pins,['number'],['asc']);
        var self = this;
        fs.writeFile(__dirname+'/../../../config/relayboard.js','export default '+JSON.stringify(config), function(err) {
            if (!err) {
                self.application.serial.config = config;
                self.application.serial.lastConfigUpdateTime = Date.now();
                self.application.serial.run();
                callback({status:'ok'});
            } else {
                callback({status:'error',message:err})
            }
        });
    }
}

export default SerialController;
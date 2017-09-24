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
        callback({status: 'ok', config: config, connected: this.application.serial.isConnected()})
    }

    get_status(params,callback) {
        callback({status: 'ok', connected: this.application.serial.isConnected()});
    }

    post_save(params,callback) {
        config.port = params.port;
        config.baudrate = params.baudrate;
        config.pins = params.pins;
        var self = this;
        fs.writeFile(__dirname+'/../../../config/relayboard.js','export default '+JSON.stringify(config), function(err) {
            if (!err) {
                self.application.serial.run();
                var config_params = [];
                for (var i in config.pins) {
                    config_params.push(config.pins[i].number+'|'+config.pins[i].type);
                }
                var request = {
                    request_id: 'local_config_' + Date.now(),
                    command: 'CONFIG',
                    arguments: config.params.join(',')
                }
                self.emit('request',)
                callback({status:'ok'});
            } else {
                callback({status:'error',message:err})
            }
        });
    }
}

export default SerialController;
import SerialReader from './SerialReader.js';
import WebServer from './WebServer.js';
import {EventEmitter} from 'events';
import getmac from 'getmac';

var Application = class extends EventEmitter {
    constructor() {
        super();
        var self = this;
        this.controllers = {};
        this.serial = new SerialReader(this);
        this.web = new WebServer(this);
        this.relayboard_id = null;
        getmac.getMac(function(err,mac) {
            if (!err) {
                self.relayboard_id = mac.toString().replace(/\:/g,'');
            }
            self.serial.run(function() {
                self.web.run();
            });
        })
    }
}

export default Application;
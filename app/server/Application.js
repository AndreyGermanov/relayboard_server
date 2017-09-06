import SerialReader from './SerialReader.js';
import WebServer from './WebServer.js';
import {EventEmitter} from 'events';

var Application = class extends EventEmitter {
    constructor() {
        super();
        var self = this;
        this.serial = new SerialReader(this);
        this.web = new WebServer(this);
        this.serial.run(function() {
            self.web.run();
        });
    }
}

export default Application;
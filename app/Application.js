var SerialReader = require('./SerialReader.js'),
    WebServer = require('./WebServer.js'),
    EventEmitter = require('events').EventEmitter;

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

module.exports = Application;
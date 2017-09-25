import SerialPort from 'serialport';
import EventEmitter from 'events';
import config from '../../config/relayboard';

var SerialReader = class extends EventEmitter {

    constructor(application) {
        super(application);
        this.application = application;
        this.requests_queue = {};
        this.commands_queue = [];
        this.connected = false;
        this.current_relay_status = [];
        this.current_relay_status_timestamp = 0;
        this.config = require('../../config/relayboard.js').default;
        this.on('request',this.processRequest.bind(this));
        setInterval(this.tryConnect.bind(this),1000);
        setInterval(this.handleCallbacks.bind(this),5000);
        setInterval(this.sendCommandToSerial.bind(this),2000);
    }

    processRequest(request) {
        var request_id = request.id ? request.id : request.request_id;
        this.requests_queue[request_id] = {
            callback: request.callback,
            timestamp: Date.now()
        }
        this.commands_queue.push({
            request_id: request_id,
            request_command: request.command,
            request_arguments: request.arguments
        });
    }

    sendCommandToSerial() {
        if (this.commands_queue.length) {
            var command = this.commands_queue.shift();
            try {
                this.port.write(command.request_id + ' ' + command.request_command + ' ' + command.request_arguments + "\n");
            } catch(e) {};
        };
    }

    isConnected() {
        return Date.now() - this.current_relay_status_timestamp < 5000;
    }

    tryConnect() {
        if (!this.isConnected()) {
            this.run();
            this.current_relay_status_timestamp = Date.now();
        }
    }

    setConfig() {
        var config_params = [];
        for (var i in config.pins) {
            config_params.push(config.pins[i].number+'|'+config.pins[i].type);
        }
        var request = {
            request_id: 'local_config_' + Date.now(),
            command: 'CONFIG',
            arguments: config_params.join(','),
            callback: () => {
            }
        };
        this.emit('request',request);
    }

    run(callback) {
	    var self = this;
        if (this.config.port) {
            if (this.port) {
                try {
                    this.port.close();
                } catch (e) {};
            }
            this.port = new SerialPort(this.config.port, {
                baudRate: this.config.baudrate,
                parser: SerialPort.parsers.readline("\n"),
                encoding: 'utf8',
                buffersize: 5100
            }, function () {
                self.setConfig();
                self.port.on('data', function (string) {
                    string = string.trim();
                    var request_id = string.split(' ').shift();
                    if (self.requests_queue && self.requests_queue[request_id]) {
                        string = string.split(' ');
                        string.shift();
                        var result = {};
                        result[string.shift()] = string.join(' ');
                        if (self.requests_queue[request_id].callback) {
                            self.requests_queue[request_id].callback(result, request_id);
                        }
                        delete self.requests_queue[request_id];
                    } else {
                        string = string.split(' ');
                        if (string.length>2) {
                            string.shift();
                        };
                        if (string[0] == 'STATUS' && string[1]) {
                            self.current_relay_status = string[1].split(',');
                            self.current_relay_status_timestamp = Date.now();
                        } else {
                            self.current_relay_status_timestamp = Date.now();
                        }
                    }
                });
            })
        }

        if (callback) {
            callback();
        }
    }

    handleCallbacks() {
        for (var i in this.requests_queue) {
            if (Date.now()-this.requests_queue[i].timestamp>600000) {
                if (typeof(this.requests_queue[i].callback) == 'function') {
                    this.requests_queue[i].callback({'error':'Could not run command'});
                }
                delete this.requests_queue[i];
            }
        }
    }
}

module.exports = SerialReader;
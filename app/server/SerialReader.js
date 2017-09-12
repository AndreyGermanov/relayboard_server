var SerialPort = require('serialport'),
    EventEmitter = require('events').EventEmitter;

var SerialReader = class extends EventEmitter {

    constructor(application) {
        super(application);
        this.application = application;
        this.requests_queue = {};
        this.commands_queue = [];
        this.config = require('../../config/serial.js');
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
            this.port.write(command.request_id + ' ' + command.request_command + ' ' + command.request_arguments + "\n");
        };
    }

    run(callback) {
	    var self = this;
        this.port = new SerialPort(this.config.port,{
            baudRate: this.config.baudrate,
            parser: SerialPort.parsers.readline("\n"),
            encoding: 'utf8',
            buffersize: 5100
        }, function() {
            self.port.on('close', function() {
	            self.run();
    	    });
	
    	    self.port.on('data',function(string) {
		        string = string.trim();
        	    var request_id = string.split(' ').shift();
        	    if (self.requests_queue && self.requests_queue[request_id]) {
		            string = string.split(' ');
		            string.shift();
		            var result = {};
		            result[string.shift()] = string.join(' ');
            	    self.requests_queue[request_id].callback(result,request_id);
            	    delete self.requests_queue[request_id];
        	    }
    	    });
	    })

        this.application.web.on('request',this.processRequest.bind(this));

        if (callback) {
            callback();
        }

        setInterval(this.handleCallbacks.bind(this),5000);
        setInterval(this.sendCommandToSerial.bind(this),2000);
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
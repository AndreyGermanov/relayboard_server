var EventEmitter = require('events').EventEmitter,
    http = require('http'),
    express = require('express')

var WebServer = class extends EventEmitter {
    constructor(application) {
        super(application);
        this.application = application;
        this.config = require('../config/web.js');
        this.requestsCounter = 0;
    }

    run(callback) {
        var self = this;
        this.express = new express();
        this.http_server = http.createServer(this.express);
        this.http_server.listen(this.config.port);

        this.express.get('/request/:command/:arguments',function(req,res) {
            self.emit('request',{
                id: 'req_'+self.requestsCounter++,
                command: req.params.command,
                arguments: req.params.arguments,
                callback: function(response) {
                    res.json(response);
                }
            })
        })
        if (callback) {
            callback();
        }
    }
}

module.exports = WebServer;
var EventEmitter = require('events').EventEmitter,
    http = require('http'),
    express = require('express'),
    body_parser =require('body-parser'),
    async = require('async'),
    fs = require('fs');
    import portalController from './controllers/PortalController';

var WebServer = class extends EventEmitter {
    constructor(application) {
        super(application);
        this.application = application;
        this.config = require('../../config/web.js');
        this.requestsCounter =  0;
    }

    run(callback) {
        var self = this;
        this.express = new express();
        this.http_server = http.createServer(this.express);
        this.http_server.listen(this.config.port);
        this.express.use(express.static(__dirname + '/../../public/'));
        this.express.use(body_parser.urlencoded({ extended: true }))
        this.express.use(body_parser.json());
  
        self.application.controllers['portal'] = new portalController(self.application);

        this.express.get('/request/:command/:arguments?',function(req,res) {
            self.emit('request',{
                id: 'req_'+self.requestsCounter++,
                command: req.params.command,
                arguments: req.params.arguments,
                callback: function(response) {
                    res.json(response);
                }
            })
        });

        this.express.all('/:controller/:action?', function(req,res) {
            var controllerName = req.params.controller.toString().toLowerCase(),
                controller = null,
                action = null;
            if (!req.params.action) {
                action = 'index';
            } else {
                action = req.params.action.toString().toLowerCase();
            };

            var controller = null;
            async.series([ (callback) => {
                    if (self.application.controllers[controllerName]) {
                        controller = self.application.controllers[controllerName];
                        callback();
                    } else {
                        var controllerClass = controllerName[0].toString().toUpperCase()+controllerName.toString().substr(1)+'Controller';
                        var fileName = __dirname+'/controllers/'+controllerClass+'.js';
                        fs.stat(fileName, (err,fileEntry) => {
                            if (!err && fileEntry && fileEntry.isFile()) {
                                controllerClass = require(fileName).default;
                                controller = new controllerClass(self.application);
                                if (controller && controller.emit) {
                                    callback();
                                } else {
                                    callback({status:'error',message:'Could not load controller'})
                                }
                            } else {
                                callback({status:'error',message:'Controller does not exist'})
                            }
                        })
                    }
                },
                (callback) => {
                    var request_method = req.method.toString().toLowerCase();
                    var actionMethod = controller[request_method+'_'+action].bind(controller);
                    if (actionMethod && typeof(actionMethod)=='function') {
                        actionMethod(req,res,(result) => {
                            callback(result);
                        })
                    } else {
                        callback({status:'error',message:'Could not find action'})
                    }
                }
            ], function(result) {
                if (result) {
                    res.json(result)
                } else {
                    res.end();
                }
            })

        })
        if (callback) {
            callback();
        }
    }
}

module.exports = WebServer;
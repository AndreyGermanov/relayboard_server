import SerialReader from './SerialReader.js';
import WebServer from './WebServer.js';
import DDPServer from './DDPServer.js';
import TerminalSession from './TerminalSession';
import {EventEmitter} from 'events';
import getmac from 'getmac';
import fs from 'fs-extra';
import path from 'path';
import async from 'async';

var Application = class extends EventEmitter {
    constructor() {
        super();
        var self = this;
        this.controllers = {};
        this.serial = new SerialReader(this);
        this.web = new WebServer(this);
        this.ddp = new DDPServer(this);
        this.terminal = new TerminalSession(this);
        this.relayboard_id = null;
        getmac.getMac(function(err,mac) { 
            if (!err) {
                self.relayboard_id = mac.toString().replace(/\:/g,'');
            }
            self.serial.run(function() {
                self.web.run(function() {
                    self.ddp.run();
                });
            });
        });
    }

    clean_empty_dirs (folder,callback) {
        var files = [],
            self = this;

        async.series([
            function(callback) {
                fs.stat(folder,function(err,stat) {
                    if (stat && !stat.isDirectory()) {
                        callback(true);
                    } else {
                        callback();
                    }
                })
            },
            function(callback) {
                fs.readdir(folder,function(err,f) {
                    if (f && f.length) {
                        files = f ;
                        callback();
                    } else {
                        callback();
                    }
                });
            },
            function(callback) {
                async.eachSeries(files,function(file,callback) {
                    var fullPath = path.join(folder,file);
                    self.clean_empty_dirs(fullPath,function() {
                        callback();
                    })
                }, function() {
                    callback();
                })
            },
            function(callback) {
                fs.readdir(folder,function(err,f) {
                    if (f.length == 0) {
                        fs.rmdir(folder,function(err) {
                            callback();
                        })
                    } else {
                        callback();
                    }
                })

            }
        ],function() {
            if (callback) {
                callback();
            }
        })
    }
};

export default Application;
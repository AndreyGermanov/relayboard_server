import Controller from './Controller';
import ddpClient from 'ddp';
import portal_config from '../../../config/portal';
import data_config from '../../../config/data';
import _ from 'lodash';
import fs from 'fs-extra';
import utils from '../lib/utils';
import async from 'async';

const PortalController = class extends Controller {
    constructor(application) {
        super(application);
        this.ddpClient = null;
        this.statusInterval = null;
        this.pollStatusPeriod = 1000;
        this.pollConnectionStatusPeriod = 10000;
        this.sendBufferLengh = 100000;
        this.lastPortalResponseTime = Date.now();
        this.command_responses = {};
        this.connect = false;
        setInterval(this.sendData.bind(this),portal_config.send_to_portal_period*1000);
        setInterval(this.tryConnectToPortal.bind(this),this.pollConnectionStatusPeriod);
    }

    tryConnectToPortal() {
        if (!this.isConnected()) {
            if (portal_config && portal_config.host) {
                this.connectToPortal(function(response) {
                });
            }
        }
    }

    isConnected() {
        return Date.now() - this.lastPortalResponseTime<this.pollConnectionStatusPeriod
    }

    connectToPortal(callback) {
        this.ddpClient = new ddpClient({
            host: portal_config.host,
            port: portal_config.port,
            ssl: true,
            autoReconnect: true,
            maintainCollections: true,
            useSockJs:true
        });
        var self = this;
        if (!portal_config.connect) {
            return 0;
        }
        this.ddpClient.connect(function(err,wasReconnect) {
            if (err) {
                if (callback) {
                    callback({status: 'error', message: 'Connection error'})
                }
            } else {
                if (!wasReconnect) {
                    self.ddpClient.call('login',[{
                        user: {email: portal_config.login}, password: portal_config.password}], function(err) {
                        if (err) {
                            if (callback) {
                                self.connected = false;
                                callback({status: 'error', message: 'Login error'})
                            }
                        } else {
                            var config = self.application.serial.config;
                            config.pins = _.orderBy(config.pins,['number'],['asc']);
                            self.ddpClient.call('registerRelayBoard',[{id:self.application.relayboard_id,options:config}],(err) => {
                                if (err) {
                                    if (callback) {
                                        self.connected = false;
                                        callback({status: 'error', message: 'Relayboard register error'})
                                    }
                                } else {
                                    if (callback) {
                                        self.connected = true;
                                        self.lastPortalResponseTime = Date.now();
                                        self.ddpClient.call('updateRelayBoardConfig',[
                                            {
                                                id:self.application.relayboard_id,
                                                config:config,
                                                lastConfigUpdateTime: self.application.serial.lastConfigUpdateTime
                                            }],() => {
                                            callback({status:'ok'});
                                            self.registerEvents();
                                        });
                                    }
                                }
                            })
                        }
                    })
                } else {
                    if (callback) {
                        try {
                            self.connected = true;
                            callback({status: 'ok', message: 'Reconnected to portal'});
                            self.registerEvents();
                        } catch(e) {}
                    }
                } 
            }
        });
    }

    post_save(params,callback) {
        portal_config.host = params.host;
        portal_config.port = params.port;
        portal_config.login = params.login;
        portal_config.password =params.password;
        portal_config.send_to_portal_period = parseInt(params.send_to_portal_period);
        fs.writeFile(__dirname+'/../../../config/portal.js','export default '+JSON.stringify(portal_config), function(err) {
            if (!err) {
                callback({status:'ok'});
            } else {
                callback({status:'error',message:err})
            }
        });
    }

    post_connect(params,callback) {
        var self = this;
        portal_config.connect = true;
        this.connectToPortal(function() {
            fs.writeFile(__dirname+'/../../../config/portal.js','export default '+JSON.stringify(portal_config), function(err) {
                if (!err) {
                    callback({status:'ok'});
                } else {
                    callback({status:'error',message:err})
                }
            });
        });
    }

    post_disconnect(params,callback) {
        var self = this;
        self.ddpClient.close();
        portal_config.connect = false;
        fs.writeFile(__dirname+'/../../../config/portal.js','export default '+JSON.stringify(portal_config), function(err) {
            if (!err) {
                callback({status:'ok'});
            } else {
                callback({status:'error',message:err})
            }
        });
    }
    
    registerEvents() {
        if (this.isConnected()) {
            this.removeAllListeners('serial_request');
            this.on('serial_request',this.application.serial.processRequest.bind(this.application.serial));
        }
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
        }
        this.statusInterval = setInterval(this.sendRelayStatus.bind(this),this.pollStatusPeriod);
    }
    
    sendRelayStatus() {
        var self = this;
        if (this.isConnected()) {
            var command_responses = _.cloneDeep(self.command_responses);
            self.command_responses = {};
            var send_buffer = false;
            if (self.application.terminal.buffer && self.application.terminal.buffer.length) {
                send_buffer = true;
            };

            var config = self.application.serial.config,
                status = {};
            for (var index in self.application.serial.current_relay_status) {
                if (config.pins[index] && config.pins[index].send_live_data) {
                    status[parseInt(config.pins[index].number)] = self.application.serial.current_relay_status[index];
                }
            }
            self.ddpClient.call('updateRelayBoardStatus',
                [{id:self.application.relayboard_id,
                    status:status,
                    timestamp: self.application.serial.current_relay_status_timestamp,
                    command_responses:command_responses,terminal_buffer:self.application.terminal.buffer}],(err,result) => {
                if (!err) {
                    if (result) {
                        try {
                            result = JSON.parse(result);
                        } catch (e) {};
                    }
                    if (result.status == 'ok') {
                        if (send_buffer) {
                            self.application.terminal.buffer = [];
                        };
                        self.lastPortalResponseTime = Date.now();
                        if (result.commands) {
                            for (var i in result.commands) {
                                var command = result.commands[i];
                                command.timestamp = Date.now();
                                command.callback = function(response,request_id) {
                                    self.command_responses[request_id] = response;
                                }
                                if (command.request_type == 'serial') {
                                    self.emit('serial_request', command);
                                } else if (command.request_type == 'terminal') {
                                    self.application.terminal.processRequest(command.command);
                                }
                            }
                        }
                        if (result.lastConfigUpdateTime && result.lastConfigUpdateTime < self.application.serial.lastConfigUpdateTime) {
                            var config = self.application.serial.config;
                            config.pins = _.orderBy(config.pins,['number'],['asc']);
                            self.ddpClient.call('updateRelayBoardConfig',[
                                {
                                    id:self.application.relayboard_id,
                                    config:config,
                                    lastConfigUpdateTime: self.application.serial.lastConfigUpdateTime
                                }],() => {
                            });
                        }
                    }
                }
            })
        }
    }

    get_settings(params,callback) {
        callback({status: 'ok', config: portal_config, connected: this.isConnected()})
    }

    get_status(params,callback) {
        callback({status: 'ok', connected: this.isConnected()})
    }

    sendData() {
        if (!this.isConnected() || this.is_moving) {
            return;
        }
        this.is_moving = true;
        this.processed_files = [];
        var self = this,
            data_to_save = '';
        utils.get_files(data_config.cachePath+'/send_to_portal_period/',(files) => {
            async.eachSeries(files,function(file,callback) {
                if (self.application.serial.editing_cache_files.indexOf(file)==-1) {
                    var lock_file_name = file+'_'+(Date.now())+'.lock';
                    fs.move(file,lock_file_name,function() {
                        fs.readFile(lock_file_name,'utf8',function(err,data) {
                            if (err) {
                            }
                            if (data) {
                                data_to_save+=data;
                                self.processed_files.push(lock_file_name);
                                if (data_to_save.length>self.sendBufferLength) {
                                    self.ddpClient.call('addRelayBoardData',{
                                        id: this.application.id,
                                        data: data_to_save}, function(err,result) {
                                            data_to_save = '';
                                            if (!err && result.status == 'ok') {
                                                async.eachSeries(self.processed_files,function(file,callback) {
                                                    fs.unlink(file, function() {
                                                        callback();
                                                    })
                                                }, function() {
                                                    callback(true);
                                                })
                                            } else {
                                                callback(true)
                                            }
                                        })
                                } else {
                                    callback();
                                }
                            } else {
                                callback();
                            }
                        })
                    });
                } else {
                    callback();
                }
            }, function(err) {
                if (data_to_save) {
                    self.ddpClient.call('addRelayBoardData',[{
                        id: self.application.relayboard_id,
                        delayed:true,
                        data: data_to_save}], function(err,result) {
                        data_to_save = '';
                        if (!err && result.status == 'ok') {
                            async.eachSeries(self.processed_files,function(file,callback) {
                                fs.unlink(file, function() {
                                    callback();
                                })
                            }, function() {
                                self.is_moving = false;
                            })
                        } else {
                            self.is_moving = false;
                        }
                    })
                } else {
                    self.is_moving = false;
                }
            });
        });
    }
};

export default PortalController;
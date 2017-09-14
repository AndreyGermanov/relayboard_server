import Controller from './Controller';
import ddpClient from 'ddp';
import config from '../../../config/relayboard';
import portal_config from '../../../config/portal';
import fs from 'fs';
import _ from 'lodash';

const PortalController = class extends Controller {
    constructor(application) {
        super(application);
        this.ddpClient = null;
        this.statusInterval = null;
        this.pollStatusPeriod = 5000;
        this.pollConnectionStatusPeriod = 10000;
        this.lastPortalResponseTime = Date.now();
        this.command_responses = {};

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
            ssl: false,
            autoReconnect: true,
            maintainCollections: true,
            useSockJs:true
        });
        var self = this;
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
                                        callback({status:'ok'});
                                        self.registerEvents();
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

    post_connect(req,res,callback) {
        portal_config.host = req.body.host;
        portal_config.port = req.body.port;
        portal_config.login = req.body.login;
        portal_config.password =req.body.password;
        this.connectToPortal(callback);
        fs.writeFile(__dirname+'/../../../config/portal.js','export default '+JSON.stringify(portal_config));
    }

    post_disconnect(req,res,callback) {
        self.ddpClient.close();
        callback({status:'ok'});
    }
    
    registerEvents() {
        if (this.isConnected()) {
            this.removeAllListeners('request');
            this.on('request',this.application.serial.processRequest.bind(this.application.serial));
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
            self.ddpClient.call('updateRelayBoardStatus',
                [{id:self.application.relayboard_id,
                    status:self.application.serial.current_relay_status,
                    timestamp: self.application.serial.current_relay_status_timestamp,
                    command_responses:command_responses}],(err,result) => {
                if (!err) {
                    if (result) {
                        try {
                            result = JSON.parse(result);
                        } catch (e) {};
                    }
                    if (result.status == 'ok') {
                        self.lastPortalResponseTime = Date.now();
                        if (result.commands) {
                            for (var i in result.commands) {
                                var command = result.commands[i];
                                command.request_type = 'remote';
                                command.timestamp = Date.now();
                                command.callback = function(response,request_id) {
                                    self.command_responses[request_id] = response;
                                }
                                self.emit('request',command);
                            }
                        }
                    }
                }
            })
        }
    }

    get_settings(req,res,callback) {
        callback({status: 'ok', config: portal_config, connected: this.isConnected()})
    }

    get_status(req,res,callback) {
        callback({status: 'ok', connected: this.isConnected()})
    }
};

export default PortalController;
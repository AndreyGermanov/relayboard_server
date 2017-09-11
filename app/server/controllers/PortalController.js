import Controller from './Controller';
import ddpClient from 'ddp';
import config from '../../../config/relayboard';
import portal_config from '../../../config/portal';
import fs from 'fs';

const PortalController = class extends Controller {
    constructor(application) {
        super(application);
        this.ddpClient = null;
        this.statusInterval = null;
        this.pollStatusPeriod = 5000;
        this.pollConnectionStatusPeriod = 10000;
        this.lastPortalResponseTime = Date.now();

        setInterval(this.tryConnectToPortal.bind(this),this.pollConnectionStatusPeriod);
    }

    tryConnectToPortal() {
        if (!this.connected) {
            if (portal_config && portal_config.host) {
                this.connectToPortal(function(response) {
                });
            }
        } else {
            if (Date.now() - this.lastPortalResponseTime>this.pollConnectionStatusPeriod) {
                this.connected = false;
            }
        }
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
    
    registerEvents() {
        if (this.connected) {
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
        if (this.connected) {
            self.emit('request', {
                id: 'portstat_' + Date.now(),
                command: 'STATUS',
                arguments: '',
                callback: function (response) {
                    self.ddpClient.call('updateRelayBoardStatus',[{id:self.application.relayboard_id,status:response}],(err) => {
                        if (!err) {
                            self.lastPortalResponseTime = Date.now();
                        }
                    })
                }
            })
        }
    }
};

export default PortalController;
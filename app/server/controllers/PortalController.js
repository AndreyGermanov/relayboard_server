import Controller from './Controller';
import ddpClient from 'ddp';
import config from '../../../config/relayboard';

const PortalController = class extends Controller {
    constructor(application) {
        super(application)
        this.ddpClient = null;
        this.statusInterval = null;
        this.pollPeriodForPortal = 5000;
    }

    post_connect(req,res,callback) {
        var self = this;
        this.ddpClient = new ddpClient({
            host: req.body.host,
            port: req.body.port,
            ssl: false,
            autoReconnect: true,
            maintainCollections: true,
            useSockJs:true
        });
        this.ddpClient.connect(function(err,wasReconnect) {
            if (err) {
                if (callback) {
                    callback({status: 'error', message: 'Connection error'})
                }
            } else {
                if (!wasReconnect) {
                    self.ddpClient.call('login',[{
                        user: {email: req.body.login}, password: req.body.password}], function(err,result) {
                            if (err) {
                                if (callback) {
                                    self.connected = false;
                                    callback({status: 'error', message: 'Login error'})
                                }
                            } else {
                                self.ddpClient.call('registerRelayBoard',[{id:self.application.relayboard_id,options:config}],(err,result) => {
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
    
    registerEvents() {
        if (this.connected) {
            this.removeAllListeners('request');
            this.on('request',this.application.serial.processRequest.bind(this.application.serial));
        }
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
        }
        this.statusInterval = setInterval(this.sendRelayStatus.bind(this),this.pollPeriodForPortal);
    }
    
    sendRelayStatus() {
        var self = this;
        if (this.connected) {
            self.emit('request', {
                id: 'portstat_' + Date.now(),
                command: 'STATUS',
                arguments: '',
                callback: function (response) {
                    self.ddpClient.call('updateRelayBoardStatus',[{id:self.application.relayboard_id,status:response}],(err,result) => {
                    })
                }
            })
        }
    }
}

export default PortalController;
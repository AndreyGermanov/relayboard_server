import Controller from './Controller.js';
import ddpClient from 'ddp';

const PortalController = class extends Controller {
    constructor(application) {
        super(application)
        this.ddpClient = null;
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
                                    callback({status: 'error', message: 'Login error'})
                                }
                            } else {
                                self.ddpClient.call('registerRelayBoard',[{id:self.application.relayboard_id}],(err,result) => {
                                    if (err) {
                                        if (callback) {
                                            callback({status: 'error', message: 'Relayboard register error'})
                                        }
                                    } else {
                                        if (callback) {
                                            callback({status:'ok'});
                                        }
                                    }
                                })
                            }
                        })
                } else {
                    if (callback) {
                        callback({status:'ok',message:'Reconnected to portal'});
                    }
                }
            }
        });
    }
}

export default PortalController;
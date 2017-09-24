import DDP from './lib/ddp.js';
import {EventEmitter} from 'events';

const DDPServer = class extends EventEmitter {
    constructor(application) {
        super();
        this.application = application;
    }

    run(callback) {
        this.ddpServer = new DDP({httpServer: this.application.web.http_server,application:this.application});
        this.registerMethods();
        if (callback) {
            callback();
        }
    }

    registerMethods() {
        var self = this;
        var methods = {
            getStatus: (callback) => {
                if (callback && typeof(callback) == 'function') {
                    callback(JSON.stringify({status:'ok',
                        result:self.application.serial.current_relay_status,
                        timestamp:self.application.serial.current_relay_status_timestamp})
                    )
                } else {
                    return JSON.stringify({
                        status: 'ok',
                        result: self.application.serial.current_relay_status,
                        timestamp: self.application.serial.current_relay_status_timestamp
                    });
                }
            },
            switchRelay: (params) => {
                if (params[0]) {
                    params = params[0];
                };
                self.application.serial.emit('request', {
                    request_id: 'switch_relay_'+Date.now(),
                    command: params.command,
                    arguments: params.number,
                    callback: function() {
                        //done
                    }
                });
            }
        };
        
        this.ddpServer.methods(methods);
    }
};

export default DDPServer;
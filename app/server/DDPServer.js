import DDP from 'ddp-server-reactive';
import {EventEmitter} from 'events';

const DDPServer = class extends EventEmitter {
    constructor(application) {
        super();
        this.application = application;
    }

    run(callback) {
        this.ddpServer = new DDP({httpServer: this.application.web.http_server});
        this.registerMethods();
        if (callback) {
            callback();
        }
    }

    registerMethods() {
        var self = this;
        this.ddpServer.methods({
            getStatus: () => {
                return JSON.stringify({status:'ok',
                    result:self.application.serial.current_relay_status,
                    timestamp:self.application.serial.current_relay_status_timestamp});
            },
            switchRelay: (params) => {
                self.application.serial.emit('request', {
                    request_id: 'switch_relay_'+Date.now(),
                    command: params.command,
                    arguments: params.number,
                    callback: function() {
                        //done
                    }
                });
            }
        })
    }
}

export default DDPServer;
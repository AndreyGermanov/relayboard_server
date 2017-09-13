import DDP from 'ddp-server-reactive';
import {EventEmitter} from 'events';

const DDPServer = class extends EventEmitter {
    constructor(application) {
        super();
        this.application = application;
        this.current_relay_status = {};
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
                self.emit('request', {
                        id: 'local_portstat_' + Date.now(),
                        command: 'STATUS',
                        arguments: '',
                        callback: (response) => {
                            this.current_relay_status = response['STATUS'].split(',')
                        }
                    }
                );
                return JSON.stringify({status:'ok',result:this.current_relay_status});
            }
        })

        this.on('request',this.application.serial.processRequest.bind(this.application.serial));
    }
}

export default DDPServer;
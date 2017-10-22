import {EventEmitter} from 'events';
const readline = require('readline');
import {spawn} from 'child_process';

var TerminalSession = class extends EventEmitter {

    constructor(application) {
        super(application);
        this.application = application;
        this.run();
    }

    run() {
        this.buffer = [];
        var self = this;
        this.session = spawn('/bin/bash');
        this.session.stdout.on('data',(data) => {
            self.buffer.push(data.toString('utf8').split("\n"));
        })
    }

    processRequest(line) {
        if (line == 'reset_session') {
            this.session.kill();
            this.run();
        } else {
            this.session.stdin.write(line + "\n");
        }
    }
}

export default TerminalSession;
import {EventEmitter} from 'events';
const readline = require('readline');
import {spawn} from 'child_process';

var TerminalSession = class extends EventEmitter {

    constructor(application) {
        super(application);
        this.application = application;
        this.buffer = [];
        var self = this;
        this.session = spawn('/bin/bash');
        this.session.stdout.on('data',(data) => {
            self.buffer.push(data.toString('utf8').split("\n"));
        })
    }

    processRequest(line) {
        this.session.stdin.write(line+"\n");
    }
}

export default TerminalSession;
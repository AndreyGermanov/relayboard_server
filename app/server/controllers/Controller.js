import {EventEmitter} from 'events';

var Controller = class extends EventEmitter {
    constructor(application) {
        super();
        this.application = application;
    }
}

export default Controller;
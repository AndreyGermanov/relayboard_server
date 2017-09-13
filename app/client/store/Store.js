import {createStore,applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import RootReducer from '../reducers/RootReducer';
import DDPClient from 'ddp-client';

const Store = class {
    constructor() {
        this.store = createStore(RootReducer,applyMiddleware(thunkMiddleware));
        var options = {
            host: location.host,
            port: 80,
            ssl: false,
            autoReconnect: true,
            autoReconnectTimer: 500,
            ddpVersion: 1,
            useSockJs: true
        };
        console.log(options);
        this.ddpClient = new DDPClient(options);
        this.ddpClient.connect(function(error, wasReconnect) {});
    }

    getRelaysStatus(callback) {
        console.log('about to get status');
        this.ddpClient.call('getStatus',[],function(err,result) {
            if (result) {
                result = JSON.parse(result);
            }
            if (callback) {
                callback(result.result);
            }
        })
    }
}

export default new Store();
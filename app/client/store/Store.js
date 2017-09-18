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
        this.ddpClient = new DDPClient(options);
        this.ddpClient.connect(function(error, wasReconnect) {});
        this.lastConnectTimestamp = Date.now();
        setInterval(this.checkDDPConnection.bind(this),1000);
    }

    checkDDPConnection() {
        if (Date.now() - this.lastConnectTimestamp>5000) {
            this.ddpClient.connect(function(error, wasReconnect) {});
        }
    }

    getRelaysStatus(callback) {
        var self = this;
        if (this.ddpClient._connectionFailed) {
            this.ddpClient.connect(function(error, wasReconnect) {});
        }
        try {
            this.ddpClient.call('getStatus', [], function (err, result) {
                self.lastConnectTimestamp = Date.now();
                if (err) {
                    console.log(err);
                }
                if (result) {
                    result = JSON.parse(result);
                }
                if (callback) {
                    callback(result.result);
                }
            })
        } catch (e) {
            console.log(e);
        }
    }
}

export default new Store();
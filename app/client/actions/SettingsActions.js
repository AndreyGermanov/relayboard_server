import _ from 'lodash';
import Store from '../store/Store';
import async from 'async';

const SettingsActions = class {

    constructor() {
        this.types = {
            CHANGE_PORTAL_HOST_FIELD: 'CHANGE_PORTAL_HOST_FIELD',
            CHANGE_PORTAL_PORT_FIELD: 'CHANGE_PORTAL_PORT_FIELD',
            CHANGE_PORTAL_LOGIN_FIELD: 'CHANGE_PORTAL_LOGIN_FIELD',
            CHANGE_PORTAL_PASSWORD_FIELD: 'CHANGE_PORTAL_PASSWORD_FIELD',
            CHANGE_TITLE_FIELD: 'CHANGE_TITLE_FIELD',
            CHANGE_SERIAL_PORT_FIELD: 'CHANGE_SERIAL_PORT_FIELD',
            CHANGE_SERIAL_BAUDRATE_FIELD: 'CHANGE_SERIAL_BAUDRATE_FIELD',
            CHANGE_PIN_NUMBER: 'CHANGE_PIN_NUMBER',
            CHANGE_PIN_TYPE: 'CHANGE_PIN_TYPE',
            CHANGE_PIN_TITLE: 'CHANGE_PIN_TITLE',
            ADD_PIN: 'ADD_PIN',
            DELETE_PIN: 'DELETE_PIN',
            CONNECT_TO_PORTAL: 'CONNECT_TO_PORTAL',
            SET_PORTAL_FORM_ERROR_MESSAGES: 'SET_PORTAL_FORM_ERROR_MESSAGES',
            SET_CONNECTED_TO_PORTAL: 'SET_CONNECTED_TO_PORTAL',
            SET_CONNECTED_TO_SERIAL: 'SET_CONNECTED_TO_SERIAL',
            APPLY_SETTINGS: "APPLY_PORTAL_SETTINGS",
            SET_SERIAL_FORM_ERROR_MESSAGES: 'SET_SERIAL_FORM_ERROR_MESSAGES',
            CHANGE_PIN_SEND_LIVE_DATA_FLAG: 'CHANGE_PIN_SEND_LIVE_DATA_FLAG',
            CHANGE_PIN_SAVE_TO_DB_PERIOD: 'CHANGE_PIN_SAVE_TO_DB_PERIOD',
            CHANGE_PIN_SEND_TO_PORTAL_PERIOD: 'CHANGE_PIN_SEND_TO_PORTAL_PERIOD',
            CHANGE_SEND_TO_PORTAL_PERIOD_FIELD: 'CHANGE_SEND_TO_PORTAL_PERIOD_FIELD',
            CHANGE_DB_SAVE_PERIOD_FIELD: 'CHANGE_DB_SAVE_PERIOD_FIELD',
            CHANGE_DATA_CACHE_GRANULARITY_FIELD: 'CHANGE_DATA_CACHE_GRANULARITY_FIELD'
        };
    }

    changePortalHostField(value) {
        return {
            type: this.types.CHANGE_PORTAL_HOST_FIELD,
            value: value
        };
    }

    changePortalPortField(value) {
        return {
            type: this.types.CHANGE_PORTAL_PORT_FIELD,
            value: value
        };
    }

    changePortalLoginField(value) {
        return {
            type: this.types.CHANGE_PORTAL_LOGIN_FIELD,
            value: value
        };
    }

    changePortalPasswordField(value) {
        return {
            type: this.types.CHANGE_PORTAL_PASSWORD_FIELD,
            value: value
        };
    }

    changeTitleField(value) {
        return {
            type: this.types.CHANGE_TITLE_FIELD,
            value: value
        };
    }

    changeSerialPortField(value) {
        return {
            type: this.types.CHANGE_SERIAL_PORT_FIELD,
            value: value
        };
    }

    changeSerialBaudrateField(value) {
        return {
            type: this.types.CHANGE_SERIAL_BAUDRATE_FIELD,
            value: value
        };
    }

    changeDbSavePeriodField(value) {
        return {
            type: this.types.CHANGE_DB_SAVE_PERIOD_FIELD,
            value: value
        };
    }

    changeSendToPortalPeriodField(value) {
        return {
            type: this.types.CHANGE_SEND_TO_PORTAL_PERIOD_FIELD,
            value: value
        }
    }

    changeDataCacheGranularityField(value) {
        return {
            type: this.types.CHANGE_DATA_CACHE_GRANULARITY_FIELD,
            value: value
        }
    }

    changePinNumber(id,value) {
        return {
            type: this.types.CHANGE_PIN_NUMBER,
            id: id,
            value: value
        };
    }

    changePinType(id,value) {
        return {
            type: this.types.CHANGE_PIN_TYPE,
            id: id,
            value: value
        };
    }

    changePinTitle(id,value) {
        return {
            type: this.types.CHANGE_PIN_TITLE,
            id: id,
            value: value
        };
    }

    changePinSendLiveDataFlag(id,value) {
        return {
            type: this.types.CHANGE_PIN_SEND_LIVE_DATA_FLAG,
            id: id,
            value: value
        };
    }

    changePinSaveToDbPeriod(id,value) {
        return {
            type: this.types.CHANGE_PIN_SAVE_TO_DB_PERIOD,
            id: id,
            value: value
        };
    }

    changePinSendToPortalPeriod(id,value) {
        return {
            type: this.types.CHANGE_PIN_SEND_TO_PORTAL_PERIOD,
            id: id,
            value: value
        };
    }

    addPin() {
        return {
            type: this.types.ADD_PIN
        };
    }

    deletePin(id) {
        return {
            type: this.types.DELETE_PIN,
            id: id
        };
    }

    setPortalErrorMessages(errors) {
        return {
            type: this.types.SET_PORTAL_FORM_ERROR_MESSAGES,
            errors: errors
        };
    }

    setSerialErrorMessages(errors) {
        return {
            type: this.types.SET_SERIAL_FORM_ERROR_MESSAGES,
            errors: errors
        };
    }

    setConnected(value) {
        return {
            type: this.types.SET_CONNECTED_TO_PORTAL,
            value: value
        };
    }

    setSerialConnected(value) {
        return {
            type: this.types.SET_CONNECTED_TO_SERIAL,
            value: value
        };
    }

    applySettings(portal_config,serial_config) {
        return {
            type: this.types.APPLY_SETTINGS,
            portal_config: portal_config,
            serial_config: serial_config
        };
    }

    savePortalSettings(form) {
        var self = this;
        return (dispatch) => {
            var errors = {};
            if (!form.host) {
                errors.host = 'Hostname is required';
            }
            if (!form.port) {
                errors.port = 'Port is required';
            }
            if (!form.send_to_portal_period) {
                errors.send_to_portal_period = 'Send to portal period is required';
            }
            if (!form.login) {
                errors.login = 'Login is required';
            } 
            if (!form.password) {
                errors.password = 'Password is required';
            }
            if (form.port != parseInt(form.port)) {
                errors.port = 'Port must be integer value';
            } else {
                form.port = parseInt(form.port);
            }
            if (form.send_to_portal_period != parseInt(form.send_to_portal_period)) {
                errors.send_to_portal_period = 'Send to portal period must be integer value';
            } else {
                form.send_to_portal_period = parseInt(form.send_to_portal_period);
            }
            if (_.toArray(errors).length>0) {
                dispatch(this.setPortalErrorMessages(errors));
            } else {
                Store.ddpClient.call('portal_post_save', {
                    host: form.host,
                    port: form.port,
                    login: form.login,
                    password: form.password,
                    send_to_portal_period: form.send_to_portal_period,
                    delayed: true
                }, function(err,result) {
                    if (!err && result.status == 'ok') {

                    } else {
                        if (err) {
                            errors.general = err;
                        } else if (result.status == 'error') {
                            errors.general = response.message;
                        }
                        dispatch(self.setPortalErrorMessages(errors));
                    }
                });
            }
        };
    }

    saveSerialSettings(form) {
        var self = this;
        return (dispatch) => {
            var errors = {};
            if (!form.serial_port) {
                errors.serial_port = 'Port is required';
            }
            if (!form.serial_baudrate) {
                errors.serial_baudrate = 'Baud rate is required';
            }
            if (!form.db_save_period) {
                errors.db_save_period = 'Save to DB period is required';
            }
            if (!form.data_cache_granularity) {
                errors.data_cache_granularity = 'Data cache granularity is required';
            }
            if (!form.title) {
                errors.title = 'Relayboard name is required';
            }
            if (form.serial_baudrate != parseInt(form.serial_baudrate)) {
                errors.serial_baudrate = 'Baud rate must be integer value';
            } else {
                form.serial_baudrate = parseInt(form.serial_baudrate);
            }
            if (form.db_save_period != parseInt(form.db_save_period)) {
                errors.db_save_period = 'Save to DB period must be integer value';
            } else {
                form.db_save_period = parseInt(form.db_save_period);
            }
            if (form.data_cache_granularity != parseInt(form.data_cache_granularity)) {
                errors.data_cache_granularity = 'Data Cache Granularity must be integer value';
            } else {
                form.data_cache_granularity = parseInt(form.data_cache_granularity);
            }
            if (form.pins && form.pins.length) {
                for (var i in form.pins) {
                    form.pins[i].number = parseInt(form.pins[i].number);
                    var pin_number_error = null,
                        pin_title_error = null,
                        pin_type_error = null;

                    if (!form.pins[i].number) {
                        pin_number_error = 'Pin number is required';
                    } else if (form.pins[i].number != parseInt(form.pins[i].number)) {
                        pin_number_error = 'Pin number must be an integer value';
                    } else if (_.filter(form.pins, {number: form.pins[i].number}).length > 1) {
                        pin_number_error = 'Pin number bust be unique';
                    }
                    if (['relay', 'temperature'].indexOf(form.pins[i].type) == -1) {
                        pin_type_error = 'Incorrect type';
                    }
                    if (!form.pins[i].title.toString().trim()) {
                        pin_title_error = 'Pin title is required';
                    }

                    if (pin_number_error || pin_title_error || pin_type_error) {
                        if (!errors.pins) {
                            errors.pins = {};
                        }
                        if (!errors.pins[i]) {
                            errors.pins[i] = {};
                        }
                        errors.pins[i].number = pin_number_error;
                        errors.pins[i].type = pin_type_error;
                        errors.pins[i].title = pin_title_error;
                    }
                }
            }
            if (_.toArray(errors).length>0) {
                dispatch(this.setSerialErrorMessages(errors));
            } else {
                Store.ddpClient.call('serial_post_save', {
                    port: form.serial_port,
                    title: form.title,
                    baudrate: form.serial_baudrate,
                    db_save_period: form.db_save_period,
                    data_cache_granularity: form.data_cache_granularity,
                    pins: form.pins,
                    delayed: true
                }, function(err,result) {
                    if (!err && result.status == 'ok') {
                        dispatch(self.applySettings(null,{
                            title: form.title,
                            port: form.serial_port,
                            baudrate: form.serial_baudrate,
                            db_save_period: form.db_save_period,
                            data_cache_granularity: form.data_cache_granularity,
                            pins: _.orderBy(form.pins,['number'],['asc'])}));
                    } else {
                        if (err) {
                            errors.general = err;
                        } else if (result.status == 'error') {
                            errors.general = response.message;
                        }
                        dispatch(self.setSerialErrorMessages(errors));
                    }
                });
            }
        };
    }
    
    connectToPortal() {
        return (dispatch) => {
            Store.ddpClient.call('portal_post_connect', {delayed:true}, function(err,result) {
                if (err || result.status != 'ok') {
                    if (err) {
                        errors.general = err;
                    } else if (result.status == 'error') {
                        errors.general = response.message;
                    }
                    dispatch(self.setPortalErrorMessages(errors));
                }
            });
        };
    }

    disconnectFromPortal() {
        return (dispatch) => {
            Store.ddpClient.call('portal_post_disconnect', {delayed:true}, function(err,result) {
                if (!err && result.status == 'ok') {

                } else {
                    dispatch(self.setPortalErrorMessages(errors));
                }
            });
        };
    }
    
    getSettings() {
        var self = this;
        return (dispatch) => {
            var settings = {
                portal_settings: {},
                serial_settings: {}
            };
            async.series([
                function(callback) {
                    Store.ddpClient.call('portal_get_settings', {delayed:true}, function(err,result) {
                        if (!err && result.status == 'ok') {
                            settings.portal_settings = result.config;
                            callback();
                        } else {
                            callback();
                        }
                    });
                },
                function(callback) {
                    Store.ddpClient.call('serial_get_settings', {delayed:true}, function(err,result) {
                        if (!err && result.status == 'ok') {
                            settings.serial_settings = result.config;
                            callback();
                        } else {
                            callback();
                        }
                    });
                }
            ], function() {
                dispatch(self.applySettings(settings.portal_settings,settings.serial_settings));
                if (settings.portal_settings && settings.portal_settings.connected) {
                    dispatch(self.setConnected(settings.portal_settings.connected));
                }
                if (settings.serial_settings && settings.serial_settings.connected) {
                    dispatch(self.setSerialConnected(settings.serial_settings.connected));
                }
            });
        };
    }

    getPortalStatus() {
        var self = this;
        return (dispatch) => {
            Store.ddpClient.call('portal_get_status', {delayed:true}, function(err,result) {
                var state = Store.store.getState().Settings;
                if (!err && result.status == 'ok' && result.connected != state.connected) {
                    dispatch(self.setConnected(result.connected));
                }
            });
        };
    }

    getSerialStatus() {
        var self = this;
        return (dispatch) => {
            Store.ddpClient.call('serial_get_status', {delayed:true}, function(err,result) {
                var state = Store.store.getState().Settings;
                if (!err && result.status == 'ok' && result.connected != state.serial_connected) {
                    dispatch(self.setSerialConnected(result.connected));
                }
            });
        };
    }
};

export default new SettingsActions();
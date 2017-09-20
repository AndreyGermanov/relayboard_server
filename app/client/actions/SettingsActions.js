import _ from 'lodash';
import Store from '../store/Store';

const SettingsActions = class {

    constructor() {
        this.types = {
            CHANGE_PORTAL_HOST_FIELD: 'CHANGE_PORTAL_HOST_FIELD',
            CHANGE_PORTAL_PORT_FIELD: 'CHANGE_PORTAL_PORT_FIELD',
            CHANGE_PORTAL_LOGIN_FIELD: 'CHANGE_PORTAL_LOGIN_FIELD',
            CHANGE_PORTAL_PASSWORD_FIELD: 'CHANGE_PORTAL_PASSWORD_FIELD',
            CONNECT_TO_PORTAL: 'CONNECT_TO_PORTAL',
            SET_PORTAL_FORM_ERROR_MESSAGES: 'SET_PORTAL_FORM_ERROR_MESSAGES',
            SET_CONNECTED_TO_PORTAL: 'SET_CONNECTED_TO_PORTAL',
            APPLY_SETTINGS: "APPLY_PORTAL_SETTINGS"
        }
    }

    changePortalHostField(value) {
        return {
            type: this.types.CHANGE_PORTAL_HOST_FIELD,
            value: value
        }
    }

    changePortalPortField(value) {
        return {
            type: this.types.CHANGE_PORTAL_PORT_FIELD,
            value: value
        }
    }

    changePortalLoginField(value) {
        return {
            type: this.types.CHANGE_PORTAL_LOGIN_FIELD,
            value: value
        }
    }

    changePortalPasswordField(value) {
        return {
            type: this.types.CHANGE_PORTAL_PASSWORD_FIELD,
            value: value
        }
    }

    setPortalErrorMessages(errors) {
        return {
            type: this.types.SET_PORTAL_FORM_ERROR_MESSAGES,
            errors: errors
        }
    }

    setConnected(value) {
        return {
            type: this.types.SET_CONNECTED_TO_PORTAL,
            value: value
        }
    }

    applySettings(config) {
        return {
            type: this.types.APPLY_SETTINGS,
            config: config
        }
    }

    savePortalSettings(form) {
        var self = this;
        return (dispatch) => {
            var errors = {};
            if (!form.host) {
                errors['host'] = 'Hostname is required';
            }
            if (!form.port) {
                errors['port'] = 'Port is required';
            }
            if (!form.login) {
                errors['login'] = 'Login is required';
            } 
            if (!form.password) {
                errors['password'] = 'Password is required';
            }
            if (form.port != parseInt(form.port)) {
                errors['port'] = 'Port must be integer value'
            }
            
            if (_.toArray(errors).length>0) {
                dispatch(this.setPortalErrorMessages(errors))
            } else {
                Store.ddpClient.call('portal_post_save', {
                    host: form.host,
                    port: form.port,
                    login: form.login,
                    password: form.password,
                    delayed: true
                }, function(err,result) {
                    if (!err && result.status == 'ok') {

                    } else {
                        if (err) {
                            errors['general'] = err;
                        } else if (result.status == 'error') {
                            errors['general'] = response.message;
                        }
                        dispatch(self.setPortalErrorMessages(errors));
                    }
                })
            }
        }
    }
    
    connectToPortal() {
        return (dispatch) => {
            Store.ddpClient.call('portal_post_connect', {delayed:true}, function(err,result) {
                if (err || result.status != 'ok') {
                    if (err) {
                        errors['general'] = err;
                    } else if (result.status == 'error') {
                        errors['general'] = response.message;
                    }
                    dispatch(self.setPortalErrorMessages(errors));
                }
            })
        }
    }

    disconnectFromPortal() {
        return (dispatch) => {
            Store.ddpClient.call('portal_post_disconnect', {delayed:true}, function(err,result) {
                if (!err && result.status == 'ok') {

                } else {
                    dispatch(self.setPortalErrorMessages(errors));
                }
            })
        }
    }
    
    getPortalSettings() {
        var self = this;
        return (dispatch) => {
            Store.ddpClient.call('portal_get_settings', {delayed:true}, function(err,result) {
                if (!err && result.status == 'ok') {
                    dispatch(self.applySettings(result.config));
                    dispatch(self.setConnected(result.connected));
                }
            })
        }
    }

    getPortalStatus() {
        var self = this;
        return (dispatch) => {
            Store.ddpClient.call('portal_get_status', {delayed:true}, function(err,result) {
                if (!err && result.status == 'ok') {
                    dispatch(self.setConnected(result.connected));
                }
            })
        }
    }

};

export default new SettingsActions();
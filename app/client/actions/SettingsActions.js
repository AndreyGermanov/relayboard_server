import _ from 'lodash';
import fetch from 'isomorphic-fetch';

const SettingsActions = class {

    constructor() {
        this.types = {
            CHANGE_PORTAL_HOST_FIELD: 'CHANGE_PORTAL_HOST_FIELD',
            CHANGE_PORTAL_PORT_FIELD: 'CHANGE_PORTAL_PORT_FIELD',
            CHANGE_PORTAL_LOGIN_FIELD: 'CHANGE_PORTAL_LOGIN_FIELD',
            CHANGE_PORTAL_PASSWORD_FIELD: 'CHANGE_PORTAL_PASSWORD_FIELD',
            CONNECT_TO_PORTAL: 'CONNECT_TO_PORTAL',
            SET_PORTAL_FORM_ERROR_MESSAGES: 'SET_PORTAL_FORM_ERROR_MESSAGES',
            SET_CONNECTED_TO_PORTAL: 'SET_CONNECTED_TO_PORTAL'
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

    connectToPortal(form) {
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
                fetch('/portal/connect',{
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    body: JSON.stringify({
                        host: form.host,
                        port: form.port,
                        login: form.login,
                        password: form.password
                    })
                }).then((response) => {
                    if (response.ok) {
                        response = response.json();
                        if (response.status == 'error') {
                            errors['general'] = response.message;
                            dispatch(this.setPortalErrorMessages(errors))
                        } else if (response.status == 'ok') {
                            dispatch(this.setConnected());
                        }
                    } else {
                        errors['general'] = response.statusText;
                        dispatch(this.setPortalErrorMessages(errors))
                    }
                },(error) => {
                    dispatch(this.setPortalErrorMessages(error))
                })
            }
        }
    }
};

export default new SettingsActions();
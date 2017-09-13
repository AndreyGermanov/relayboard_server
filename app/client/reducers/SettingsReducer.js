import actions from '../actions/SettingsActions';
import _ from 'lodash';

const SettingsReducer = (state,action) => {
    if (typeof(state) == 'undefined' || !_.toArray(state).length) {
        state = {
            host: '',
            port: '',
            login: '',
            password: '',
            errors: {},
            connected: false
        }
    }
    var newState = _.cloneDeep(state);

    switch (action.type) {
        case actions.types.CHANGE_PORTAL_HOST_FIELD:
            newState.host = action.value;
            break;
        case actions.types.CHANGE_PORTAL_PORT_FIELD:
            if (action.value == parseInt(action.value)) {
                newState.port = action.value;
            }
            break;
        case actions.types.CHANGE_PORTAL_LOGIN_FIELD:
            newState.login = action.value;
            break;
        case actions.types.CHANGE_PORTAL_PASSWORD_FIELD:
            newState.password = action.value;
            break;
        case actions.types.SET_PORTAL_FORM_ERROR_MESSAGES:
            newState.errors = {};
            for (var i in action.errors) {
                newState.errors[i] = action.errors[i];
            }
            break;
        case actions.types.SET_CONNECTED_TO_PORTAL: 
            newState.connected = actions.value;
            break;
        case actions.types.APPLY_SETTINGS:
            newState.host = action.config.host;
            newState.port = action.config.port;
            newState.login = action.config.login;
            newState.password = action.config.password;
            console.log(newState);
            break;
    }

    return newState;
}

export default SettingsReducer;
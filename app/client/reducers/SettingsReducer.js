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
            connected: false,
            title: '',
            serial_port: '',
            serial_baudrate: '',
            pins: [],
            serial_connected: false,
            serial_errors: {}
        };
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
        case actions.types.SET_SERIAL_FORM_ERROR_MESSAGES:
            newState.serial_errors = {};
            for (i in action.errors) {
                newState.serial_errors[i] = action.errors[i];
            }
            break;
        case actions.types.SET_CONNECTED_TO_PORTAL:
            if (action.value != newState.connected) {
                newState.connected = action.value;
            }
            break;
        case actions.types.SET_CONNECTED_TO_SERIAL:
            if (action.value != newState.serial_connected) {
                newState.serial_connected = action.value;
            }
            break;
        case actions.types.APPLY_SETTINGS:
            if (action.portal_config) {
                newState.host = action.portal_config.host;
                newState.port = action.portal_config.port;
                newState.login = action.portal_config.login;
                newState.password = action.portal_config.password;
            }
            if (action.serial_config) {
                newState.title = action.serial_config.title;
                newState.serial_port = action.serial_config.port;
                newState.serial_baudrate = action.serial_config.baudrate;
                newState.pins = action.serial_config.pins.map(function(pin) {
                    if (typeof(pin.send_live_data) == 'undefined' || pin.send_live_data === null) {
                        pin.send_live_data = false;
                    }
                    if (typeof(pin.save_to_db_period) == 'undefined' || pin.save_to_db_period === null) {
                        pin.save_to_db_period = 0;
                    }
                    if (typeof(pin.send_to_portal_period) == 'undefined' || pin.send_to_portal_period === null) {
                        pin.send_to_portal_period = 0;
                    }
                    return pin;
                });
            }
            break;
        case actions.types.CHANGE_TITLE_FIELD:
            newState.title = action.value;
            break;
        case actions.types.CHANGE_SERIAL_PORT_FIELD:
            newState.serial_port = action.value;
            break;
        case actions.types.CHANGE_SERIAL_BAUDRATE_FIELD:
            if (action.value == parseInt(action.value)) {
                newState.serial_baudrate = action.value;
            }
            break;
        case actions.types.CHANGE_PIN_NUMBER:
            newState.pins[action.id].number = action.value;
            break;
        case actions.types.CHANGE_PIN_TYPE:
            newState.pins[action.id].type = action.value;
            break;
        case actions.types.CHANGE_PIN_TITLE:
            newState.pins[action.id].title = action.value;
            break;
        case actions.types.CHANGE_PIN_SEND_LIVE_DATA_FLAG:
            newState.pins[action.id].send_live_data = action.value;
            break;
        case actions.types.CHANGE_PIN_SAVE_TO_DB_PERIOD:
            newState.pins[action.id].save_to_db_period = action.value;
            break;
        case actions.types.CHANGE_PIN_SEND_TO_PORTAL_PERIOD:
            newState.pins[action.id].send_to_portal_period = action.value;
            break;
        case actions.types.ADD_PIN:
            newState.pins.push({
                number: 0,
                type: 'relay',
                title: '',
                send_live_data: false,
                save_to_db_period: 0,
                send_to_portal_period: 0
            });
            break;
        case actions.types.DELETE_PIN:
            newState.pins.splice(action.id,1);
            break;
    }
    return newState;
};

export default SettingsReducer;
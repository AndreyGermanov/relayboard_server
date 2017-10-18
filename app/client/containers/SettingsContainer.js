import {connect} from 'react-redux';
import Settings from '../components/Settings';
import actions from '../actions/SettingsActions';
import Store from '../store/Store';
import data_settings from '../config/data';

const mapStateToProps = (state) => {
    return {
        title: state.Settings.title,
        serial_port: state.Settings.serial_port,
        serial_baudrate: state.Settings.serial_baudrate,
        db_save_period: state.Settings.db_save_period,
        data_cache_granularity: state.Settings.data_cache_granularity,
        send_to_portal_period: state.Settings.send_to_portal_period,
        pins: state.Settings.pins,
        host: state.Settings.host,
        port: state.Settings.port,
        login: state.Settings.login,
        password: state.Settings.password,
        errors: state.Settings.errors,
        connected: state.Settings.connected,
        serial_connected: state.Settings.serial_connected,
        serial_errors: state.Settings.serial_errors,
        data_settings: data_settings
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onChangeHostField: (e) => {
            if (e.target && typeof(e.target)!='undefined') {
                dispatch(actions.changePortalHostField(e.target.value));
            }
        },
        onChangePortField: (e) => {
            if (e.target && typeof(e.target)!='undefined' & e.target.value == parseInt(e.target.value)) {
                dispatch(actions.changePortalPortField(e.target.value));
            }
        },
        onChangeLoginField: (e) => {
            if (e.target && typeof(e.target)!='undefined') {
                dispatch(actions.changePortalLoginField(e.target.value));
            }
        },
        onChangePasswordField: (e) => {
            if (e.target && typeof(e.target)!='undefined') {
                dispatch(actions.changePortalPasswordField(e.target.value));
            }
        },
        onChangeTitleField: (e) => {
            if (e.target && typeof(e.target) != 'undefined') {
                dispatch(actions.changeTitleField(e.target.value));
            }
        },
        onChangeSerialPortField: (e) => {
            if (e.target && typeof(e.target) != 'undefined') {
                dispatch(actions.changeSerialPortField(e.target.value));
            }
        },
        onChangeSerialBaudrateField: (e) => {
            if (e.target && typeof(e.target)!='undefined' & e.target.value == parseInt(e.target.value)) {
                dispatch(actions.changeSerialBaudrateField(e.target.value));
            }
        },
        onChangePinNumberField: (id,e) => {
            if (e.target && typeof(e.target)!='undefined' & e.target.value == parseInt(e.target.value)) {
                dispatch(actions.changePinNumber(id,e.target.value));
            }
        },
        onChangePinTypeField: (id,e) => {
            if (e.target && typeof(e.target)!='undefined' & ['relay','temperature'].indexOf(e.target.value) !== -1) {
                dispatch(actions.changePinType(id,e.target.value));
            }
        },
        onChangePinTitleField: (id,e) => {
            if (e.target && typeof(e.target) != 'undefined') {
                dispatch(actions.changePinTitle(id,e.target.value));
            }
        },
        onChangePinSendLiveDataFlag: (id,e) => {
            if (e.target && typeof(e.target) != 'undefined') {
                dispatch(actions.changePinSendLiveDataFlag(id,e.target.checked));
            }
        },
        onChangePinSaveToDbPeriod: (id,e) => {
            if (e.target && typeof(e.target) != 'undefined') {
                dispatch(actions.changePinSaveToDbPeriod(id,e.target.value));
            }
        },
        onChangePinSendToPortalPeriod: (id,e) => {
            if (e.target && typeof(e.target) != 'undefined') {
                dispatch(actions.changePinSendToPortalPeriod(id,e.target.value));
            }
        },
        onAddPinClick: (e) => {
            e.preventDefault();
            var state = Store.store.getState().Settings;
            for (var i in state.pins) {
                if (state.pins[i].number == 0) {
                    return 0;
                }
            }
            dispatch(actions.addPin());
        },
        onDeletePinClick: (id,e) => {
            e.preventDefault();
            if (confirm('Are you sure ?')) {
                dispatch(actions.deletePin(id));
            }
        },
        onSavePortalConnectionSettingsClick: (e) => {
            e.preventDefault();
            dispatch(actions.savePortalSettings(Store.store.getState().Settings));
        },
        onSaveSerialConnectionSettingsClick: (e) => {
            e.preventDefault();
            dispatch(actions.saveSerialSettings(Store.store.getState().Settings));
        },
        onConnectToPortalClick: (e) => {
            e.preventDefault();
            if (!Store.store.getState().Settings.connected) {
                dispatch(actions.connectToPortal());
            } else {
                dispatch(actions.disconnectFromPortal());
            }
        },
        onChangeDbSavePeriodField: (e) => {
            if (e.target && typeof(e.target)!='undefined' & e.target.value == parseInt(e.target.value)) {
                dispatch(actions.changeDbSavePeriodField(e.target.value))
            }
        },
        onChangeSendToPortalPeriodField: (e) => {
            if (e.target && typeof(e.target)!='undefined' & e.target.value == parseInt(e.target.value)) {
                dispatch(actions.changeSendToPortalPeriodField(e.target.value));
            }
        },
        onChangeDataCacheGranularityField: (e) => {
            if (e.target && typeof(e.target)!='undefined' & e.target.value == parseInt(e.target.value)) {
                dispatch(actions.changeDataCacheGranularityField(e.target.value));
            }
        }
    };
};

const SettingsContainer = connect(mapStateToProps,mapDispatchToProps)(Settings);

export default SettingsContainer;
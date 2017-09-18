import {connect} from 'react-redux';
import Settings from '../components/Settings';
import actions from '../actions/SettingsActions';
import Store from '../store/Store';

const mapStateToProps = (state) => {
    return {
        host: state.Settings.host,
        port: state.Settings.port,
        login: state.Settings.login,
        password: state.Settings.password,
        errors: state.Settings.errors,
        connected: state.Settings.connected
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onChangeHostField: (e) => {
            if (e.target && typeof(e.target)!='undefined') {
                dispatch(actions.changePortalHostField(e.target.value))
            }
        },
        onChangePortField: (e) => {
            if (e.target && typeof(e.target)!='undefined' & e.target.value == parseInt(e.target.value)) {
                dispatch(actions.changePortalPortField(e.target.value))
            }
        },
        onChangeLoginField: (e) => {
            if (e.target && typeof(e.target)!='undefined') {
                dispatch(actions.changePortalLoginField(e.target.value))
            }
        },
        onChangePasswordField: (e) => {
            if (e.target && typeof(e.target)!='undefined') {
                dispatch(actions.changePortalPasswordField(e.target.value))
            }
        },
        onSavePortalConnectionSettingsClick: (e) => {
            e.preventDefault();
            dispatch(actions.savePortalSettings(Store.store.getState().Settings));
        },
        onConnectToPortalClick: (e) => {
            e.preventDefault();
            if (!Store.store.getState().Settings.connected) {
                dispatch(actions.connectToPortal());
            } else {
                dispatch(actions.disconnectFromPortal());
            }
        }
    }
}

const SettingsContainer = connect(mapStateToProps,mapDispatchToProps)(Settings);

export default SettingsContainer;
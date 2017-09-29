import React,{Component} from 'react';
import Store from '../store/Store';
import actions from '../actions/SettingsActions';
import PortalSettings from './PortalSettings';
import SerialSettings from './SerialSettings';

const Settings = class extends Component {
    render() {
        return (
            /*jshint ignore:start */
            <div>
                <div className="content-top clearfix">
                    <h1 className="al-title">Settings</h1>
                </div>
                    <div className="row">
                        <SerialSettings {...this.props}/>
                    </div>
                    <div className="row">
                        <PortalSettings {...this.props}/>
                    </div>
            </div>
            /*jshint ignore:end */
        );
    }

    componentDidMount() {
        while (!Store.isDDPClientConnected()) {
        }
        Store.store.dispatch(actions.getSettings());
        console.log("GOT SETTINGS");
        setInterval(function() {
            Store.store.dispatch(actions.getPortalStatus());
            Store.store.dispatch(actions.getSerialStatus());
        },1000);
    }

    componentWillUnmount() {
        Store.store.dispatch(actions.setPortalErrorMessages({}));
        Store.store.dispatch(actions.setSerialErrorMessages({}));
    }
};

export default Settings;
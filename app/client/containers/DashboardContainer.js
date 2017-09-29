import {connect} from 'react-redux';
import Dashboard from '../components/Dashboard';
import actions from '../actions/DashboardActions';
import Store from '../store/Store';
import fetch from 'isomorphic-fetch';

const mapStateToProps = (state) => {
    return {
        relay_status: state.Dashboard.relay_status,
        relayboard_config: state.Settings.pins,
        online: state.Dashboard.online
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onRelayClick: (command,number) => {
            Store.ddpClient.call('switchRelay',[{number:number,command:command}],function(err,result) {
            });
        }
    };
};

const DashboardContainer = connect(mapStateToProps,mapDispatchToProps)(Dashboard);

export default DashboardContainer;
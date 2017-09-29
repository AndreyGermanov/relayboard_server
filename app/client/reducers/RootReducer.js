import _ from 'lodash';
import SettingsReducer from './SettingsReducer';
import DashboardReducer from './DashboardReducer';

const RootReducer = (state,action) => {

    if (typeof(state) == 'undefined') {
        state = {
            Settings: {},
            Dashboard: {}
        };
    }

    var newState = _.cloneDeep(state);

    newState.Settings = SettingsReducer(state.Settings,action);
    newState.Dashboard = DashboardReducer(state.Dashboard,action);
    return newState;
};

export default RootReducer;
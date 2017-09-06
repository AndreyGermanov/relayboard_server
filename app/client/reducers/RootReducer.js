import _ from 'lodash';
import SettingsReducer from './SettingsReducer';

const RootReducer = (state,action) => {

    if (typeof(state) == 'undefined') {
        state = {
            Settings: {}
        }
    }

    var newState = _.cloneDeep(state);

    newState.Settings = SettingsReducer(state.Settings,action);

    return newState;
}

export default RootReducer;
import _ from 'lodash';

const DashboardReducer = (state,action) => {
    if (typeof(state) == 'undefined' || !_.toArray(state).length) {
        state = {
            relay_status: [],
            online: false
        }
    }
    var newState = _.cloneDeep(state);

    switch (action.type) {
        case 'UPDATE_RELAY_STATUSES':
            newState.relay_status = action.status;
            break;
        case 'SET_ONLINE':
            newState.online = action.online
            break;
    }

    return newState;
}

export default DashboardReducer;
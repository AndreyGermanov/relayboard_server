import Store from '../store/Store';

const DashboardActions = class {
    constructor() {
        this.types = {
            UPDATE_RELAY_STATUSES: 'UPDATE_RELAY_STATUSES',
            SET_ONLINE: 'SET_ONLINE'
        };
    }

    updateRelayStatuses(status) {
        return {
            type: this.types.UPDATE_RELAY_STATUSES,
            status: status
        };
    }

    setOnline(online) {
        return {
            type: this.types.SET_ONLINE,
            online: online
        };
    }

    getRelayStatuses() {
        var self = this;
        return (dispatch) => {
            Store.getRelaysStatus(function(status) {
                dispatch(self.updateRelayStatuses(status));
                dispatch(self.setOnline(true));
            });
        };
    }
};

export default new DashboardActions();
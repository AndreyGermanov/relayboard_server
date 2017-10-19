import moment from 'moment-timezone';
import _ from 'lodash';
const cache_granularity = {
    1: 'Years',
    2: 'Monthes',
    3: 'Days',
    4: 'Hours',
    5: 'Minutes'
};
export default {
    periods: [5,10,15,30,60,300,600,1800,3600,21600,43200,86400],
    getPeriodTitle: (period) => {
        if (period<60) {
            return period+' seconds';
        } else {
            return moment.duration(period * 1000).humanize();
        }
    },
    getCacheGranularityArray: () => {
        return _.toArray(cache_granularity)
    },
    cachePath: '/opt/relayboard_server/cache/sensor_data'
}
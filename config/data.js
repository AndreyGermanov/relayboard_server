import moment from 'moment-timezone';
export default {
    periods: [5,10,15,30,60,300,600,1800,3600,21600,43200,86400],
    getPeriodTitle: (period) => {
        return moment.duration(period*1000).humanize();
    }
}
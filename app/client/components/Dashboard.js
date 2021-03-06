import React,{Component} from 'react';
import actions from '../actions/DashboardActions';
import Store from '../store/Store';

const Dashboard = class extends Component {
    render() {
        var relay_columns = this.props.relay_status.map(function(relay,index) {
            if (this.props.relayboard_config[index].type == 'relay') {
                var command = 'ON',
                    color = 'red';
                    /*jshint ignore:start */
                var link = <span className="fa fa-power-off relay-cell-img" title='NO CONNECTION' style={{color:'gray'}}></span>
                    /*jshint ignore:end */
                if (relay == 1) {
                    command = 'OFF';
                    color = 'green';
                }
                if (this.props.online && this.props.connected) {
                    /*jshint ignore:start */
                    link = <a key={'link_'+index}
                              onClick={this.props.onRelayClick.bind(this,command,this.props.relayboard_config[index].number)}>
                        <span key={'img_'+index} className="fa fa-power-off relay-cell-img"
                              style={{color:color}}></span>
                    </a>
                    /*jshint ignore:end */
                }
                return (
                    /*jshint ignore:start */
                    <td key={'column_'+index} className="relay-cell">
                        <div className='relay-cell-text'>
                            {this.props.relayboard_config[index].number}
                        </div>
                        <div>
                            {link}
                        </div>
                        <div>
                            {this.props.relayboard_config[index].title}
                        </div>
                    </td>
                    /*jshint ignore:end */
                );
            } else {
                relay = relay.split('|');
                var temperature = relay.shift(),
                    humidity = relay.pop();
                return (
                    /*jshint ignore:start */
                    <td key={'column_'+index} className="relay-cell">
                        <div className='relay-cell-text'>
                            {this.props.relayboard_config[index].number}
                        </div>
                        <div>
                            <h3><span style={{color: (this.props.online && this.props.connected) ? 'yellow' : 'gray'}}>
                                    <span className="ion-android-sunny"/>&nbsp;{temperature} C
                                </span>
                            </h3>
                            <h3><span style={{color: (this.props.online && this.props.connected) ? 'cyan' : 'gray'}}>
                                <span className="fa fa-tint"/>&nbsp;{humidity} %</span>
                            </h3>
                        </div>
                        <div>
                            {this.props.relayboard_config[index].title}
                        </div>
                    </td>
                    /*jshint ignore:end */
                );
            }
        },this);

        return (
            /*jshint ignore:start */
            <div>
                <div className="content-top clearfix">
                    <h1 className="al-title">Dashboard</h1>
                </div>
                <div className="flexbox">
                    <div className="panel panel-blur" style={{flex:1}}>
                        <div className="panel-heading">
                            <h3 className="panel-title">My relayboard
                            </h3>
                        </div>
                        <div className="panel-body">
                            <table>
                                <tbody>
                                    <tr>
                                        {relay_columns}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            /*jshint ignore:end */
        );
    }

    componentDidMount() {
        this.statusUpdateInterval = setInterval(function() {
            Store.store.dispatch(actions.getRelayStatuses());
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.statusUpdateInterval);
    }
};

export default Dashboard;
import React,{Component} from 'react';
import actions from '../actions/DashboardActions';
import Store from '../store/Store';

const Dashboard = class extends Component {
    render() {
        var relay_columns = this.props.relay_status.map(function(relay,index) {
            var command = 'ON',
                color = 'red',
                link = <span className="fa fa-power-off" style={{color:'gray'}}></span>
            if (relay==1) {
                command = 'OFF';
                color = 'green';
            };
            if (this.props.online) {
                link = <a  key={'link_'+index}  onClick={this.props.onRelayClick.bind(this,command,index+1)}>
                    <span  key={'img_'+index} className="fa fa-power-off relay-cell-img" style={{color:color}}></span>
                </a>
            };
            return (
                <td key={'column_'+index} className="relay-cell">
                    <div className='relay-cell-text'>
                        {index+1}
                    </div>
                    <div>
                        {link}
                    </div>
                    <div>
                        <input  key={'input_'+index} className="form-control"/>
                    </div>
                </td>
            )
        },this);

        return (
            <div>
                <div className="content-top clearfix">
                    <h1 className="al-title">Dashboard</h1>
                </div>
                <div className="flexbox">
                    <div className="panel panel-blur" style={{flex:1}}>
                        <div className="panel-heading">
                            <h3 className="panel-title">My relayboard
                                <span className="pull-right">
                                    <button type='button' className="btn btn-default btn-xs"><span className="fa fa-save"/>&nbsp;Save changes</button>
                                </span>
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
        )
    }

    componentDidMount() {
        this.statusUpdateInterval = setInterval(function() {
            Store.store.dispatch(actions.getRelayStatuses())
        }, 5000);
    }

    componentWillUnmount() {
        clearInterval(this.statusUpdateInterval);
    }
}

export default Dashboard;
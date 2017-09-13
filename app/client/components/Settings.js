import React,{Component} from 'react';
import Store from '../store/Store';
import actions from '../actions/SettingsActions';

const Settings = class extends Component {
    render() {
        this.prepareForm();
        var fields = this.fields;
        var submitButtonText = this.props.connected ? 'Disconnect' : 'Connect';
        console.log(this.props);
        return (
            <div>
                <div className="content-top clearfix">
                    <h1 className="al-title">Settings</h1>
                </div>
                <div className="flexbox">
                    <div className="panel panel-blur" style={{flex:1}}>
                        <div className="panel-heading">
                            <h3 className="panel-title">Portal connection</h3>
                        </div>
                        <div className="panel-body">
                            <div style={{display:(fields['general'].message.length ? '': 'none')}} className="alert bg-danger">
                                <span className="fa fa-exclamation-circle" style={{paddingRight:7}}></span>
                                {this.props.errors['general']}
                            </div>
                            <form className="form form-horizontal" onSubmit={this.props.onSubmitPortalConnection.bind(this)}>
                                <div className={"form-group "+fields['host'].has_error_class}>
                                    <label className="control-label col-sm-2" htmlFor="hostname">Host:</label>
                                    <div className="col-sm-10">
                                        <input className="form-control" id="hostname"
                                               placeholder={fields['host'].placeholder}
                                               value={this.props.host}
                                               onChange={this.props.onChangeHostField.bind(this)}/>
                                    </div>
                                </div>
                                <div className={"form-group "+fields['port'].has_error_class}>
                                    <label className="control-label col-sm-2" htmlFor="port">Port:</label>
                                    <div className="col-sm-10">
                                        <input className="form-control" value={this.props.port} id="port" placeholder={fields['port'].placeholder}
                                               onChange={this.props.onChangePortField.bind(this)}/>
                                    </div>
                                </div>
                                <div className={"form-group "+fields['login'].has_error_class}>
                                    <label className="control-label col-sm-2" htmlFor="username">Login:</label>
                                    <div className="col-sm-10">
                                        <input className="form-control" id="username" placeholder={fields['login'].placeholder}  value={this.props.login}
                                               onChange={this.props.onChangeLoginField.bind(this)}/>
                                    </div>
                                </div>
                                <div className={"form-group "+fields['password'].has_error_class}>
                                    <label className="control-label col-sm-2" htmlFor="password">Password:</label>
                                    <div className="col-sm-10">
                                        <input className="form-control" id="password" placeholder={fields['password'].placeholder}  value={this.props.password}
                                               type="password" onChange={this.props.onChangePasswordField.bind(this)}/>
                                    </div>
                                </div>
                                <div className="form-group">
                                        <button className="btn btn-info pull-right">
                                            <i className="fa fa-plug"> </i>
                                            <span style={{paddingLeft:7}}>{submitButtonText}</span>
                                        </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    componentDidMount() {
        Store.store.dispatch(actions.getPortalSettings());
    }

    componentDidUpdate() {

    }

    componentWillUnmount() {
        Store.store.dispatch(actions.setPortalErrorMessages({}));
    }

    prepareForm() {
        var fields = {
            host: {
                has_error_class: '',
                placeholder: 'Host name'
            },
            port: {
                has_error_class: '',
                placeholder: 'Port'
            },
            login: {
                has_error_class: '',
                placeholder: 'Login'
            },
            password: {
                has_error_class: '',
                placeholder: 'Password'
            },
            general: {
                message: ''
            }
        };

        if (this.props.errors['host']) {
            fields['host'] = {
                has_error_class: 'has-error',
                placeholder: this.props.errors['host']
            }
        }

        if (this.props.errors['port']) {
            fields['port'] = {
                has_error_class: 'has-error',
                placeholder: this.props.errors['port']
            }
        }

        if (this.props.errors['login']) {
            fields['login'] = {
                has_error_class: 'has-error',
                placeholder: this.props.errors['login']
            }
        }

        if (this.props.errors['password']) {
            fields['password'] = {
                has_error_class: 'has-error',
                placeholder: this.props.errors['password']
            }
        }

        if (this.props.errors['general']) {
            fields['general'] = {
                message: this.props.errors['general']
            }
        }

        this.fields = fields;

    }
};
export default Settings;
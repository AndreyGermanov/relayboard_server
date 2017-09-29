import React,{Component} from 'react';
import PinSettingsTable from './PinSettingsTable';

const SerialSettings = class extends Component {
    render() {
        this.prepareForm();
        var fields = this.fields;
        var connectedStyle = {
            color: 'green'
        };

        if (!this.props.serial_connected) {
            connectedStyle = {
                color: 'red'
            };
        }
        
        return (
            /*jshint ignore:start */
            <div className="panel panel-blur" style={{flex:1}}>
                <div className="panel-heading">
                    <h3 className="panel-title" style={connectedStyle}>
                        Serial Connection
                         <span className="pull-right">
                            <button type='button' className="btn btn-default btn-xs"
                                     onClick={this.props.onSaveSerialConnectionSettingsClick.bind(this)}>
                                <span className="fa fa-save"/>&nbsp;Save changes
                            </button>
                        </span>
                    </h3>
                </div>
                <div className="panel-body">
                    <div style={{display:(fields['general'].message.length ? '': 'none')}} className="alert bg-danger">
                        <span className="fa fa-exclamation-circle" style={{paddingRight:7}}/>
                        {this.props.errors['general']}
                    </div>
                    <form className="form form-horizontal">
                        <div className={"form-group "+fields['serial_port'].has_error_class}>
                            <label className="control-label col-sm-2" htmlFor="serial_port">Port:</label>
                            <div className="col-sm-10">
                                <input className="form-control" id="serial_port"
                                       placeholder={fields['serial_port'].placeholder}
                                       value={this.props.serial_port}
                                       onChange={this.props.onChangeSerialPortField.bind(this)}/>
                            </div>
                        </div>
                        <div className={"form-group "+fields['serial_baudrate'].has_error_class}>
                            <label className="control-label col-sm-2" htmlFor="serial_boudrate">Baud rate:</label>
                            <div className="col-sm-10">
                                <input className="form-control" value={this.props.serial_baudrate} id="serial_baudrate"
                                       placeholder={fields['serial_baudrate'].placeholder}
                                       onChange={this.props.onChangeSerialBaudrateField.bind(this)}/>
                            </div>
                        </div>
                        <div className="row">
                            <h3>Pin map</h3>
                            <PinSettingsTable {...this.props}/>
                        </div>
                    </form>
                </div>
            </div>
            /*jshint ignore:end */
        );
    }

    prepareForm() {

        var fields = {
            serial_port: {
                has_error_class: '',
                placeholder: 'Port'
            },
            serial_baudrate: {
                has_error_class: '',
                placeholder: 'Baud rate'
            },
            general: {
                message: ''
            }
        };

        if (this.props.serial_errors.serial_port) {
            fields.serial_port = {
                has_error_class: 'has-error',
                placeholder: this.props.serial_errors.serial_port
            };
        }

        if (this.props.serial_errors.serial_baudrate) {
            fields.serial_baudrate = {
                has_error_class: 'has-error',
                placeholder: this.props.serial_errors.serial_baudrate
            };
        }

        if (this.props.serial_errors.general) {
            fields.general = {
                message: this.props.serial_errors.general
            };
        }

        this.fields = fields;
    }
};

export default SerialSettings;
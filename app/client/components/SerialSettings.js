import React,{Component} from 'react';

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

        var rows = this.props.pins.map(function(pin,index) {
            var pin_relay_selected = pin.type == 'relay' ? 'selected="selected"' : null;
            var pin_sensor_selected = pin.type == 'sensor' ? 'selected="selected"' : null;
            return (
                <tr key={"pin_row_"+index}>
                    <td>
                        <div className={fields['pins'][index].number.has_error_class}>
                            <input key={'pin_'+index+'_number'} className='form-control'
                            value={pin.number}
                            onChange={this.props.onChangePinNumberField.bind(this,index)}/>
                        </div>
                    </td>
                    <td>
                        <div className={fields['pins'][index].type.has_error_class}>
                            <select  className='form-control' value={pin.type} onChange={this.props.onChangePinTypeField.bind(this,index)}>
                                <option value="relay">Relay</option>
                                <option value="sensor">Sensor</option>
                            </select>
                        </div>
                    </td>
                    <td>
                        <div className={fields['pins'][index].title.has_error_class}>
                            <input  key={'pin_'+index+'_title'} className='form-control'
                                value={pin.title}
                                onChange={this.props.onChangePinTitleField.bind(this,index)}/>
                        </div>
                    </td>
                </tr>
            )
        },this);

        return (
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
                            <table className="table table-bordered table-striped table-hover settings-table">
                                <tbody>
                                    <tr>
                                        <th>Number</th>
                                        <th>Type</th>
                                        <th>Title</th>
                                    </tr>
                                    {rows}
                                </tbody>
                            </table>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    prepareForm() {

        var pins = this.props.pins.map(function() {
            return {
                number: {
                    has_error_class: '',
                    placeholder: 'Pin number'
                },
                type: {
                    has_error_class: '',
                    placeholder: 'Pin type'
                },
                title: {
                    has_error_class: '',
                    placeholder: 'Title'
                }
            }
        });

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
            },
            pins: pins
        };

        if (this.props.errors['serial_port']) {
            fields['serial_port'] = {
                has_error_class: 'has-error',
                placeholder: this.props.errors['serial_port']
            }
        }

        if (this.props.errors['serial_baudrate']) {
            fields['serial_baudrate'] = {
                has_error_class: 'has-error',
                placeholder: this.props.errors['serial_baudrate']
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
export default SerialSettings;
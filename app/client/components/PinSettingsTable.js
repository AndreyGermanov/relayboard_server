import React,{Component} from 'react';

const PinSettingsTable = class extends Component {
    render() {
        this.prepareForm();
        var fields = this.fields;
        var rows = this.props.pins.map(function(pin,index) {
            return (
                <tr key={"pin_row_"+index}>
                    <td>
                        <div className={fields['pins'][index].number.has_error_class}>
                            <input key={'pin_'+index+'_number'} className='form-control'
                                   value={pin.number}
                                   onChange={this.props.onChangePinNumberField.bind(this,index)}
                                   placeholder={fields['pins'][index].number.placeholder}
                            />
                        </div>
                    </td>
                    <td>
                        <div className={fields['pins'][index].type.has_error_class}>
                            <select  className='form-control' value={pin.type}
                                     onChange={this.props.onChangePinTypeField.bind(this,index)}>
                                <option value="relay">Relay</option>
                                <option value="sensor">Sensor</option>
                            </select>
                        </div>
                    </td>
                    <td>
                        <div className={fields['pins'][index].title.has_error_class}>
                            <input  key={'pin_'+index+'_title'} className='form-control'
                                    value={pin.title}
                                    onChange={this.props.onChangePinTitleField.bind(this,index)}
                                    placeholder={fields['pins'][index].title.placeholder}
                            />
                        </div>
                    </td>
                    <td>
                        <button className="btn btn-danger" onClick={this.props.onDeletePinClick.bind(this,index)}>
                            <span className="fa fa-remove"/>&nbsp; Delete
                        </button>
                    </td>
                </tr>
            )
        },this);

        return (
            <table className="table table-bordered table-striped table-hover settings-table">
                <tbody>
                <tr>
                    <th>Number</th>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Actions</th>
                </tr>
                {rows}
                <tr>
                    <td colSpan="4">
                        <button className="btn btn-success" onClick={this.props.onAddPinClick.bind(this)}>
                            <span className="fa fa-plus"/>&nbsp;New
                        </button>
                    </td>
                </tr>
                </tbody>
            </table>
        );
    }

    prepareForm() {
        var self = this;
        var pins = this.props.pins.map(function(pin,index) {
            var result = {
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
            };
            if (self.props.serial_errors.pins && self.props.serial_errors.pins[index]) {
                for (var i in self.props.serial_errors.pins[index]) {
                    result[i].has_error_class = 'has-error';
                    result[i].placeholder = self.props.serial_errors.pins[index][i];
                }
            }
            return result;
        });
        this.fields = {
            pins:pins
        };
    }
};

export default PinSettingsTable;
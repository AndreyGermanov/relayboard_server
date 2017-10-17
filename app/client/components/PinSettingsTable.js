import React,{Component} from 'react';

const PinSettingsTable = class extends Component {
    getPeriods(prefix) {
        return this.props.data_settings.periods.map(function(period) {
            var periodTitle = this.props.data_settings.getPeriodTitle(period);
            return <option key={prefix+'_'+period} value={period}>{periodTitle}</option>
        },this);
    }
    render() {
        this.prepareForm();
        var fields = this.fields,
            save_to_db_periods = this.getPeriods('save_to_db'),
            send_to_portal_periods = this.getPeriods('send_to_portal');
        save_to_db_periods.unshift(<option key={'save_to_db_0'}>Disable</option>);
        send_to_portal_periods.unshift(<option key={'send_to_portal_0'}>Disable</option>);
        var rows = this.props.pins.map(function(pin,index) {
            return (
                /*jshint ignore:start */
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
                                <option value="temperature">Temperature sensor</option>
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
                        <div>
                            <input  key={'pin_'+index+'flag'} type="checkbox"
                                    value={pin.send_live_data}
                                    checked={pin.send_live_data}
                                    onChange={this.props.onChangePinSendLiveDataFlag.bind(this,index)}
                            />
                        </div>
                    </td>
                    <td>
                        <select className="form-control" value={pin.save_to_db_period}
                                onChange={this.props.onChangePinSaveToDbPeriod.bind(this,index)}>
                            {save_to_db_periods}
                        </select>
                    </td>
                    <td>
                        <select className="form-control" value={pin.send_to_portal_period}
                                onChange={this.props.onChangePinSendToPortalPeriod.bind(this,index)}>
                            {send_to_portal_periods}
                        </select>
                    </td>
                    <td>
                        <button className="btn btn-danger" onClick={this.props.onDeletePinClick.bind(this,index)}>
                            <span className="fa fa-remove"/>&nbsp; Delete
                        </button>
                    </td>
                </tr>
                /*jshint ignore:end */
            );
        },this);

        return (
            /*jshint ignore:start */
            <table className="table table-bordered table-striped table-hover settings-table">
                <tbody>
                <tr>
                    <th>Number</th>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Send live data</th>
                    <th>Save to DB period</th>
                    <th>Send to Portal Period</th>
                    <th>Actions</th>
                </tr>
                {rows}
                <tr>
                    <td colSpan="7">
                        <button className="btn btn-success" onClick={this.props.onAddPinClick.bind(this)}>
                            <span className="fa fa-plus"/>&nbsp;New
                        </button>
                    </td>
                </tr>
                </tbody>
            </table>
            /*jshint ignore:end */
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
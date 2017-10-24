import SerialPort from 'serialport';
import EventEmitter from 'events';
import moment from 'moment-timezone';
import _ from 'lodash';
import data_settings from '../../config/data.js';
import fs from 'fs-extra';

var SerialReader = class extends EventEmitter {

    constructor(application) {
        super(application);
        this.application = application;
        this.requests_queue = {};
        this.commands_queue = [];
        this.connected = false;
        this.current_relay_status = [];
        this.current_relay_status_timestamp = 0;
        this.config = require('../../config/relayboard.js').default;
        this.lastConfigUpdateTime = Date.now();
        this.sensor_data = {
            save_to_db_period: {

            },
            send_to_portal_period: {

            }
        };
        this.cached_sensor_data = {

        };
        this.editing_cache_files = [];
        this.on('request',this.processRequest.bind(this));
        setInterval(this.tryConnect.bind(this),1000);
        setInterval(this.handleCallbacks.bind(this),5000);
        setInterval(this.sendCommandToSerial.bind(this),2000);
    }

    processRequest(request) {
        var request_id = request.id ? request.id : request.request_id;
        this.requests_queue[request_id] = {
            callback: request.callback,
            timestamp: Date.now()
        }
        this.commands_queue.push({
            request_id: request_id,
            request_command: request.command,
            request_arguments: request.arguments
        });
    }

    sendCommandToSerial() {
        if (this.commands_queue.length) {
            var command = this.commands_queue.shift();
            try {
                this.port.write(command.request_id + ' ' + command.request_command + ' ' + command.request_arguments + "\n");
            } catch(e) {};
        };
    }

    isConnected() {
        return Date.now() - this.current_relay_status_timestamp < 5000;
    }

    tryConnect() {
        if (!this.isConnected()) {
            this.run();
        }
    }

    setConfig() {
        var config_params = [];
        for (var i in this.config.pins) {
            var type = null;
            switch (this.config.pins[i].type) {
                case 'relay':
                    type = 1;
                    break;
                case 'temperature':
                    type = 2;
                    break;
            }
            config_params.push(this.config.pins[i].number+'|'+type);
        }
        var request = {
            request_id: 'local_config_' + Date.now(),
            command: 'CONFIG',
            arguments: config_params.join(','),
            callback: () => {
            }
        };
        this.emit('request',request);
    }

    cacheSensorData(sensor_data,callback) {
        if (!this.cached_sensor_data[sensor_data.operation]) {
            this.cached_sensor_data[sensor_data.operation] = {};
        }
        if (!this.cached_sensor_data[sensor_data.operation][sensor_data.aggregate_level]) {
            this.cached_sensor_data[sensor_data.operation][sensor_data.aggregate_level] = {};
        }
        if (!this.cached_sensor_data[sensor_data.operation][sensor_data.aggregate_level][sensor_data.sensor_id]) {
            this.cached_sensor_data[sensor_data.operation][sensor_data.aggregate_level][sensor_data.sensor_id] = {
                fields: {}
            };
        }

        if (!_.isEqual(this.cached_sensor_data[sensor_data.operation][sensor_data.aggregate_level][sensor_data.sensor_id].fields,sensor_data.fields)) {
            this.cached_sensor_data[sensor_data.operation][sensor_data.aggregate_level][sensor_data.sensor_id].fields = _.cloneDeep(sensor_data.fields);
            var date_parts = moment(sensor_data.timestamp*1000).format('YYYY-MM-DD-HH-mm-ss').split('-').slice(0,this.config.data_cache_granularity),
                file_name = date_parts.pop(),
                dir_name = data_settings.cachePath+'/'+sensor_data.operation+'/serial/'+date_parts.join('/')+'/';
                delete sensor_data.operation;
            this.editing_cache_files.push(dir_name+file_name);
            var self = this;
            fs.stat(dir_name+file_name, function(err,stat) {
                var func = fs.outputFile;
                if (stat && stat.isFile()) {
                    func = fs.appendFile;
                }
                func(dir_name+file_name,JSON.stringify(sensor_data)+'|',function(err) {
                    self.editing_cache_files.splice(self.editing_cache_files.indexOf(dir_name+file_name),1);
                    if (callback) {
                        callback();
                    }
                });
            })
        } else {
            if (callback) {
                callback();
            }
        }
    }

    setStatus(status_string) {
        var status = status_string.split(',');
        status.pop();
        this.current_relay_status = status.map(function(relay,index) {
            if (this.config.pins[index]) {
                var result = 0;
                var fields = [];
                if (this.config.pins[index].type == 'temperature') {
                    fields = ['temperature', 'humidity'];
                } else if (this.config.pins[index].type == 'relay') {
                    fields = ['status'];
                }

                var data_parts = relay.split('|');
                if (data_parts.length == fields.length) {
                    data_parts = data_parts.map(function (data_part,data_part_index) {
                        if (!data_part ||
                            data_part != parseFloat(data_part) ||
                            isNaN(data_part)) {
                            result = 0;
                        } else {
                            result = parseFloat(data_part);
                        }
                        var data_to_write = null;
                        ['save_to_db_period','send_to_portal_period'].forEach(function(operation){
                            var pin_number = this.config.pins[index].number;
                            if (!this.sensor_data[operation][pin_number]) {
                                this.sensor_data[operation][pin_number] = {
                                    count: {},
                                    sum: {},
                                    max: {},
                                    min: {},
                                    last_read_timestamp: 0
                                }
                            }
                            if (!this.config.pins[index][operation]) {
                                return;
                            }
                            var data_part_field = fields[data_part_index];
                            if (this.sensor_data[operation][pin_number].last_read_timestamp &&
                                    Date.now()-this.sensor_data[operation][pin_number].last_read_timestamp>=this.config.pins[index][operation]*1000) {
                                data_to_write = {
                                    sensor_id: this.config.pins[index].number,
                                    aggregate_level:  this.config.pins[index][operation],
                                    timestamp: Math.round((Date.now()/1000)/(this.config.pins[index][operation]))*(this.config.pins[index][operation]),
                                    operation: operation,
                                    fields: {}
                                };
                                for (var i in fields) {
                                    var data_part_fld = fields[i];
                                    data_to_write.fields[data_part_fld] = {
                                        max: this.sensor_data[operation][pin_number].max[data_part_fld],
                                        min: this.sensor_data[operation][pin_number].min[data_part_fld],
                                        avg: parseFloat((this.sensor_data[operation][pin_number].sum[data_part_fld] / this.sensor_data[operation][pin_number].count[data_part_fld]).toFixed(2))
                                    };
                                    this.sensor_data[operation][pin_number].count[data_part_fld] = 0;
                                    this.sensor_data[operation][pin_number].sum[data_part_fld] = 0;
                                    this.sensor_data[operation][pin_number].min[data_part_fld] = 0;
                                    this.sensor_data[operation][pin_number].max[data_part_fld] = 0;
                                    this.sensor_data[operation][pin_number].last_read_timestamp = 0;
                                };
                                this.cacheSensorData(data_to_write);
                            }
                            if (!this.sensor_data[operation][pin_number].sum[data_part_field]) {
                                this.sensor_data[operation][pin_number].sum[data_part_field] = 0;
                            }
                            if (!this.sensor_data[operation][pin_number].min[data_part_field]) {
                                this.sensor_data[operation][pin_number].min[data_part_field] = 9999999;
                            }
                            if (!this.sensor_data[operation][pin_number].max[data_part_field]) {
                                this.sensor_data[operation][pin_number].max[data_part_field] = -9999999;
                            }
                            if (!this.sensor_data[operation][pin_number].count[data_part_field]) {
                                this.sensor_data[operation][pin_number].count[data_part_field] = 0;
                            }
                            this.sensor_data[operation][pin_number].count[data_part_field] += 1;
                            this.sensor_data[operation][pin_number].sum[data_part_field] += parseFloat(result);
                            if (result > this.sensor_data[operation][pin_number].max[data_part_field]) {
                                this.sensor_data[operation][pin_number].max[data_part_field] = parseFloat(result);
                            }
                            if (result < this.sensor_data[operation][pin_number].min[data_part_field]) {
                                this.sensor_data[operation][pin_number].min[data_part_field] = parseFloat(result);
                            }
                            if (!this.sensor_data[operation][pin_number].last_read_timestamp) {
                                this.sensor_data[operation][pin_number].last_read_timestamp = Date.now();
                            }
                        },this);
                        return result;
                    }, this);
                    return data_parts.join('|');
                } else {
                    var data_parts = [];
                    for (var i in fields) {
                        result.push(0);
                    }
                    return data_parts.join('|')
                }
            }
        },this);
        this.current_relay_status_timestamp = Date.now();
    }

    run(callback) {
	    var self = this;
        if (this.config.port) {
            if (this.port) {
                try {
                    this.port.close();
                } catch (e) {};
            }
            this.port = new SerialPort(this.config.port, {
                baudRate: this.config.baudrate,
                parser: SerialPort.parsers.readline("\n"),
                encoding: 'utf8'
            }, function () {
                self.setConfig();
                self.port.on('data', function (string) {
                    string = string.trim();
                    var request_id = string.split(' ').shift();
                    if (self.requests_queue && self.requests_queue[request_id]) {
                        string = string.split(' ');
                        string.shift();
                        var result = {};
                        result[string.shift()] = string.join(' ');
                        if (self.requests_queue[request_id].callback) {
                            self.requests_queue[request_id].callback(result, request_id);
                        }
                        delete self.requests_queue[request_id];
                    } else {
                        string = string.split(' ');
                        if (string.length>2) {
                            string.shift();
                        };
                        if (string[0] == 'STATUS' && string[1]) {
                            self.setStatus(string[1]);
                        };
                    }
                });
            })
        }

        if (callback) {
            callback();
        }
    }

    handleCallbacks() {
        for (var i in this.requests_queue) {
            if (Date.now()-this.requests_queue[i].timestamp>600000) {
                if (typeof(this.requests_queue[i].callback) == 'function') {
                    this.requests_queue[i].callback({'error':'Could not run command'});
                }
                delete this.requests_queue[i];
            }
        }
    }
}

module.exports = SerialReader;
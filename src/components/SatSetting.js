import React, {Component} from 'react';
import {Form, Button, InputNumber} from 'antd';

class SatSettingForm extends Component {
    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 11 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 13 },
            },
        };
        return (
            <Form
                {...formItemLayout}
                className = "sat-setting"
                onSubmit = {this.showSatellite}
            >
                <Form.Item label="Longitude(degrees)">
                    {getFieldDecorator('longitude', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input Longitude!',
                            },
                        ],
                    })(<InputNumber
                        min = {-180}
                        max = {180}
                        style = {{ width: "100%" }}
                        placeholder = "Please input longitude here"
                    />)}
                </Form.Item>
                <Form.Item label="Latitude(degrees)">
                    {getFieldDecorator('latitude', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input Latitude!',
                            },
                        ],
                    })(<InputNumber
                        min = {-90}
                        max = {90}
                        style = {{ width: "100%" }}
                        placeholder = "Please input latitude here"
                    />)}
                </Form.Item>
                <Form.Item label="Elevation(meters)">
                    {getFieldDecorator('elevation', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input Elevation!',
                            },
                        ],
                    })(<InputNumber
                        min = {-413}
                        max = {8850}
                        style = {{ width: "100%" }}
                        placeholder = "Please input elevation here"
                    />)}
                </Form.Item>
                <Form.Item label="Altitude(degrees)">
                    {getFieldDecorator('altitude', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input Altitude!',
                            },
                        ],
                    })(<InputNumber
                        min = {0}
                        max = {90}
                        style = {{ width: "100%" }}
                        placeholder = "Please input altitude here"
                    />)}
                </Form.Item>
                <Form.Item label="Duration(secs)">
                    {getFieldDecorator('duration', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input Duration!',
                            },
                        ],
                    })(<InputNumber
                        min = {0}
                        max = {90}
                        style = {{ width: "100%" }}
                        placeholder = "Please input duration here"
                    />)}
                </Form.Item>
                <Form.Item className="show-nearby">
                    <Button
                        type = "primary"
                        htmlType = "submit"
                        style = {{ textAlign: "center" }}
                    >
                        Find Nearby Satellite
                    </Button>
                </Form.Item>
            </Form>
        );
    }

    showSatellite = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log('Received values of form: ', values);
                this.props.onShow(values);
            }
        })
    }
}

const SatSetting = Form.create({
    name: "satellite-setting",
})(SatSettingForm);
export default SatSetting;

import React, {Component} from 'react';
import {Avatar, Button, Checkbox, List, Spin} from 'antd';
import satelliteLogo from '../assets/images/satellite.svg';
import {SAT_API_KEY, SATELLITE_POSITION_URL} from '../constants'
import axios from 'axios'

class SatelliteList extends Component {
    state = {
        selected: [],
        isLoad: false,
    }

    onChange = (e) => {
        // 1: get current selected sat info
        const {dataInfo, checked} = e.target;
        const {selected} = this.state;
        // 2: add or remove current selected sat to/from selected array
        const list = this.addOrRemove(dataInfo, checked, selected);
        // 3: update selected state
        this.setState({
            selected: list
        })
    }

    addOrRemove = (item, status, list) => {
        // case 1: checked is true
        //      case 1.1: item is not in the list => add it
        //      case 1.2: item is already in the list => do nothing
        // case 2: checked is false
        //      case 2.1: item is not in the list => do nothing
        //      case 2.2: item is in the list => remove it
        const found = list.some( entry => entry.satid === item.satid);
        if(status && !found){
            list.push(item)
        }

        if(!status && found){
            list = list.filter( entry => {
                return entry.satid !== item.satid;
            });
        }
        return list;
    }

    onShowSatMap = () => {
        this.props.onShowMap(this.state.selected);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.satInfo !== this.props.satInfo) {
            this.setState({
                selected: []
            })
        }
    }

    render() {
        const satList = this.props.satInfo ? this.props.satInfo.above : [];
        const{selected} = this.state;
        const {isLoad} = this.props;

        return (
            <div className = "sat-list-box">
                <div className = "btn-container">
                    <Button className = "sat-list-btn"
                            type = "primary"
                            size = "large"
                            disabled={ selected.length === 0 }
                            onClick = { this.onShowSatMap}
                    >
                        Track on the map
                    </Button>
                </div>

                <hr/>

                {
                    isLoad ?
                        <div className="spin-box">
                            <Spin tip="Loading..." size="large" />
                        </div>
                        :
                        <List
                            className="sat-list"
                            itemLayout="horizontal"
                            size="small"
                            dataSource={satList}
                            renderItem={item => (
                                <List.Item
                                    actions = {[
                                        <Checkbox dataInfo = {item}
                                                  onChange={this.onChange}/>]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar src={satelliteLogo} size={50} />}
                                        title={<p>{item.satname}</p>}
                                        description={`Launch Date: ${item.launchDate}`}
                                    />
                                </List.Item>
                            )}/>
                }
            </div>
        );
    }
}

export default SatelliteList;

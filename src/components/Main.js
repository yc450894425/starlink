import React, {Component} from 'react';
import SatSetting from './SatSetting'
import SatelliteList from './SatelliteList'
import {NEARBY_SATELLITE, SAT_API_KEY, STARLINK_CATEGORY} from '../constants'
import axios from 'axios';
import WorldMap from './WorldMap'

class Main extends Component {

    state = {
        satInfo: null,
        setting: null,
        satList: null,
        // indicator of loading
        isLoadingList: false,
    }

    showNearbySatellite = setting => {
        this.setState({
            setting: setting
        });
        this.fetchSatellite(setting);
    }

    showMap = selectedSatList => {
        this.setState({
            satList:[...selectedSatList]
        })
    }

    fetchSatellite = setting => {
        // fetch data from N2YO
        // step1: destructure, get setting values
        const {latitude, longitude, elevation, altitude} = setting;
        // step2: prepare the url
        const url = `/api/${NEARBY_SATELLITE}/${latitude}/${longitude}/${elevation}/${altitude}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;
        // step3: make ajax call
        // axios.get() returns a promise
        this.setState({
            isLoadingList: true
        })
        axios.get(url)
            .then(response => {
                this.setState({
                    satInfo: response.data,
                    isLoadingList: false,
                })
            }).catch(
                err => {
                    console.log("err: ", err)
                    this.setState({
                        isLoadingList: false,
                    })
                }
        )
    }

    render() {
        const { isLoadingList, satInfo, satList, setting } = this.state;
        return (
            <div className='main'>
                <div className="left-side">
                    <SatSetting
                        onShow = {this.showNearbySatellite}/>
                    <SatelliteList
                        satInfo = {satInfo}
                        isLoad={this.state.isLoadingList}
                        onShowMap={this.showMap}
                    />
                </div>
                <div className="right-side">
                    <WorldMap
                        satData = {satList}
                        observerData = {setting}
                    />
                </div>
            </div>
        );
    }
}

export default Main;

import React, {Component} from 'react';
import { feature } from 'topojson-client';
import axios from 'axios';
import { geoKavrayskiy7 } from 'd3-geo-projection';
import { geoGraticule, geoPath } from 'd3-geo';
import { select as d3Select } from 'd3-selection';
import { timeFormat as d3TimeFormat } from "d3-time-format";

import {SAT_API_KEY, SATELLITE_POSITION_URL, WORLD_MAP_URL} from "../constants";
import * as d3Scale from 'd3-scale'
import {schemeCategory10} from 'd3-scale-chromatic'

const width = 960;
const height = 600;

class WorldMap extends Component {

    constructor() {
        super();
        this.refMap = React.createRef();
        this.refTrack = React.createRef();
        this.map = null;
        this.color = d3Scale.scaleOrdinal(schemeCategory10);

        this.state = {
            isLoading: false,
            isDrawing: false,
        }
    }

    componentDidMount() {
        axios.get(WORLD_MAP_URL)
            .then( res => {
                const { data } = res;
                const land = feature(data, data.objects.countries).features;
                this.generateMap(land);
            }).catch( err => {
                console.log("err in fetching map data", err);
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.satData !== this.props.satData) {
            const {
                latitude,
                longitude,
                elevation,
                duration
            } = this.props.observerData;
            const endTime = duration * 60;

            this.setState({
                isLoading: true
            });

            // step1: prepare for urls
            const urls = this.props.satData.map(sat => {
                const { satid } = sat;
                const url = `/api/${SATELLITE_POSITION_URL}/${satid}/${latitude}/${longitude}/${elevation}/${endTime}/&apiKey=${SAT_API_KEY}`;
                return axios.get(url);
            });

            // step2: parse sats positions
            // axios.all(urls)
            //     .then(
            //         axios.spread((...args) => {
            //             return args.map(item => item.data)
            //         })
            //     )
            //     .then(res => {
            //         console.log('response => ', res)
            //         this.track(res)
            //     })
            //     .catch(err => {
            //         console.log("err in fetch satellite position -> ", err.message)
            //     })
            Promise.all(urls)
                .then(results => {
                    console.log('response => ', results)
                    const data = results.map(sat => sat.data)
                    this.setState({
                        isLoading: false,
                        isDrawing: true
                    });

                    if (!prevState.isDrawing) {
                        this.track(data)
                    } else {
                        const oHint = document.getElementsByClassName("hint")[0];
                        oHint.innerHTML = "Please wait for these satellite animation to finish before selection new ones!";
                    }
                })
                .catch(err => {
                    console.log("err in fetch satellite position -> ", err.message)
                })
        }
    }

    track = data => {
        if (!data || !data[0].hasOwnProperty("positions")) {
            throw new Error("no position data");
            return;
        }

        const len = data[0].positions.length;
        // const { duration } = this.props.observerData;
        const { context2 } = this.map;

        let start = new Date();

        let i = 0;

        let timer = setInterval(() => {
            let curr = new Date();

            let timePassed = i === 0 ? 0 : curr - start;
            let time = new Date(start.getTime() + 60 * timePassed);

            context2.clearRect(0, 0, width, height);

            context2.font = "bold 14px sans-serif";
            context2.fillStyle = "#333";
            context2.textAlign = "center";
            context2.fillText(d3TimeFormat(time), width / 2, 10);

            if (i >= len) {
                clearInterval(timer);
                this.setState({ isDrawing: false });
                const oHint = document.getElementsByClassName("hint")[0];
                oHint.innerHTML = "";
                return;
            }

            data.forEach(sat => {
                const { info, positions } = sat;
                this.drawSat(info, positions[i]);
            });

            i += 60;
        }, 1000)
    }

    drawSat = (sat, pos) => {
        const { satlongitude, satlatitude } = pos;
        if (!satlongitude || !satlongitude) return;

        const {satname} = sat;
        const nameWithNumber = satname.match(/\d+/g).join("");

        const { projection, context2 } = this.map;
        const xy = projection([satlongitude, satlatitude]);

        context2.fillStyle = this.color(nameWithNumber);
        context2.beginPath();
        context2.arc(xy[0], xy[1], 4, 0, 2 * Math.PI);
        context2.fill();

        context2.font = "bold 11px sans-serif";
        context2.textAlign = "center";
        context2.fillText(nameWithNumber, xy[0], xy[1] + 14);
    }



    // this part can be re-used in your other projects
    // a simpler option is react-simple-maps
    generateMap = land => {
        const projection = geoKavrayskiy7()
            .scale(170)
            .translate([width / 2, height / 2])
            .precision(.1);

        const graticule = geoGraticule();

        const canvas1 = d3Select(this.refMap.current)
            .attr("width",width)
            .attr("height", height);

        const canvas2 = d3Select(this.refTrack.current)
            .attr('width', width)
            .attr('height', height);

        let context1 = canvas1.node().getContext("2d");
        let context2 = canvas2.node().getContext("2d");

        let path = geoPath()
            .projection(projection)
            .context(context1);

        land.forEach(ele => {
            // countries
            context1.fillStyle = '#B3DDEF';
            context1.strokeStyle = '#000';
            context1.globalAlpha = 0.7;
            context1.beginPath();
            path(ele);
            context1.fill();
            context1.stroke();

            // longitude and latitude
            context1.strokeStyle = 'rgba(220, 220, 220, 0.1)';
            context1.beginPath();
            path(graticule());
            context1.lineWidth = 0.1;
            context1.stroke();

            // top and bottom lines
            context1.beginPath();
            context1.lineWidth = 0.5;
            path(graticule.outline());
            context1.stroke();
        });


        this.map = {
            projection: projection,
            graticule: graticule,
            context1: context1,
            context2: context2,
        };


    }

    render() {
        return (
            <div className="map-box">
                <canvas className="map" ref={this.refMap}></canvas>
                <canvas className="track" ref={this.refTrack}></canvas>
                <div className="hint" />
            </div>
        );
    }
}

export default WorldMap;

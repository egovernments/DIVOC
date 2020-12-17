import React from 'react';
import '../../../node_modules/react-vis/dist/style.css';
import {LabelSeries, VerticalBarSeries, XAxis, XYPlot} from 'react-vis';

export const ColumnChart = ({data, height, width, color}) => {
    return (
        <div className="App">
            <XYPlot xType="ordinal" width={width} height={height}>
                <XAxis/>
                <VerticalBarSeries className="vertical-bar-series-example" data={data} color={color}/>
                <LabelSeries data={data} getLabel={d => d.y} animation={true}
                             style={{fontSize: "12px", textAlign: "center"}}/>
            </XYPlot>
        </div>
    )
};
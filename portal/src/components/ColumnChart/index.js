import React from 'react';
import '../../../node_modules/react-vis/dist/style.css';
import {LabelSeries, VerticalBarSeries, XAxis, XYPlot} from 'react-vis';

export const ColumnChart = ({data, height, width, color, tickLabelAngle = 0}) => {
    return (
        <div className="App">
            <XYPlot xType="ordinal" width={width} height={height} margin={{left: 50, bottom: 50}}>
                <XAxis tickLabelAngle={tickLabelAngle}/>
                <VerticalBarSeries className="vertical-bar-series-example" data={data} color={color}/>
                <LabelSeries data={data} getLabel={d => d.y} animation={true}
                             style={{fontSize: "12px", textAlign: "center"}}/>
            </XYPlot>
        </div>
    )
};
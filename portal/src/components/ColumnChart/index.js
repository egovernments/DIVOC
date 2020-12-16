import React, {Component} from 'react';
import '../../../node_modules/react-vis/dist/style.css';
import {LabelSeries, VerticalBarSeries, XAxis, XYPlot} from 'react-vis';

export class ColumnChart extends Component {
    render() {
        const greenData = [{x: '0-10', y: 10}, {x: '11-20', y: 20}, {x: '21-30', y: 30}, {x: '21-40', y: 40}, {x: '41-50', y: 50}, {x: '51-60', y: 40}, {x: '61-70', y: 30}, {x: '71-80', y: 20}, {x: '81-90', y: 10}, {x: '91-100', y: 0}];
        return (
            <div className="App">
                <XYPlot xType="ordinal" width={500} height={150}>
                    <XAxis/>
                    <VerticalBarSeries className="vertical-bar-series-example" data={greenData} color={"#2CD889"}/>
                    <LabelSeries data={greenData} getLabel={d => `${d.y}%`} animation={true} style={{fontSize: "12px", textAlign: "center"}} />
                </XYPlot>
            </div>
        );
    }
}
import React, {useState} from 'react';

import {
    AreaSeries,
    DiscreteColorLegend,
    Hint,
    HorizontalGridLines,
    MarkSeries,
    VerticalGridLines,
    XAxis,
    XYPlot,
    YAxis
} from 'react-vis';

const months = ["Jan", "Feb", "Mar", "Apr"];

export function AreaChart(props) {
    const [value, setValue] = useState(null);

    const _forgetValue = () => {
        setValue(null)
    };

    const _rememberValue = value => {
        setValue(value);
    };
    return (
        <XYPlot width={1000} height={500}>
            <VerticalGridLines/>
            <HorizontalGridLines/>
            <XAxis tickValues={[1, 2, 3]} tickFormat={v => `${months[v - 1]}`}/>
            <YAxis tickValues={[1, 5, 10, 15,20]}/>
            <AreaSeries
                className="area-series-example"
                curve="curveNatural"
                data={[{x: 1, y: 10}, {x: 2, y: 5}, {x: 3, y: 15}]}
                color={"rgba(161,217,251, 0.5)"}
            />
            <AreaSeries
                className="area-series-example"
                curve="curveNatural"
                data={[{x: 1, y: 20}, {x: 2, y: 5}, {x: 3, y: 10}]}
                color={"rgba(170,183,233, 0.5)"}
            />
            <MarkSeries
                onValueMouseOver={_rememberValue}
                onValueMouseOut={_forgetValue}
                data={[{x: 1, y: 10}, {x: 2, y: 5}, {x: 3, y: 15}]}
                color={"rgb(161,217,251)"}
                strokeWidth={1}
            />
            <MarkSeries
                onValueMouseOver={_rememberValue}
                onValueMouseOut={_forgetValue}
                data={[{x: 1, y: 20}, {x: 2, y: 5}, {x: 3, y: 10}]}
                color={"rgb(170,183,233)"}
            />
            {value ? <Hint value={value}/> : null}
            <DiscreteColorLegend orientation="horizontal" width={300} items={ITEMS} />
        </XYPlot>
    );
}
const ITEMS = [
    {title: 'Vaccine 1', color: "rgb(161,217,251)", strokeStyle: "dashed"},
    {title: 'Vaccine 2', color: 'rgb(170,183,233)', strokeDasharray: "1 2 3 4 5 6 7"},
];
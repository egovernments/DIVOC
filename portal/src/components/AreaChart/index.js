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

export function AreaChart({data, height, width}) {
    const [value, setValue] = useState(null);

    const _forgetValue = () => {
        setValue(null)
    };

    const _rememberValue = value => {
        setValue(value);
    };
    const xAxisValues= data.map((d) => d.x);
    const yAxisValues= data.map((d) => d.y);
    return (
        <XYPlot width={width} height={height} margin={{left: 50, bottom: 50}}>
            <VerticalGridLines/>
            <HorizontalGridLines/>
            <XAxis tickValues={xAxisValues} tickFormat={v => `${v}`} tickLabelAngle={-25}/>
            <YAxis tickValues={yAxisValues}/>
            <AreaSeries
                className="area-series-example"
                curve="curveNatural"
                data={data}
                color={"rgba(161,217,251, 0.5)"}
            />

            <MarkSeries
                onValueMouseOver={_rememberValue}
                onValueMouseOut={_forgetValue}
                data={data}
                color={"rgb(161,217,251)"}
                strokeWidth={1}
            />
            {value ? <Hint value={value}/> : null}
            {/*<DiscreteColorLegend orientation="horizontal" width={300} items={ITEMS} />*/}
        </XYPlot>
    );
}
const ITEMS = [
    {title: 'Vaccine 1', color: "rgb(161,217,251)", strokeStyle: "dashed"},
    {title: 'Vaccine 2', color: 'rgb(170,183,233)', strokeDasharray: "1 2 3 4 5 6 7"},
];
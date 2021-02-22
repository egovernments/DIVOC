import React, {useState} from 'react';

import {
    AreaSeries,
    DiscreteColorLegend,
    Hint,
    HorizontalGridLines, LineMarkSeries,
    MarkSeries,
    VerticalGridLines,
    XAxis,
    XYPlot,
    YAxis
} from 'react-vis';


export function AreaChart({data, height, width}) {
    const [value, setValue] = useState(null);

    const _forgetValue = () => {
        setValue(null)
    };

    const _rememberValue = value => {
        setValue(value);
    };
    return (
        <XYPlot onMouseLeave={_forgetValue} width={width} xType="ordinal" height={height} margin={{left: 50, bottom: 50}}>
            <HorizontalGridLines/>
            <XAxis tickLabelAngle={-25}/>
            <YAxis hideLine/>
            <LineMarkSeries
                className="linemark-series-example"
                style={{
                    strokeWidth: '3px'
                }}
                lineStyle={{stroke: 'rgba(161,217,251, 0.5)'}}
                markStyle={{stroke: 'rgba(161,217,251, 0.5)'}}
                data={data}
                color={"rgba(161,217,251, 0.5)"}
            />

            <MarkSeries
                onNearestX={_rememberValue}
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

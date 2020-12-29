import React, {useEffect, useState} from "react";
import Slider from "@material-ui/core/Slider";
import "./index.css"
import {withStyles} from "@material-ui/styles";

const CustomSlider = withStyles({
    root: {
        color: "#506dd6"
    }
})(Slider);

export const CustomRangeWidget = (props) => {
    const [value, setValue] = useState(props.schema.minimum);

    const updateValue = (newValue) => {
        setValue(newValue);
        props.onChange(newValue)
    };

    const handleSliderChange = (event, newValue) => {
        updateValue(newValue);
    };

    const handleInputChange = (event) => {
        updateValue(event.target.value === '' ? '' : Number(event.target.value));
    };
    return (
        <div>
            <div className="d-flex justify-content-between align-items-center">
                <span style={{color: "#4E4E4E"}}>{props.schema.title}</span>
                <input type="number" className="rounded-text-box" onChange={handleInputChange} value={value}
                       step={props.schema.multipleOf}
                       min={props.schema.minimum}
                       max={props.schema.maximum}/>
            </div>
            <CustomSlider
                value={value}
                onChange={handleSliderChange}
                step={props.schema.multipleOf}
                valueLabelDisplay="auto"
                min={props.schema.minimum}
                max={props.schema.maximum}
                marks={[
                    {
                        value: props.schema.minimum,
                        label: `${props.schema.minimum}${props.schema.unit}`
                    },
                    {
                        value: props.schema.maximum,
                        label: `${props.schema.maximum}${props.schema.unit}`
                    }
                ]}
            />
        </div>

    );
};
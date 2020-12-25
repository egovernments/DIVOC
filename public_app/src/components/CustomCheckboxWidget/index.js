import React from "react";
import Switch from '@material-ui/core/Switch';
import {withStyles} from "@material-ui/core/styles";
import FormControlLabel from "@material-ui/core/FormControlLabel";

const CustomSwitch = withStyles({
    switchBase: {
        '&$checked': {
            color: "#88C6A9",
        },
        '&$checked + $track': {
            backgroundColor: "#88C6A9",
        },
    },
    checked: {},
    track: {},
})(Switch);

const CustomFormControlLabel = withStyles({
    root: {
        display: "flex",
        justifyContent: "space-between",
        margin: 0
    },
    label: {
        color: "#4E4E4E"
    }
})(FormControlLabel);

export const CustomCheckboxWidget = (props) => {
    return (

        <CustomFormControlLabel
            control={<div>
                <CustomSwitch
                    checked={props.value || false}
                    onChange={() => props.onChange(!props.value)}
                    color="primary"
                />
                <span>{props.schema.enumNames && props.schema.enumNames[props.value ? 0 : 1]}</span>
            </div>}
            label={props.schema.title}
            labelPlacement="start"
        />

    );
};
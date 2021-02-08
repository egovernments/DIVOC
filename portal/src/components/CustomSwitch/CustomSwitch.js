import withStyles from "@material-ui/core/styles/withStyles";
import Switch from "@material-ui/core/Switch/Switch";

export const CustomSwitch = (props) => {

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

    return(
        <CustomSwitch
            checked={props.checked}
            onChange={props.onChange}
            color="primary"
        />
    )
}
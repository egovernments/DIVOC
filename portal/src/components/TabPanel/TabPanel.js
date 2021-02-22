import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {makeStyles, withStyles} from '@material-ui/core/styles';
import {Button, Row} from "react-bootstrap";


export const StyledTabs = withStyles({
    indicator: {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        color: '#040E28',
        '& > span': {
            maxWidth: 60,
            width: '100%',
            backgroundColor: '#5C9EF8',
        },
    },
})((props) => <Tabs {...props} TabIndicatorProps={{children: <span/>}}/>);

export const StyledTab = withStyles((theme) => ({
    root: {
        textTransform: 'none',
        textAlign: 'left',
        fontWeight: 'bold',
        fontSize: theme.typography.pxToRem(16),
        marginRight: theme.spacing(1),
        '&:focus': {
            opacity: 1,
            outline: "none",
        },
    },
}))((props) => <Tab disableRipple {...props} />);

export const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        paddingTop: theme.spacing(3),
    },
}));

export const TabPanels = ({tabs}) => {
    const [value, setValue] = React.useState(0);
    const classes = useStyles();
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    return (
        <div className={classes.root}>
            <div className="d-flex flex-row justify-content-between">
                <StyledTabs
                    value={value}
                    indicatorColor="secondary"
                    onChange={handleChange}
                    aria-label="styled tabs example"
                >
                    {
                        tabs.map((tab, index) => (
                            <StyledTab 
                            label={<h4 style={{"fontSize": "18px"}}><b>{tab.title}</b></h4>}/>
                        ))
                    }
                </StyledTabs>
                {tabs[value].rightTabContent}
            </div>
            {
                tabs[value].component
            }
        </div>
    );
};

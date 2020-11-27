import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import { makeStyles, withStyles } from '@material-ui/core/styles';
import VaccineRegistration from "../VaccineRegistration/VaccineRegistration";
import FacilitiesRegistry from "../FacilitiesRegistry/FacilitiesRegistry";
import ProgramRegistration from "../ProgramRegistration/ProgramRegistration";
import VaccinatorsRegistry from "../VaccinatorsRegistry/VaccinatorsRegistry";
import PreEnrollment from "../PreEnrollment/PreEnrollment";


const StyledTabs = withStyles({
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
  })((props) => <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />);

  const StyledTab = withStyles((theme) => ({
    root: {
      textTransform: 'none',
      textAlign: 'left',
      fontWeight: 'bold',
      fontSize: theme.typography.pxToRem(16),
      marginRight: theme.spacing(1),
      '&:focus': {
        opacity: 1,
      },
    },
  }))((props) => <Tab disableRipple {...props} />);

  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      paddingLeft: theme.spacing(10),
      paddingRight: theme.spacing(10),
      paddingTop: theme.spacing(3),
    },
  }));

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div {...other}>{value === index && <Box p={3}>{children}</Box>}</div>
    );
}

export default function Admin() {
    const [value, setValue] = React.useState(0);
    const classes = useStyles();
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    return (
        <div className={classes.root}>
            <StyledTabs
                value={value}
                indicatorColor="secondary"
                onChange={handleChange}
                aria-label="styled tabs example"
            >
                <StyledTab label="Facilities" />
                <StyledTab label="Vaccinators" />
                <StyledTab label="Vaccine Programs" />
                <StyledTab label="Vaccines" />
                <StyledTab label="Enrollment" />
            </StyledTabs>
            <TabPanel value={value} index={0}>
                <FacilitiesRegistry />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <VaccinatorsRegistry />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <ProgramRegistration />
            </TabPanel>
            <TabPanel value={value} index={3}>
                <VaccineRegistration />
            </TabPanel>
            <TabPanel value={value} index={4}>
                <PreEnrollment />
            </TabPanel>
        </div>
    );
}

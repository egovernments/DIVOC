import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import Paper from '@material-ui/core/Paper';
import VaccineRegistration from "../VaccineRegistration/VaccineRegistration";
import Facilities from "../Facilities/Facilities";
import ProgramRegistration from "../ProgramRegistration/ProgramRegistration";

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div {...other}>{value === index && <Box p={3}>{children}</Box>}</div>
    );
}

export default function Admin() {
    const [value, setValue] = React.useState(0);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    return (
        <>
             <Paper square>
                <Tabs
                    value={value}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={handleChange}
                    aria-label="disabled tabs example"
                >
                    <Tab label="Facilities" />
                    <Tab label="Vaccinators" />
                    <Tab label="Vaccine Programs" />
                    <Tab label="Vaccines" />
                </Tabs>
            </Paper>
            <TabPanel value={value} index={0}>
                <Facilities />
            </TabPanel>
            <TabPanel value={value} index={1}>
                Item one
            </TabPanel>
            <TabPanel value={value} index={2}>
                <ProgramRegistration />
            </TabPanel>
            <TabPanel value={value} index={3}>
                <VaccineRegistration />
            </TabPanel>
        </>
    );
}

import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import MapView from '../MapView/MapView';
import Country from '../../Images/Country.svg';
import Stats from '../../Images/Stats.svg';
import Report from '../../Images/Report.svg';



function NavigationToolbar() {
    return(
        <Tabs>
            <TabList>
                <Tab><img src={Country} alt="Map" /></Tab>
                <Tab><img src={Stats} alt="Stats" /></Tab>
                <Tab><img src={Report} alt="Report" /></Tab>
            </TabList>
        
            <TabPanel>
                <MapView />
            </TabPanel>
            <TabPanel>
                <h2>Any content 2</h2>
            </TabPanel>
        </Tabs>
    );
}

export default NavigationToolbar;
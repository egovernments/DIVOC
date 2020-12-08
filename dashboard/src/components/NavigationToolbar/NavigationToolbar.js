import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import MapView from '../MapView/MapView';
import Country from '../../Images/Country.svg';
import Repo from '../../Images/Repo.svg';
import ReportView from '../ReportView/ReportView';



function NavigationToolbar() {

    return(
        <Tabs>
            <TabList vertical >
                <Tab><img src={Country} alt="Map" /></Tab>
                <Tab><img src={Repo} alt="Report" /></Tab>
            </TabList>
        
            <TabPanel >
                <MapView />
            </TabPanel>
            <TabPanel>
               <ReportView />
            </TabPanel>
        </Tabs>
    );

    
}

export default NavigationToolbar;
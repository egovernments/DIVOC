import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import MapView from '../MapView/MapView';
import Country from '../../assets/img/Country.svg';
import Repo from '../../assets/img/Repo.svg';
import ReportView from '../ReportView/ReportView';



function Dashboard() {

    return(
        // <Tabs className="text-center pt-3">
        //     <TabList vertical >
        //         <Tab><img src={Country} alt="Map" /></Tab>
        //         <Tab><img src={Repo} alt="Report" /></Tab>
        //     </TabList>

        //     <TabPanel >
        //         <MapView />
        //     </TabPanel>
        //     <TabPanel>
        //         <ReportView />
        //     </TabPanel>
        // </Tabs>
        <MapView />
    );


}

export default Dashboard;
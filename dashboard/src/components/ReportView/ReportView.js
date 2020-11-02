import React, { useState, useEffect } from 'react';
import StateDropDown from '../StateDropDown/StateDropDown';
import {STATE_NAMES,API_ROOT_URL} from '../../constants';
import styles from './ReportView.module.css';
import TextBox from '../TextBox/TextBox';
import ReportTable from '../ReportTable/ReportTable';
import { format } from 'date-fns';
import state_and_districts from '../../DummyData/state_and_districts.json';


function Report() {
    const [ covidData, setCovidData ] = useState([])
    const [ selectedState, setSelectedState ] = useState("TT")
    const [districts, setDistricts] = useState({});
    const [stateList, setStateList] = useState({});
    
    useEffect(()=>{
        fetchData();
    },[])

    useEffect(() => {
        setDistrictsForSelectedState();
      }, [selectedState]);

    const fetchData = async () => {
        let date = new Date();
        date = format(date.setDate(date.getDate()-1),'yyyy-MM-dd')
        const data = await fetch(`${API_ROOT_URL}/data-2020-10-31.json`).then((response) => {
            return response.json();
          });

        console.log("covid response",data)
        setCovidData(data);
    }

    const setDistrictsForSelectedState = () => {
        console.log("district selection under progress for ",selectedState)
        let district_list = {}
        district_list = Object.values(state_and_districts['states']).filter( state => state.code === selectedState)[0]
        if(district_list !== undefined){
            district_list = district_list.districts
            setDistricts(district_list)
        }
    }

    function conditionalRenderingOfTable() {
        if(Object.keys(districts).length === 0)
            return <ReportTable data={covidData} rowName="state"/> 
        return <ReportTable data={covidData} rowName="district" selectedState={selectedState}/>
    }

    return(
        <div>
            <div className={styles['dropdown-row']}>  
                <div className={'dropdown'}>
                    <span>Select State</span>
                    <StateDropDown 
                        dropdownList={STATE_NAMES} 
                        placeHolder="Select State" 
                        setSelectedItem={setSelectedState}
                    />  
                </div>
                <div className={'dropdown'}>
                    <span>Select City</span>
                    {/* <DistrictDropDown
                        dropdownList={districts} 
                        placeHolder="Select City"
                        // setSelectedItem={setDistricts}
                    /> */}
                </div> 
            </div>
            <div className={styles['details-row']}>
                <div className={styles['details']}>
                    <span>COVID PREVALENCE</span>
                    <div className={styles['box']}>
                        <TextBox  number="7,72,055" text="Tested" color="#1D1D1D" />
                        <TextBox  number="7,78,50,403" text="Active" color="#1D1D1D" />
                    </div>
                </div>
                <div className={styles['details']}>
                    <span>PROGRAM SETUP</span>
                    <div className={styles['box']}>
                        <TextBox  number="123" text="Government" color="#479EFF" />
                        <TextBox  number="32" text="Private" color="#479EFF" />
                        <TextBox  number="1,20,000" text="Capacity/Week" color="#E99B00" />
                    </div>
                </div>
                <div className={styles['details']}>
                    <span>CERTIFICATES</span>
                    <TextBox  number="7,72,055" text="Total Issued" color="#74C9A7" />
                </div>
            </div>
            {conditionalRenderingOfTable()}
        </div>
        
    );
}

export default Report;
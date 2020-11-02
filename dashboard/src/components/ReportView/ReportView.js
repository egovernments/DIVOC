import React, { useState, useEffect } from 'react';
import DropDown from '../DropDown/DropDown';
import {STATE_NAMES,API_ROOT_URL} from '../../constants';
import styles from './ReportView.module.css';
import TextBox from '../TextBox/TextBox';
import ReportTable from '../ReportTable/ReportTable';
import { format } from 'date-fns';


function Report() {
    const [covidData,setCovidData] = useState([])
    
    useEffect(()=>{
        fetchData();
    },[])

    const fetchData = async () => {
        let date = new Date();
        date = format(date.setDate(date.getDate()-1),'yyyy-MM-dd')
        const data = await fetch(`${API_ROOT_URL}/data${date ? `-${date}` : ''}.json`).then((response) => {
            return response.json();
          });
        setCovidData(data);
    }
    return(
        <div>
            <div className={styles['dropdown-row']}>  
                <div className={'dropdown'}>
                    <span>Select State</span>
                    <DropDown dropdownList={STATE_NAMES} placeHolder="Select State"/>  
                </div>
                <div className={'dropdown'}>
                    <span>Select City</span>
                    <DropDown dropdownList={STATE_NAMES} placeHolder="Select City"/>
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
            <ReportTable
                data={covidData}
            />
        </div>
        
    );
}

export default Report;
import React, { useState, useEffect } from 'react';
import DropDown from '../DropDown/DropDown';
import {PROGRAMS,STATE_NAMES,DISTRICT_NAMES} from '../../utils/constants';
import styles from './FacilityActivation.module.css';

function FacilityActivation() {
    const [listOfStates,setListOfStates] = useState([])
    const [selectedProgram,setSelectedProgram] = useState([])
    const [selectedState,setSelectedState] = useState([])
    const [selectedDistrict,setSelectedDistrict] = useState([])

    useEffect(() => {
        normalizeStateNames();
    }, [])

    const normalizeStateNames = () => {
        let data = []
        Object.keys(STATE_NAMES).map(state => {
            let newData = {}
            newData.value = state;
            newData.label = STATE_NAMES[state]
            data.push(newData)
        })
        setListOfStates(data)
    }

    const handleChange = (district) => {
        setSelectedDistrict(district);
    }

    const showDistrictList = () => {
        return Object.keys(DISTRICT_NAMES).map( district => {
            return(
                <tr>
                    <td><input type="radio" onChange={(event) => handleChange(district)}/>
                    {district}</td>
                    <td>{DISTRICT_NAMES[district]}</td>
                </tr>
            );
        })
    }

    return(
        <div class="row" >
           
            <div class="col-sm-3 container">
            <div >
                <DropDown options={PROGRAMS} placeholder="Select Program" setSelectedOption={setSelectedProgram}/>
            </div>
            <div >
                <p>All of India</p>
                <DropDown  options={listOfStates} placeholder="Please select State" setSelectedOption={setSelectedState}/>
            </div>
            <div class="table-responsive" className={styles['table']}>
                
                <table class="table table-borderless">
                    <thead>
                        <tr>Please select District</tr>
                    </thead>
                    <tbody>
                        {showDistrictList()}
                    </tbody>
                </table>
            </div>
            </div>
        </div>
    );
}

export default FacilityActivation
import React, {useEffect, useState} from "react";
import styles from "./FacilityAdjustingRate.module.css";
import {CheckboxItem, FacilityFilterTab, RadioItem} from "../FacilityFilterTab";


function FacilityAdjustingRate({districtList, stateList, program}) {
    const [programs, setPrograms] = useState(program);
    const [selectedProgram, setSelectedProgram] = useState("");
    const [states, setStates] = useState([]);
    const [selectedState, setSelectedState] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState();
    const [facilityType, setFacilityType] = useState("Government");


    const [lastAdjustedOn, setLastAdjustedOn] = useState("Week");


    const [allChecked, setAllChecked] = useState(false);
    const [selectedRate, setSelectedRate] = useState({});

    const [submit, setSubmit] = useState(false);
    const [faclitiesList, setFacilitiesList] = useState([
        {
            id: 1,
            name: "Centre 1",
            stations: 100,
            vaccinators: 100,
            rate: 100,
            last_adjusted_on: 'DD/MMM/YYYY',
            isChecked: false
        },
        {
            id: 2,
            name: "Centre 2",
            stations: 100,
            vaccinators: 100,
            rate: 100,
            last_adjusted_on: 'DD/MMM/YYYY',
            isChecked: false
        },
        {
            id: 3,
            name: "Centre 3",
            stations: 100,
            vaccinators: 100,
            rate: 300,
            last_adjusted_on: 'DD/MMM/YYYY',
            isChecked: false
        },
        {
            id: 4,
            name: "Centre 4",
            stations: 100,
            vaccinators: 100,
            rate: 300,
            last_adjusted_on: 'DD/MMM/YYYY',
            isChecked: false
        },
        {
            id: 5,
            name: "Centre 5",
            stations: 100,
            vaccinators: 100,
            rate: 300,
            last_adjusted_on: 'DD/MMM/YYYY',
            isChecked: false
        },
    ]);

    const [rateWiseFacility, setRateWiseFacility] = useState({});

    useEffect(() => {
        normalize();
    }, []);

    useEffect(() => {
        const selectedFacilities = faclitiesList.map((fac, index) => ({
            ...fac,
            index
        })).filter(facility => facility.isChecked);
        const rateWiseFacilities = {};
        selectedFacilities.forEach(facility => {
            const rate = facility.rate;
            if (rate in rateWiseFacilities) {
                rateWiseFacilities[rate].facilities = [...rateWiseFacilities[rate].facilities, facility.index];
            } else {
                rateWiseFacilities[rate] = {facilities: [facility.index], currentRate: rate, newRate: rate};
            }
        });
        setRateWiseFacility(rateWiseFacilities);
    }, [faclitiesList]);

    const normalize = () => {
        const statesList = Object.keys(stateList).map((state) => ({value: state, label: stateList[state]}));
        setStates(statesList);
    };

    const handleChange = (value, setValue) => {
        setValue(value);
    };

    const updateFacility = (index, key, value) => {
        const facilityData = [...faclitiesList];
        facilityData[index][key] = value;
        setFacilitiesList(facilityData);
    };


    const getFacilityList = () => {
        return faclitiesList.map((facility, index) => (
            <tr>
                <td>{facility['id']}</td>
                <td>{facility['name']}</td>
                <td>{facility['stations']}</td>
                <td>{facility['vaccinators']}</td>
                <td>{facility['rate']}</td>
                <td>{facility['last_adjusted_on']}</td>
                <td>
                    <CheckboxItem
                        text={facility['id']}
                        showText={false}
                        checked={facility.isChecked}
                        onSelect={() => {
                            updateFacility(index, "isChecked", !facility.isChecked)
                        }}
                    />

                </td>
            </tr>
        ));

    };

    const handleAllCheck = (e) => {
        let list = [...faclitiesList];
        setAllChecked(e.target.checked);
        list = list.map((ele) => ({
            ...ele,
            isChecked: e.target.checked
        }));
        setFacilitiesList(list);
    };

    const updateRateWiseFacility = (currentRate, newRate) => {
        const rateWiseData = {...rateWiseFacility};
        rateWiseData[currentRate].newRate = newRate;
        setRateWiseFacility(rateWiseData);
    }

    const getRatesData = () => {
        return Object.keys(rateWiseFacility).map((rate) => {
            const rateWiseFacilityElement = rateWiseFacility[rate];
            const facilityCount = rateWiseFacilityElement.facilities.length;
            return (<tr>
                <td className="p-1">
                    <RadioItem
                        text={rate}
                        checked={true}
                        onSelect={() => {
                        }}
                        showText={false}
                    />
                </td>
                <td className="p-1">{facilityCount}</td>
                <td className="p-1">{rate}</td>
                <td className="p-1"><input type="number" style={{width: "60px"}} size="4"
                                           value={rateWiseFacilityElement.newRate}
                                           onChange={(evt) => updateRateWiseFacility(parseInt(rate), evt.target.value)}/>
                </td>
            </tr>);
        });
    };

    const onSubmitBtnClick = () => {
        let facilityData = [...faclitiesList];
        for (let rate in rateWiseFacility) {
            const data = rateWiseFacility[rate];
            data.facilities.forEach(facilityIndex => {
                facilityData[facilityIndex].rate = data.newRate;
            })
        }
        facilityData = facilityData.map(fac => ({...fac, isChecked: false}));
        setFacilitiesList(facilityData);
        setRateWiseFacility({});
        setAllChecked(false);
    };

    return (
        <div className={`row ${styles['container']}`}>
            <div className="col-sm-3">
                <FacilityFilterTab
                    programs={programs}
                    setSelectedProgram={setSelectedProgram}
                    states={states}
                    setSelectedState={setSelectedState}
                    selectedState={selectedState}
                    districtList={districtList}
                    selectedDistrict={selectedDistrict}
                    setSelectedDistrict={setSelectedDistrict}
                    facilityType={facilityType}
                    setFacilityType={setFacilityType}
                >
                    <div>
                        <span className={"filter-header"}>Last Adjusted on</span>
                        <div className="m-3">
                            <RadioItem
                                text={"Week"}
                                checked={lastAdjustedOn === "Week"}
                                onSelect={(event) =>
                                    handleChange(
                                        event.target.name,
                                        setLastAdjustedOn
                                    )
                                }
                            />
                            <RadioItem
                                text={"Month"}
                                checked={lastAdjustedOn === "Month"}
                                onSelect={(event) =>
                                    handleChange(
                                        event.target.name,
                                        setLastAdjustedOn
                                    )
                                }
                            />
                        </div>
                        <div>
                            <span className={"filter-header"}>Please select date range</span>
                            <div className="m-3">
                                <input className={styles["custom-date-range"]} type="date"/>
                            </div>
                        </div>
                    </div>
                </FacilityFilterTab>
            </div>
            <div className={`col-sm-6 container ${styles['table']}`}>
                <p className={styles['highlight']}>{selectedDistrict} facilties</p>
                <table className={`table table-hover ${styles['table-data']}`}>
                    <thead>
                    <tr>
                        <th>CENTRE ID</th>
                        <th>CENTRE NAME</th>
                        <th>VACCINATION STATIONS</th>
                        <th>CERTIFIED VACCINATORS</th>
                        <th>CURRENT RATE</th>
                        <th>LAST ADJUSTED</th>
                        <th>
                            <CheckboxItem
                                text={"checkAll"}
                                checked={allChecked}
                                onSelect={(e) => {
                                    handleAllCheck(e)
                                }}
                                showText={false}
                            />


                        </th>
                    </tr>
                    </thead>
                    <tbody>{selectedDistrict && selectedState ? getFacilityList() : ''}</tbody>
                </table>
            </div>
            <div className="col-sm-3 container">
                <div className={styles['highlight']}>Set Rate</div>
                {Object.keys(rateWiseFacility).length > 0 && <div>
                    <div
                        className={`overflow-auto text-center table-responsive  ${styles["highlight"]} ${styles["district-table"]}`}>
                        <table className="table table-borderless table-hover">
                            <thead>
                            <tr>
                                <td className="p-1"/>
                                <td className="p-1">No. Of Facilities</td>
                                <td className="p-1">Current Rate</td>
                                <td className="p-1">Set New Rate</td>
                            </tr>
                            </thead>
                            <tbody>{getRatesData()}</tbody>
                        </table>

                    </div>
                    <div className="d-flex justify-content-center">
                        <button className={`${styles['button']} p-2 pl-3 pr-3`} onClick={() => onSubmitBtnClick()}>SET
                            RATES
                        </button>
                    </div>
                    {submit ? <div>All rates set successfully</div> : ''}
                </div>}
            </div>
        </div>
    );
}

export default FacilityAdjustingRate;
import React, {useEffect, useState} from "react";
import styles from "./FacilityAdjustingRate.module.css";
import {CheckboxItem, FacilityFilterTab, RadioItem} from "../FacilityFilterTab";
import {API_URL, CONSTANTS, FACILITY_TYPE} from "../../utils/constants";
import {useAxios} from "../../utils/useAxios";
import {formatDate} from "../../utils/dateutil";
import DetailsCard from "../DetailsCard/DetailsCard";
import FacilityActivation from "../FacilityActivation/FacilityActivation";


function FacilityAdjustingRate({
                                   facilities, setFacilities, selectedState, onStateSelected, districtList, selectedDistrict,
                                   setSelectedDistrict, stateList, programs, selectedProgram, setSelectedProgram, facilityType, setFacilityType,
                                   status, fetchFacilities, lastAdjustedOn, setLastAdjustedOn, resetFilter, updateFacilityProgramStatus, countryName, isLoading
                               }) {

    const [rateWiseFacilities, setRateWiseFacilities] = useState({});
    const [allChecked, setAllChecked] = useState(false);
    const axiosInstance = useAxios('');
    const [showCard, setShowCard] = useState(false);
    const [selectedRow, setSelectedRow] = useState([]);

    useEffect(() => {
        resetFilter({lastAdjustedOn: CONSTANTS.WEEK})
    }, []);

    useEffect(() => {
        groupFacilityByRate();
    }, [facilities]);


    const handleChange = (value, setValue) => {
        setValue(value);
    };

    const updateFacility = (index, key, value) => {
        const facilityData = [...facilities];
        facilityData[index][key] = value;
        setFacilities(facilityData);

    };

    const getFacilityProgram = (facility) => {
        if ("programs" in facility) {
            const program = facility.programs.find(obj => obj.programId === selectedProgram);
            if (program) {
                return program;
            }
        }
        return {rate: 0};
    };

    const getFacilityList = () => {
        return facilities.map((facility, index) => {
            let rateUpdatedAt = getFacilityProgram(facility).rateUpdatedAt;
            return <tr>
                <td>{facility['facilityCode']}</td>
                <td role="button" onClick={() => {
                    setShowCard(!showCard);
                    setSelectedRow(facility)
                }}>{facility['facilityName']}</td>
                <td>{FACILITY_TYPE[facility['category']]}</td>
                <td>{getFacilityProgram(facility).rate || '-'}</td>
                <td>{rateUpdatedAt ? formatDate(rateUpdatedAt) : 'DD/MMM/YYYY'}</td>
                <td style={{"textAlign":"right"}}>
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
        });

    };

    const handleAllCheck = (e) => {
        let list = [...facilities];
        setAllChecked(e.target.checked);
        list = list.map((ele) => ({
            ...ele,
            isChecked: e.target.checked
        }));
        setFacilities(list);
    };


    const updateRateWiseFacility = (currentRate, newRate) => {
        const rateWiseData = {...rateWiseFacilities};
        rateWiseData[currentRate].newRate = newRate;
        setRateWiseFacilities(rateWiseData);
    };
    const groupFacilityByRate = () => {
        const selectedFacilities = facilities.filter(facility => facility.isChecked);
        const rateWiseData = {};
        selectedFacilities.forEach(facility => {
            const facilityProgram = getFacilityProgram(facility);
            if ("rate" in facilityProgram && facilityProgram.rate in rateWiseData) {
                rateWiseData[facilityProgram.rate].count++;
                rateWiseData[facilityProgram.rate].facilityIds.push(facility.osid);
            } else {
                rateWiseData[facilityProgram.rate || 0] = {
                    count: 1,
                    facilityIds: [facility.osid],
                    newRate: facilityProgram.rate
                }
            }

        });
        setRateWiseFacilities(rateWiseData)
    };

    const getRatesData = () => {
        return Object.keys(rateWiseFacilities).map((rate) => {
            const rateWiseFacilityElement = rateWiseFacilities[rate];
            const facilityCount = rateWiseFacilityElement.count;
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
                                           onChange={(evt) => updateRateWiseFacility(parseInt(rate), parseInt(evt.target.value))}/>
                </td>
            </tr>);
        });
    };

    const onSubmitBtnClick = () => {
        setAllChecked(false);
        if (selectedProgram && Object.keys(rateWiseFacilities).length > 0) {
            let updateFacilities = [];
            Object.keys(rateWiseFacilities).forEach((rate) => {
                const facilityIds = rateWiseFacilities[rate].facilityIds;
                facilityIds.forEach((facilityId) => {
                    let programs = [{
                        id: selectedProgram,
                        rate: rateWiseFacilities[rate].newRate
                    }];
                    updateFacilities.push({osid: facilityId, programs})
                });


            });
            axiosInstance.current.put(API_URL.FACILITY_API, updateFacilities)
                .then(res => {
                    //registry update in ES happening async, so calling search immediately will not get back actual data
                    setTimeout(() => fetchFacilities(), 2000)
                });
        }
    };


    return (
        <div className={`row ${styles['container']}`}>
            {!showCard && 
                <div className="col-sm-3">
                    <FacilityFilterTab
                        countryName={countryName}
                        programs={programs}
                        selectedProgram={selectedProgram}
                        setSelectedProgram={setSelectedProgram}
                        states={stateList}
                        setSelectedState={onStateSelected}
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
                                    text={CONSTANTS.WEEK}
                                    checked={lastAdjustedOn === CONSTANTS.WEEK}
                                    onSelect={(event) =>
                                        handleChange(
                                            event.target.name,
                                            setLastAdjustedOn
                                        )
                                    }
                                />
                                <RadioItem
                                    text={CONSTANTS.MONTH}
                                    checked={lastAdjustedOn === CONSTANTS.MONTH}
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
                                    <input className={styles["custom-date-range"]} type="date" onChange={(event) =>
                                        handleChange(
                                            event.target.value,
                                            setLastAdjustedOn
                                        )}/>
                                </div>
                            </div>
                        </div>
                    </FacilityFilterTab>
                </div>
            }
            {!showCard && 
                <div className={`col-sm-6 ${styles['facility-grid-container']} ${styles['table']}`}>
                    {isLoading ?
                        <div className='d-flex justify-content-center'>Please wait</div>
                        :
                        <>
                            <p className={styles['highlight']}>
                                {facilities.length === 0 ? "" : facilities.length} Facilit{facilities.length === 1 ? "y" : "ies"}
                            </p>
                            <table className={`table table-hover ${styles['table-data']}`}>
                                <thead>
                                <tr>
                                    <th>CODE</th>
                                    <th>NAME</th>
                                    <th>TYPE</th>
                                    <th>PROGRAM RATE</th>
                                    <th>LAST ADJUSTED</th>
                                    <th style={{"textAlign":"right"}}>
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
                                <tbody>{getFacilityList()}</tbody>
                            </table>
                        </>
                    }
                </div>
            }
            <DetailsCard
                showCard={showCard}
                setShowCard={setShowCard}
                facility={selectedRow}
                fetchFacilities={fetchFacilities}
                status={status}
                updateFacilityProgramStatus={updateFacilityProgramStatus}
            />
            {!showCard && 
                <div className="col-sm-3 pad-1rem">
                    <div className={styles['highlight']}>Set Daily Rate</div>
                    {(selectedProgram && Object.keys(rateWiseFacilities).length > 0)? <div>
                        <div
                            className={`overflow-auto text-center table-responsive  ${styles["highlight"]} ${styles["set-rate-table"]}`}>
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
                        {/*{submit ? <div>All rates set successfully</div> : ''}*/}
                    </div>
                    :<p>Please select one or more facilities to set daily vaccination rate</p>}
                </div>
            }
        </div>
    );
}

export default FacilityAdjustingRate;

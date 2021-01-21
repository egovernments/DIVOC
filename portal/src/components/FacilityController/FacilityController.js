import React, {useEffect, useState} from "react";
import {TabPanels} from "../TabPanel/TabPanel";
import FacilityActivation from "../FacilityActivation/FacilityActivation";
import FacilityAdjustingRate from "../FacilityAdjustingRate/FacilityAdjustingRate";
import FacilityDetails from "../FacilityDetails/FacilityDetails";
import {useAxios} from "../../utils/useAxios";
import state_and_districts from '../../utils/state_and_districts.json';
import {equals, reject} from "ramda";
import {API_URL, CONSTANTS} from "../../utils/constants";

function FacilityController() {
    const PROGRAMS = ["C-19 Program"];
    const axiosInstance = useAxios('');
    const [facilities, setFacilities] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [selectedState, setSelectedState] = useState("All");
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedProgram, setSelectedProgram] = useState("");
    const [facilityType, setFacilityType] = useState("GOVT");
    const [status, setStatus] = useState("");
    const stateList = [{value: "ALL", label: "ALL"}].concat(Object.values(state_and_districts['states']).map(obj => ({value: obj.name, label: obj.name})));
    const [lastAdjustedOn, setLastAdjustedOn] = useState("");

    useEffect(() => {
        fetchPrograms();
    }, []);

    useEffect(() => {
        fetchFacilities();
    }, [selectedProgram, selectedState, selectedDistrict, facilityType, status, lastAdjustedOn]);

    function fetchFacilities() {
        let rateUpdatedFrom = "", rateUpdatedTo = "";
        if (lastAdjustedOn !== "") {
            let fromDate = new Date();
            let toDate = new Date();
            if(lastAdjustedOn === CONSTANTS.WEEK) {
                fromDate.setDate(fromDate.getDate() - 7);
                rateUpdatedFrom =  fromDate.toISOString().substr(0,10);
                rateUpdatedTo = toDate.toISOString().substr(0,10);
            } else if (lastAdjustedOn === CONSTANTS.MONTH) {
                fromDate.setDate(fromDate.getDate() - 30);
                rateUpdatedFrom =  fromDate.toISOString().substr(0,10);
                rateUpdatedTo = toDate.toISOString().substr(0,10);
            } else {
                rateUpdatedFrom = rateUpdatedTo = lastAdjustedOn;
            }
        }
        let params = {
            programId: selectedProgram,
            state: selectedState,
            district: selectedDistrict.replaceAll(" ", ",").replaceAll("(", "").replaceAll(")", ""),
            programStatus: status,
            type: facilityType,
            rateUpdatedTo,
            rateUpdatedFrom
        };
        params = reject(equals(''))(params);
        const queryParams = new URLSearchParams(params);
        axiosInstance.current.get(API_URL.FACILITY_API, {params: queryParams})
            .then(res => {
                res.data.forEach(item => {
                    Object.assign(item, {isChecked: false});
                    if (!("programs" in item)) {
                        Object.assign(item, {programs: []});
                    }
                });
                setFacilities(res.data)
            });
    }

    function fetchPrograms() {
        axiosInstance.current.get(API_URL.PROGRAM_API)
            .then(res => {
                const programs = res.data.map(obj => ({value: obj.name, label: obj.name}));
                setPrograms(programs)
                if(programs.length > 0) {
                    setSelectedProgram(programs[0].value)
                }
            });
    }

    function onStateSelected(stateSelected) {
        setSelectedState(stateSelected);
        const stateObj = Object.values(state_and_districts['states']).find(obj => obj.name === stateSelected);
        if(stateObj) {
            setDistricts(stateObj.districts)
        } else {
            setDistricts([])
        }
    }


    return (
        <TabPanels
            tabs={[
                {
                    title: "Facility Activation",
                    component: (
                        <FacilityActivation
                            stateList={stateList}
                            onStateSelected={onStateSelected}
                            districtList={districts}
                            selectedDistrict={selectedDistrict}
                            selectedState={selectedState}
                            setSelectedDistrict={setSelectedDistrict}
                            programs={programs}
                            facilities={facilities}
                            setFacilities={setFacilities}
                            selectedProgram={selectedProgram}
                            setSelectedProgram={setSelectedProgram}
                            facilityType={facilityType}
                            setFacilityType={setFacilityType}
                            status={status}
                            setStatus={setStatus}
                            fetchFacilities={fetchFacilities}
                        />
                    ),
                },
                {
                    title: "Adjusting Rate",
                    component: (
                        <FacilityAdjustingRate
                            stateList={stateList}
                            onStateSelected={onStateSelected}
                            districtList={districts}
                            selectedDistrict={selectedDistrict}
                            selectedState={selectedState}
                            setSelectedDistrict={setSelectedDistrict}
                            programs={programs}
                            facilities={facilities}
                            setFacilities={setFacilities}
                            selectedProgram={selectedProgram}
                            setSelectedProgram={setSelectedProgram}
                            facilityType={facilityType}
                            setFacilityType={setFacilityType}
                            setStatus={setStatus}
                            fetchFacilities={fetchFacilities}
                            lastAdjustedOn={lastAdjustedOn}
                            setLastAdjustedOn={setLastAdjustedOn}
                        />
                    ),
                },
                {
                    title: "All Facilities",
                    component: (
                        <FacilityDetails
                            stateList={stateList}
                            onStateSelected={onStateSelected}
                            districtList={districts}
                            selectedDistrict={selectedDistrict}
                            selectedState={selectedState}
                            setSelectedDistrict={setSelectedDistrict}
                            programs={programs}
                            facilities={facilities}
                            setFacilities={setFacilities}
                            selectedProgram={selectedProgram}
                            setSelectedProgram={setSelectedProgram}
                            facilityType={facilityType}
                            setFacilityType={setFacilityType}
                            status={status}
                            setStatus={setStatus}
                            fetchFacilities={fetchFacilities}
                        />
                    ),
                },
            ]}
        />
    );
}

export default FacilityController;
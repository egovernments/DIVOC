import React, {useEffect, useState} from "react";
import {TabPanels} from "../TabPanel/TabPanel";
import FacilityActivation from "../FacilityActivation/FacilityActivation";
import FacilityAdjustingRate from "../FacilityAdjustingRate/FacilityAdjustingRate";
import FacilityDetails from "../FacilityDetails/FacilityDetails";
import {useAxios} from "../../utils/useAxios";
import {equals, find, flatten, propEq, reject} from "ramda";
import {API_URL, CONSTANTS} from "../../utils/constants";
import {useSelector} from "react-redux";

const defaultState = {
    selectedProgram: "",
    selectedState: CONSTANTS.ALL,
    selectedDistrict: [],
    facilityType: CONSTANTS.GOVT,
    status: CONSTANTS.ACTIVE,
    lastAdjustedOn: ""
};

function FacilityController() {
    const axiosInstance = useAxios('');
    const [facilities, setFacilities] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [districts, setDistricts] = useState([]);
    const countryName = useSelector(state => state.flagr.appConfig.countryName);
    const state_and_districts = useSelector(state => state.flagr.appConfig.stateAndDistricts);
    const stateList = [{
        value: CONSTANTS.ALL,
        label: CONSTANTS.ALL
    }].concat(Object.values(state_and_districts['states']).map(obj => ({value: obj.name, label: obj.name})));

    const [filter, setFilter] = useState(defaultState);

    useEffect(() => {
        fetchPrograms();
    }, []);

    useEffect(() => {
        fetchFacilities();
    }, [filter]);

    function resetFilter(state = {}) {
        if (programs.length > 0) {
            state.selectedProgram = programs[0].value;
        }
        setFilter({...defaultState, ...state});
        setFacilities([]);
        setDistricts([]);
    }

    function setSelectedState(value) {
        setFilter({
            ...filter,
            selectedState: value,
            selectedDistrict: []
        })
    }

    function setSelectedDistrict(value) {
        setFilter({
            ...filter,
            selectedDistrict: value
        })
    }

    function setSelectedProgram(value) {
        setFilter({
            ...filter,
            selectedProgram: value
        })

    }

    function setFacilityType(value) {
        setFilter({
            ...filter,
            facilityType: value
        })

    }

    function setStatus(value) {
        setFilter({
            ...filter,
            status: value
        })

    }

    function setLastAdjustedOn(value) {
        setFilter({
            ...filter,
            lastAdjustedOn: value
        })

    }

    function updateFacilityProgramStatus(facilities, newStatus) {
        if (selectedProgram && facilities.length > 0) {
            let updateFacilities = [];
            facilities.forEach(facility => {
                let programs = [{
                    id: selectedProgram,
                    status: newStatus
                }];
                updateFacilities.push({osid: facility.osid, programs})
            });
            axiosInstance.current
                .put(API_URL.FACILITY_API, updateFacilities)
                .then((res) => {
                    //registry update in ES happening async, so calling search immediately will not get back actual data
                    setTimeout(() => fetchFacilities(), 500);
                });
        }
    }

    function fetchFacilities() {
        const {lastAdjustedOn, selectedProgram, selectedState, selectedDistrict, status, facilityType} = filter;
        if (selectedProgram) {
            let rateUpdatedFrom = "", rateUpdatedTo = "";
            if (lastAdjustedOn !== "") {
                let fromDate = new Date();
                let toDate = new Date();
                if (lastAdjustedOn === CONSTANTS.WEEK) {
                    fromDate.setDate(fromDate.getDate() - 7);
                    rateUpdatedFrom = fromDate;
                    rateUpdatedTo = toDate;
                } else if (lastAdjustedOn === CONSTANTS.MONTH) {
                    fromDate.setDate(fromDate.getDate() - 30);
                    rateUpdatedFrom = fromDate;
                    rateUpdatedTo = toDate;
                } else {
                    rateUpdatedFrom = rateUpdatedTo = lastAdjustedOn;
                }
            }
            let params = {
                // programId: selectedProgram,
                // state: selectedState,
                // district: selectedDistrict.map(d => d.replaceAll(" ", ",").replaceAll("(", "").replaceAll(")", "")),
                // programStatus: status,
                // type: facilityType,
                // rateUpdatedTo,
                // rateUpdatedFrom,
                limit: 10000,
                offset: 0
            };
            params = reject(equals(''))(params);
            const queryParams = new URLSearchParams(params);
            axiosInstance.current.get(API_URL.FACILITY_API, {params: queryParams})
                .then(res => {
                    let matchedFacilities = [];
                    res.data.forEach(item => {
                        Object.assign(item, {isChecked: false});
                        if (!("programs" in item)) {
                            Object.assign(item, {programs: []});
                        }
                        let isFiltersMatched = true;
                        [
                            {
                                data: [item],
                                filterKey: "category",
                                filterValue: [facilityType],
                                toBePartiallyChecked: false
                            },
                            {
                                data: [item.address],
                                filterKey: "state",
                                filterValue: [selectedState],
                                toBePartiallyChecked: false
                            },
                            {
                                data: [item.address],
                                filterKey: "district",
                                filterValue: flatten(selectedDistrict.map(d => d.replaceAll(" ", ",").replaceAll("(", "").replaceAll(")", "").split(","))),
                                toBePartiallyChecked: true
                            }
                        ].forEach(({data, filterKey, filterValue, toBePartiallyChecked}) => {
                            let matchedCount = 0;
                            filterValue.forEach(value => {
                                if (value === "All" || findBy(data, filterKey, value)) {
                                    matchedCount++;
                                }
                            });
                            if (toBePartiallyChecked) {
                                if (matchedCount === 0 && filterValue.length !== 0) {
                                    isFiltersMatched = false
                                }
                            } else {
                                if (matchedCount !== filterValue.length) {
                                    isFiltersMatched = false
                                }
                            }
                        });

                        if(status === CONSTANTS.ACTIVE) {
                            const program = item["programs"].find(program => program.programId === selectedProgram)
                            isFiltersMatched = !!(program && program.status === CONSTANTS.ACTIVE && isFiltersMatched);
                        }
                        if(status === CONSTANTS.IN_ACTIVE) {
                            const program = item["programs"].find(program => program.programId === selectedProgram)
                            if (program && program.status === CONSTANTS.IN_ACTIVE) {
                                isFiltersMatched = true
                            } else {
                                isFiltersMatched = !program && isFiltersMatched;
                            }
                        }

                        if(rateUpdatedFrom !== ""  && rateUpdatedTo !== "" && isFiltersMatched) {
                            const program = findBy(item["programs"], "programId", selectedProgram)
                            if (!(new Date(program.rateUpdatedAt) >= rateUpdatedFrom && new Date(program.rateUpdatedAt) <= rateUpdatedTo)) {
                                isFiltersMatched = false
                            }
                        }
                        if (isFiltersMatched) {
                            matchedFacilities.push(item)
                        }
                    });
                    setFacilities(matchedFacilities)
                });
        }
    }

    function findBy(items, key, value) {
        return find(propEq(key, value))(items);
    }


    function fetchPrograms() {
        axiosInstance.current.get(API_URL.PROGRAM_API)
            .then(res => {
                const programs = res.data.map(obj => ({value: obj.name, label: obj.name}));
                setPrograms(programs);
                if (programs.length > 0) {
                    setSelectedProgram(programs[0].value)
                }
            });
    }

    function onStateSelected(stateSelected) {
        setSelectedState(stateSelected);
        const stateObj = Object.values(state_and_districts['states']).find(obj => obj.name === stateSelected);
        if (stateObj) {
            setDistricts(stateObj.districts)
        } else {
            setDistricts([])
        }
    }

    const {lastAdjustedOn, selectedProgram, selectedState, selectedDistrict, status, facilityType} = filter;
    return (
        <TabPanels
            tabs={[
                {
                    title: "Facility Activation",
                    component: (
                        <FacilityActivation
                            countryName={countryName}
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
                            resetFilter={resetFilter}
                            updateFacilityProgramStatus={updateFacilityProgramStatus}
                        />
                    ),
                },
                {
                    title: "Adjusting Rate",
                    component: (
                        <FacilityAdjustingRate
                            countryName={countryName}
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
                            fetchFacilities={fetchFacilities}
                            lastAdjustedOn={lastAdjustedOn}
                            setLastAdjustedOn={setLastAdjustedOn}
                            resetFilter={resetFilter}
                            updateFacilityProgramStatus={updateFacilityProgramStatus}
                        />
                    ),
                },
                {
                    title: "All Facilities",
                    component: (
                        <FacilityDetails
                            countryName={countryName}
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
                            resetFilter={resetFilter}
                            updateFacilityProgramStatus={updateFacilityProgramStatus}
                        />
                    ),
                },
            ]}
        />
    );
}

export default FacilityController;

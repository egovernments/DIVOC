import React, {useEffect, useState} from "react";
import styles from "./FacilityActivation.module.css";
import {CheckboxItem, FacilityFilterTab, RadioItem} from "../FacilityFilterTab";

function FacilityActivation({districtList, stateList, program}) {
    const [programs, setPrograms] = useState(program);
    const [selectedProgram, setSelectedProgram] = useState("");
    const [states, setStates] = useState([]);
    const [selectedState, setSelectedState] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState();
    const [facilityType, setFacilityType] = useState("Government");

    const [listOfStates, setListOfStates] = useState([]);
    const [status, setStatus] = useState("Inactive");
    const [allChecked, setAllChecked] = useState(false)
    const [rowCount, setRowCount] = useState(0);
    const [faclitiesList, setFacilitiesList] = useState([
        {id: 1, name: "Centre 1", stations: 100, vaccinators: 100, status: 'Inactive', isChecked: false},
        {id: 2, name: "Centre 2", stations: 100, vaccinators: 100, status: 'Inactive', isChecked: false},
        {id: 3, name: "Centre 3", stations: 100, vaccinators: 100, status: 'Inactive', isChecked: false},
        {id: 4, name: "Centre 4", stations: 100, vaccinators: 100, status: 'Inactive', isChecked: false},
        {id: 5, name: "Centre 5", stations: 100, vaccinators: 100, status: 'Inactive', isChecked: false},
    ]);

    const [inactiveFacilities, setInactiveFacilities] = useState([]);

    useEffect(() => {
        normalize();
    }, []);

    useEffect(() => {
        const selectedFacilitiesIdx = faclitiesList.map((fac, index) => ({
            ...fac,
            index
        })).filter(facility => facility.isChecked && facility.status === "Inactive").map(fac => fac.index);
        setInactiveFacilities(selectedFacilitiesIdx);
    }, [faclitiesList]);

    const normalize = () => {
        const statesList = Object.keys(stateList).map((state) => ({value: state, label: stateList[state]}));
        setStates(statesList);
    };

    const handleChange = (value, setValue) => {
        setValue(value);
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

    const updateFacility = (index, key, value) => {
        const facilityData = [...faclitiesList];
        facilityData[index][key] = value;
        setFacilitiesList(facilityData);
    };

    const getFacilityList = () => {
        return faclitiesList.filter(fac => fac.status === status).map((facility, index) => (
            <tr>
                <td>{facility['id']}</td>
                <td>{facility['name']}</td>
                <td>{facility['stations']}</td>
                <td>{facility['vaccinators']}</td>
                <td>{facility['status']}</td>
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

    const handleActiveClick = () => {
        let facilityData = [...faclitiesList];
        facilityData = facilityData.map((facility, idx) => {
            if(inactiveFacilities.includes(idx)) {
                facility.status = "Active";
            }
            facility.isChecked = false;
            return facility;
        });
        setFacilitiesList(facilityData);
        setAllChecked(false);
        setInactiveFacilities([]);
    };

    return (
        <div className={`row ${styles["container"]}`}>
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
                        <span className={"filter-header"}>Status</span>
                        <div className="m-3">
                            <RadioItem
                                text={"Active"}
                                checked={status === "Active"}
                                onSelect={(event) =>
                                    handleChange(event.target.name, setStatus)
                                }
                            />
                            <RadioItem
                                text={"Inactive"}
                                checked={status === "Inactive"}
                                onSelect={(event) =>
                                    handleChange(event.target.name, setStatus)
                                }
                            />
                        </div>

                    </div>
                </FacilityFilterTab>
            </div>

            <div className={`col-sm-7 container ${styles["table"]}`}>
                <p className={styles["highlight"]}>
                    {selectedDistrict} facilties
                </p>
                <table className={`table table-hover ${styles["table-data"]}`}>
                    <thead>
                    <tr>
                        <th>CENTRE ID</th>
                        <th>CENTRE NAME</th>
                        <th>VACCINATION STATIONS</th>
                        <th>CERTIFIED VACCINATORS</th>
                        <th>C19 program STATUS</th>
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
                    <tbody>{selectedState && selectedDistrict ? getFacilityList() : ''}</tbody>

                </table>
            </div>
            <div className="col-sm-2 container">
                <div className={`card ${styles["card-continer"]}`}>
                    <div className="card-body text-center">
                        {/*{faclitiesList.length > 0 ? '' : <p>Success</p>}*/}
                        <p>
                            Make {inactiveFacilities.length} facilities active for the {selectedProgram}
                        </p>
                        <button
                            onClick={handleActiveClick}
                            className={styles["button"]}
                        >
                            MAKE ACTIVE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FacilityActivation;
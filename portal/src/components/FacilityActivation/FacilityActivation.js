import React, {useEffect, useState} from "react";
import styles from "./FacilityActivation.module.css";
import {CheckboxItem, FacilityFilterTab, RadioItem} from "../FacilityFilterTab";
import {useAxios} from "../../utils/useAxios";
import {API_URL} from "../../utils/constants";

function FacilityActivation({
                                facilities, setFacilities, selectedState, onStateSelected, districtList, selectedDistrict,
                                setSelectedDistrict, stateList, programs, selectedProgram, setSelectedProgram, facilityType, setFacilityType,
                                status, setStatus, fetchFacilities
                            }) {

    const [allChecked, setAllChecked] = useState(false);
    const axiosInstance = useAxios('');
    useEffect(() => {
        setStatus("Inactive")
    }, []);
    const handleChange = (value, setValue) => {
        setValue(value);
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

    const updateFacility = (index, key, value) => {
        const facilityData = [...facilities];
        facilityData[index][key] = value;
        setFacilities(facilityData);
    };

    const getFacilityStatusForProgram = (facility) => {
        if ("programs" in facility) {
            const program = facility.programs.find(obj => obj.id === selectedProgram);
            if (program) {
                return program.status;
            }
        }
        return "Inactive";
    };

    const getFacilityList = () => {
        return facilities.map((facility, index) => (
            <tr>
                <td>{facility['facilityCode']}</td>
                <td>{facility['facilityName']}</td>
                <td>{facility['category']}</td>
                <td>{getFacilityStatusForProgram(facility)}</td>
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
    const selectedFacilities = facilities.filter(facility => facility.isChecked);

    const handleActiveClick = () => {
        setAllChecked(false);
        if (selectedProgram && selectedFacilities.length > 0) {
            let updateFacilities = [];
            selectedFacilities.forEach(facility => {
                let programs = [];
                const program = facility.programs.find(program => program.id === selectedProgram);
                if (program) {
                    programs = facility.programs.map(program => {
                        if (program.id === selectedProgram) {
                            return {...program, status: status !== "Active" ? "ACTIVE" : "INACTIVE", statusUpdatedAt: new Date().toISOString()};
                        } else {
                            return program;
                        }
                    })
                } else {
                    programs = facility.programs.concat({
                        id: selectedProgram,
                        status: status !== "Active" ? "ACTIVE" : "INACTIVE",
                        rate: 0,
                        statusUpdatedAt: new Date().toISOString()
                    })
                }
                updateFacilities.push({osid: facility.osid, programs})
            });
            axiosInstance.current.put(API_URL.FACILITY_API, updateFacilities)
                .then(res => {
                    //registry update in ES happening async, so calling search immediately will not get back actual data
                    setTimeout(() => fetchFacilities(), 1000)
                });
        }
    };


    return (
        <div className={`row ${styles["container"]}`}>
            <div className="col-sm-3">
                <FacilityFilterTab
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
                        <th>CODE</th>
                        <th>NAME</th>
                        <th>TYPE</th>
                        <th>PROGRAM STATUS</th>
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
                    <tbody>{getFacilityList()}</tbody>

                </table>
            </div>
            <div className="col-sm-2 container">
                <div className={`card ${styles["card-continer"]}`}>
                    <div className="card-body text-center">
                        {/*{facilities.length > 0 ? '' : <p>Success</p>}*/}
                        <p>
                            Make {selectedFacilities.length} facilities active for the {selectedProgram}
                        </p>
                        <button
                            onClick={handleActiveClick}
                            className={styles["button"]}
                        >
                            MAKE {status !== "Active" ? "ACTIVE" : "INACTIVE"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FacilityActivation;
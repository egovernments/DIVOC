import React, { useState, useEffect } from "react";
import DropDown from "../DropDown/DropDown";
import styles from "./FacilityActivation.module.css";

function FacilityActivation({ districtList,stateList,program }) {
    const [listOfStates, setListOfStates] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState();
    const [selectedState, setSelectedState] = useState();
    const [selectedDistrict, setSelectedDistrict] = useState();
    const [facilityType, setFacilityType] = useState("Government");
    const [status, setStatus] = useState("Active");
    const [allChecked, setAllChecked] = useState(false)
    const [rowCount, setRowCount] = useState(0);
    const [faclitiesList, setFacilitiesList] = useState([
        { id: 1, name: "Centre 1",stations: 100,vaccinators: 100,status: 'Inactive',isChecked:false},
        { id: 2, name: "Centre 2",stations: 100,vaccinators: 100,status: 'Inactive',isChecked:false},
        { id: 3, name: "Centre 3",stations: 100,vaccinators: 100,status: 'Inactive',isChecked:false},
        { id: 4 ,name:"Centre 4",stations: 100,vaccinators: 100,status: 'Inactive',isChecked:false},
        { id: 5 ,name:"Centre 5",stations: 100,vaccinators: 100,status: 'Inactive',isChecked:false},
    ]);

    useEffect(() => {
        normalizeStateNames();
    }, []);

    const normalizeStateNames = () => {
        let data = [];
        Object.keys(stateList).map((state) => {
            let newData = {};
            newData.value = state;
            newData.label = stateList[state];
            data.push(newData);
        });
        setListOfStates(data);
    };

    const handleChange = (value, setValue) => {
        setValue(value);
    };

    const showDistrictList = () => {
        return Object.keys(districtList).map((district) => {
            return (
                <tr>
                    <td className={styles["highlight"]}>
                        <div className="form-check">
                            <label
                                className="form-check-label"
                                htmlFor={district}
                            >
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={district}
                                    name={district}
                                    value={district}
                                    onChange={(event) =>
                                        handleChange(
                                            district,
                                            setSelectedDistrict
                                        )
                                    }
                                    checked={
                                        selectedDistrict &&
                                        district === selectedDistrict
                                    }
                                />
                                <div
                                    className={styles["wrapper"]}
                                    style={{
                                        backgroundColor:
                                            selectedDistrict === district
                                                ? "#DE9D00"
                                                : "",
                                    }}
                                >
                                    &nbsp;
                                </div>
                                {district}
                            </label>
                        </div>
                    </td>
                    <td>{districtList[district]}</td>
                </tr>
            );
        });
    };

    const handleAllcheck = (e) => {
        let list =  faclitiesList;
        let rowCount = 0;
        if(e.target.value === "checkAll"){
            list.forEach(faciltiy => {
                faciltiy.isChecked = e.target.checked;
                rowCount = rowCount + 1;
            });
        setAllChecked(e.target.checked)
        setFacilitiesList(list);
        setRowCount(rowCount);
        }
    }

    const getFaciltiyList = () => {
        let tableRow = [];
        let tableCells;
        
        faclitiesList.forEach(facility => {
            console.log("data", facility)
            tableCells = []
            tableCells.push(<tr>
                <td>{facility['id']}</td>
                <td>{facility['name']}</td>
                <td>{facility['stations']}</td>
                <td>{facility['vaccinators']}</td>
                <td>{facility['status']}</td>
                <td>
                <div className="form-check">
                        <label
                            className={`${"form-check-label"} ${
                                styles["highlight"]
                            }`}
                            htmlFor={facility['id']}
                        >
                           <input
                        type="checkbox"
                        className="form-check-input"
                        id={facility['id']}
                    />
                    <div
                        className={styles["wrapper"]}
                        style={{
                            backgroundColor:
                            facility['isChecked']
                                    ? "#DE9D00"
                                    : "",
                        }}
                    >
                        &nbsp;
                    </div>
                        </label>
                    </div>
                    
                </td>
            </tr>)
            tableRow.push(tableCells)
        })
        return tableRow;

    }

    const handleClick = () => {
        setFacilitiesList([]);
        setAllChecked(false);
        setRowCount(0);
    };

    return (
        <div className={`row ${styles["container"]}`}>
            <div className="col-sm-3">
                <div>
                    <DropDown
                        options={program}
                        placeholder="Select Program"
                        setSelectedOption={setSelectedProgram}
                    />
                </div>
                <div>
                    <p className={styles["highlight"]}>All of India</p>
                    <DropDown
                        options={listOfStates}
                        placeholder="Please select State"
                        setSelectedOption={setSelectedState}
                    />
                </div>
                <p className={styles["highlight"]}>{selectedState}</p>
                <div className={`table-responsive ${styles["district-table"]}`}>
                    <table className="table table-borderless table-hover">
                        <thead>
                            <tr>Please select District</tr>
                        </thead>
                        <tbody className={styles["tbody"]}>
                            {showDistrictList()}
                        </tbody>
                    </table>
                </div>
                <div>
                    <p className={styles["highlight"]}>Type of Facility</p>
                    <div className="form-check">
                        <label
                            className={`${"form-check-label"} ${
                                styles["highlight"]
                            }`}
                            htmlFor="government"
                        >
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="government"
                                name="Government"
                                value="Government"
                                onClick={(event) =>
                                    handleChange(
                                        event.target.name,
                                        setFacilityType
                                    )
                                }
                                checked={facilityType === "Government"}
                            />
                            <div
                                className={styles["wrapper"]}
                                style={{
                                    backgroundColor:
                                        facilityType === "Government"
                                            ? "#DE9D00"
                                            : "",
                                }}
                            >
                                &nbsp;
                            </div>
                            Government
                        </label>
                    </div>
                    <div className="form-check">
                        <label
                            className={`${"form-check-label"} ${
                                styles["highlight"]
                            }`}
                            htmlFor="private"
                        >
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="private"
                                name="Private"
                                value="Private"
                                onClick={(event) =>
                                    handleChange(
                                        event.target.name,
                                        setFacilityType
                                    )
                                }
                                checked={facilityType === "Private"}
                            />
                            <div
                                className={styles["wrapper"]}
                                style={{
                                    backgroundColor:
                                        facilityType === "Private"
                                            ? "#DE9D00"
                                            : "",
                                }}
                            >
                                &nbsp;
                            </div>
                            Private
                        </label>
                    </div>
                </div>
                <div>
                    <p className={styles["highlight"]}>Status</p>
                    <div className="form-check">
                        <label
                            className={`${"form-check-label"} ${
                                styles["highlight"]
                            }`}
                            htmlFor="Active"
                        >
                            <input
                                type="radio"
                                className="form-check-input"
                                id="Active"
                                name="Active"
                                value="Active"
                                onClick={(event) =>
                                    handleChange(event.target.name, setStatus)
                                }
                                checked={status === "Active"}
                            />
                            <div
                                className={`${styles["wrapper"]} ${styles["radio"]}`}
                                style={{
                                    backgroundColor:
                                        status === "Active" ? "#DE9D00" : "",
                                }}
                            >
                                &nbsp;
                            </div>
                            Active
                        </label>
                    </div>
                    <div className="form-check">
                        <label
                            className={`${"form-check-label"} ${
                                styles["highlight"]
                            }`}
                            htmlFor="Inactive"
                        >
                            <input
                                type="radio"
                                className="form-check-input"
                                id="Inactive"
                                name="Inactive"
                                value="Inactive"
                                onClick={(event) =>
                                    handleChange(event.target.name, setStatus)
                                }
                                checked={status === "Inactive"}
                            />
                            <div
                                className={`${styles["wrapper"]} ${styles["radio"]}`}
                                style={{
                                    backgroundColor:
                                        status === "Inactive" ? "#DE9D00" : "",
                                }}
                            >
                                &nbsp;
                            </div>
                            Inactive
                        </label>
                    </div>
                </div>
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
                            <div className="form-check">
                        <label
                            className={`${"form-check-label"} ${
                                styles["highlight"]
                            }`}
                            htmlFor="checkAll"
                        >
                           <input
                                    type="checkbox"
                                    className="form-check-input"
                                    onClick={(e) =>
                                        {
                                            handleAllcheck(e)
                                        }
                                    }
                                    id="checkAll"
                                    value="checkAll"
                                    checked={allChecked} 
                                />
                                <div
                                    className={styles["wrapper"]}
                                    style={{
                                        backgroundColor:
                                        allChecked ? "#DE9D00" : "",
                                    }}
                                >
                                    &nbsp;
                                </div>
                        </label>
                    </div>
                                
                            </th>
                        </tr>
                    </thead>
                    <tbody>{selectedState && selectedDistrict ?  getFaciltiyList() : ''}</tbody>
                    
                </table>
            </div>
            <div className="col-sm-2 container">
                <div className={`card ${styles["card-continer"]}`}>
                    <div className="card-body text-center">
                        {faclitiesList.length>0 ? '' : <p>Success</p>}
                        <p>
                            Make {rowCount} facilities active for the {selectedProgram}
                        </p>
                        <button
                            onClick={handleClick}
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
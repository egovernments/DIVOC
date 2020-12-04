import React, { useState, useEffect } from "react";
import DropDown from "../DropDown/DropDown";
import { PROGRAMS, STATE_NAMES, DISTRICT_NAMES } from "../../utils/constants";
import styles from "./FacilityActivation.module.css";

function FacilityActivation() {
    const [listOfStates, setListOfStates] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState([]);
    const [selectedState, setSelectedState] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState([]);
    const [FacilityType, setFacilityType] = useState([]);

    useEffect(() => {
        normalizeStateNames();
    }, []);

    const normalizeStateNames = () => {
        let data = [];
        Object.keys(STATE_NAMES).map((state) => {
            let newData = {};
            newData.value = state;
            newData.label = STATE_NAMES[state];
            data.push(newData);
        });
        setListOfStates(data);
    };

    const handleChange = (value, setValue) => {
        setValue(value);
        console.log(value);
    };

    const showDistrictList = () => {
        return Object.keys(DISTRICT_NAMES).map((district) => {
            return (
                <tr>
                    <td>
                        <input
                            type="radio"
                            onChange={(event) =>
                                handleChange(district, setSelectedDistrict)
                            }
                        />
                        {district}
                    </td>
                    <td>{DISTRICT_NAMES[district]}</td>
                </tr>
            );
        });
    };

    const handleClick = () => {
        console.log("clicked me")
    }
    return (
        <div class="row">
            <div class="col-sm-3 container">
                <div>
                    <DropDown
                        options={PROGRAMS}
                        placeholder="Select Program"
                        setSelectedOption={setSelectedProgram}
                    />
                </div>
                <div>
                    <p>All of India</p>
                    <DropDown
                        options={listOfStates}
                        placeholder="Please select State"
                        setSelectedOption={setSelectedState}
                    />
                </div>
                <div class="table-responsive" className={styles["table"]}>
                    <table class="table table-borderless">
                        <thead>
                            <tr>Please select District</tr>
                        </thead>
                        <tbody>{showDistrictList()}</tbody>
                    </table>
                </div>
                <div>
                    <h5>Type of Facility</h5>
                    <div class="form-check">
                        <label class="form-check-label" htmlFor="government">
                            <input
                                type="checkbox"
                                class="form-check-input"
                                id="government"
                                name="Government"
                                value="Government"
                                onClick={(event) =>
                                    handleChange(
                                        event.target.name,
                                        setFacilityType
                                    )
                                }
                            />
                            Government
                        </label>
                    </div>
                    <div class="form-check">
                        <label class="form-check-label" htmlFor="private">
                            <input
                                type="checkbox"
                                class="form-check-input"
                                id="private"
                                name="Private"
                                value="Private"
                                onClick={(event) =>
                                    handleChange(
                                        event.target.name,
                                        setFacilityType
                                    )
                                }
                            />
                            Private
                        </label>
                    </div>
                </div>
                <div>
                    <h5>Status</h5>
                    <div class="form-check">
                        <label class="form-check-label" htmlFor="Active">
                            <input
                                type="radio"
                                class="form-check-input"
                                id="Active"
                                name="Active"
                                value="Active"
                                onClick={(event) =>
                                    handleChange(
                                        event.target.name,
                                        setFacilityType
                                    )
                                }
                                checked
                            />
                            Active
                        </label>
                    </div>
                    <div class="form-check">
                        <label class="form-check-label" for="Inactive">
                            <input
                                type="radio"
                                class="form-check-input"
                                id="Inactive"
                                name="Inactive"
                                value="Inactive"
                                onClick={(event) =>
                                    handleChange(
                                        event.target.name,
                                        setFacilityType
                                    )
                                }
                            />
                            Inactive
                        </label>
                    </div>
                </div>
            </div>
            <div class="col-sm-6 container">
                <table class="table">
                <thead>
                    <tr>
                        <th>CENTRE ID</th>
                        <th>CENTRE NAME</th>
                        <th>VACCINATION STATIONS</th>
                        <th>CERTIFIED VACCINATORS</th>
                        <th>C19 program STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>100</td>
                        <td>This is a centre name</td>
                        <td>100</td>
                        <td>100</td>
                        <td>Inactive</td>
                    </tr>
                    <tr>
                        <td>100</td>
                        <td>This is a centre name</td>
                        <td>100</td>
                        <td>100</td>
                        <td>Inactive</td>
                    </tr><tr>
                        <td>100</td>
                        <td>This is a centre name</td>
                        <td>100</td>
                        <td>100</td>
                        <td>Inactive</td>
                    </tr>
                </tbody>
                </table>
            </div>
            <div class="col-sm-3 container">
            <div class="card">
                <div class="card-body text-center">
                    <p>Make x facilities active for the x-program</p>
                    <button onClick={handleClick} className={styles['button']}>MAKE ACTIVE</button>
                </div>
            </div>
            </div>
        </div>
    );
}

export default FacilityActivation;
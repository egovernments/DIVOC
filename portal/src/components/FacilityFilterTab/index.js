import React, {useState} from "react";
import "./index.scss";
import DropDown from "../DropDown/DropDown";
import {CONSTANTS} from "../../utils/constants";

export const FacilityFilterTab = ({
                                      programs, selectedProgram, setSelectedProgram, states, setSelectedState, selectedState, districtList,
                                      selectedDistrict, setSelectedDistrict, facilityType, setFacilityType, children, countryName
                                  }) => {

    const handleChange = (value, setValue) => {
        setValue(value);
    };

    const showDistrictList = () => {
        return districtList.map((district) => {
            return (
                <tr>
                    <td className="filter-header">
                        <CheckboxItem
                            text={district.name}
                            checked={selectedDistrict.includes(district.name)}
                            onSelect={(event) =>
                                handleChange(
                                    selectedDistrict.includes(district.name) ? selectedDistrict.filter(dName => dName !== district.name) : selectedDistrict.concat(district.name),
                                    setSelectedDistrict
                                )
                            }/>
                    </td>
                    {/*<td>{districtList[district]}</td>*/}
                </tr>
            );
        });
    };

    return (
        <div className="filter-tab-container">
            <div className="select-program-wrapper">
                <span className="filter-header">Program Name</span>
                <DropDown
                    selectedOption={selectedProgram}
                    options={programs}
                    placeholder="Select Program"
                    setSelectedOption={setSelectedProgram}
                />
            </div>
            <div>
                <span className="filter-header">All of {countryName}</span>
                <DropDown
                    selectedOption={selectedState}
                    options={states}
                    placeholder="Please select State"
                    setSelectedOption={setSelectedState}
                />
            </div>
            {selectedState != "All" &&
                <React.Fragment>
                    <span className="filter-header">{selectedState}</span>
                    <div className="m-3">
                        <div className="table-responsive district-table">
                            <table className="table table-borderless table-hover">
                                <thead>
                                <tr>
                                    <th style={{"marginLeft":"12px"}}>Please select Districts</th>
                                </tr>
                                </thead>
                                <tbody className="tbody">
                                {selectedState ? showDistrictList() : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </React.Fragment>
            }
            <div>
                <span className="filter-header">Type of Facility</span>
                <div className="m-3">
                    <div className="filter-header mb-1">
                        <RadioItem
                            text={CONSTANTS.GOVT}
                            checked={facilityType === CONSTANTS.GOVT}
                            onSelect={(event) =>
                                handleChange(
                                    event.target.name,
                                    setFacilityType
                                )
                            }
                        />
                    </div>
                    <div className="filter-header mb-1">
                        <RadioItem
                            text={CONSTANTS.PRIVATE}
                            checked={facilityType === CONSTANTS.PRIVATE}
                            onSelect={(event) =>
                                handleChange(
                                    event.target.name,
                                    setFacilityType
                                )
                            }
                        />
                    </div>
                </div>
                {
                    children
                }
            </div>
        </div>
    )
};

export const CheckboxItem = ({text, checked, onSelect, showText = true, checkedColor}) => (
    <div className="custom-checkbox-item-wrapper">
        <label
            className="form-check-label d-flex align-items-center"
            htmlFor={text}
        >
            <input
                type="checkbox"
                className="d-none form-check-input"
                id={text}
                name={text}
                value={text}
                onChange={onSelect}
                checked={checked}
            />
            <div
                className="wrapper"
                style={{
                    backgroundColor:
                        checked
                            ? checkedColor ? checkedColor : "#DE9D00"
                            : "",
                }}
            >
                &nbsp;
            </div>
            {showText && text}
        </label>
    </div>
);

export const RadioItem = ({text, checked, onSelect, showText=true}) => (
    <div className="form-check filter-header mb-1">
        <label
            className="form-check-label d-flex align-items-center"
            htmlFor={text}
        >
            <input
                type="radio"
                className="form-check-input d-none"
                id={text}
                name={text}
                value={text}
                onChange={onSelect}
                checked={checked}
            />
            <div className="custom-radio-wrapper">
                <div
                    className="custom-radio"
                    style={{
                        backgroundColor:
                            checked
                                ? "#DE9D00"
                                : "",
                    }}
                />
            </div>
            {showText && text}
        </label>
    </div>
);

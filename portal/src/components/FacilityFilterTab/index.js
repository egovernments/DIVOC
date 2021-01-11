import React from "react";
import "./index.scss";
import DropDown from "../DropDown/DropDown";

export const FacilityFilterTab = ({
                                      programs, setSelectedProgram, states, setSelectedState, selectedState, districtList,
                                      selectedDistrict, setSelectedDistrict, facilityType, setFacilityType, children
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
                                    district.name,
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
                <DropDown
                    options={programs}
                    placeholder="Select Program"
                    setSelectedOption={setSelectedProgram}
                />
            </div>
            <div>
                <span className="filter-header">All of India</span>
                <DropDown
                    options={states}
                    placeholder="Please select State"
                    setSelectedOption={setSelectedState}
                />
            </div>
            <span className="filter-header">{selectedState}</span>
            <div className="m-3">
                <div className="table-responsive district-table">
                    <table className="table table-borderless table-hover">
                        <thead>
                        <tr>
                            <td>Please select District</td>
                        </tr>
                        </thead>
                        <tbody className="tbody">
                        {selectedState ? showDistrictList() : ''}
                        </tbody>
                    </table>
                </div>
            </div>
            <div>
                <span className="filter-header">Type of Facility</span>
                <div className="m-3">
                    <div className="filter-header mb-1">
                        <CheckboxItem
                            text={"GOVT"}
                            checked={facilityType === "GOVT"}
                            onSelect={(event) =>
                                handleChange(
                                    event.target.name,
                                    setFacilityType
                                )
                            }
                        />
                    </div>
                    <div className="filter-header mb-1">
                        <CheckboxItem
                            text={"PRIVATE"}
                            checked={facilityType === "PRIVATE"}
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

export const CheckboxItem = ({text, checked, onSelect, showText=true}) => (
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
                            ? "#DE9D00"
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

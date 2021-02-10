import React, {useEffect, useState} from "react";
import "./FacilityDetails.css";
import {CheckboxItem, FacilityFilterTab, RadioItem} from "../FacilityFilterTab";
import NotifyPopup from "../NotifiyPopup/NotifiyPopup";
import info from "../../assets/img/info.png";
import check from "../../assets/img/check.png";
import {API_URL, CONSTANTS} from "../../utils/constants";
import {useAxios} from "../../utils/useAxios";
import {getNotificationTemplates} from "../../utils/config";
import DetailsCard from "../DetailsCard/DetailsCard";

function FacilityDetails({
                             facilities, setFacilities, selectedState, onStateSelected, districtList, selectedDistrict,
                             setSelectedDistrict, stateList, programs, selectedProgram, setSelectedProgram, facilityType, setFacilityType,
                             status, setStatus, resetFilter, updateFacilityProgramStatus, countryName, fetchFacilities
                         }) {
    const axiosInstance = useAxios('');
    const [modalShow, setModalShow] = useState(false);
    const [notificationTemplate, setNotificationTemplate] = useState('');
    const [showCard, setShowCard] = useState(false);
    const [selectedRow, setSelectedRow] = useState([]);

    const [allChecked, setAllChecked] = useState(false);
    useEffect(() => {
        resetFilter({status: CONSTANTS.ACTIVE});
        getNotificationTemplates()
            .then(res => {
                setNotificationTemplate(res.facilityPendingTasks.html)
            })
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

    const getFacilityList = () => {
        return facilities.map((facility, index) => (
            <tr>
                <td>{facility.facilityCode}</td>
                <td  role="button" onClick={() => {
                    setShowCard(!showCard);
                    setSelectedRow(facility)
                }}>{facility.facilityName}</td>
                <td>{facility.admins ? <img src={check}/> : <img src={info}/>}</td>
                <td>{facility.seal ? <img src={check}/> : <img src={info}/>}</td>
                <td>{facility.roleSetup ? <img src={check}/> : <img src={info}/>}</td>
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

    const handleNotifyClick = () => {
        const selectedFacilities = facilities.filter(facility => facility.isChecked);
        if (selectedFacilities.length > 0) {
            setAllChecked(false);
            setModalShow(true);
        }
    };

    const sendNotification = () => {
        const selectedFacilities = facilities.filter(facility => facility.isChecked);
        const notifyRequest = selectedFacilities.map(facility => {
            let req = {
                facilityId: facility.osid,
                pendingTasks: []
            };
            if(!facility.admins) {
                req.pendingTasks.push("vaccinators")
            }
            if(!facility.seal) {
                req.pendingTasks.push("seal")
            }
            if(!facility.roleSetup) {
                req.pendingTasks.push("roles")
            }
            return req
        });
        axiosInstance.current.post(API_URL.FACILITY_NOTIFY_API, notifyRequest)
            .then(res => {
                //registry update in ES happening async, so calling search immediately will not get back actual data
                // setTimeout(() => fetchFacilities(), 1000)
            });
    };

    const numberOfFacilities = facilities.filter(facility => facility.isChecked).length;

    return (
        <div className={"row"}>
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
                        <span className={"filter-header"}>Status</span>
                        <div className="m-3">
                            <RadioItem
                                text={CONSTANTS.ACTIVE}
                                checked={status === CONSTANTS.ACTIVE}
                                onSelect={(event) =>
                                    handleChange(event.target.name, setStatus)
                                }
                            />
                            <RadioItem
                                text={CONSTANTS.IN_ACTIVE}
                                checked={status === CONSTANTS.IN_ACTIVE}
                                onSelect={(event) =>
                                    handleChange(event.target.name, setStatus)
                                }
                            />
                        </div>

                    </div>
                </FacilityFilterTab>
            </div>

            <div className={"col-sm-6 pad-1rem table"}>
                {!showCard ?
                <div>
                    <p className={"highlight"}>
                    {facilities.length === 0 ? "" : facilities.length} Facilit{facilities.length === 1 ? "y" : "ities"}
                    </p>
                    <table className={"table table-hover table-data"}>
                        <thead>
                        <tr>
                            <th>CENTRE ID</th>
                            <th>CENTRE NAME</th>
                            <th>VACCINATOR DETAILS</th>
                            <th>FACILITY SEAL</th>
                            <th>ROLE SETUP</th>
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
                 : ""}
                <DetailsCard
                    showCard={showCard}
                    setShowCard={setShowCard}
                    facility={selectedRow}
                    fetchFacilities={fetchFacilities}
                    status={status}
                    updateFacilityProgramStatus={updateFacilityProgramStatus}
                />
            </div>

            <div className="col-sm-3 container">
                <div className={"card card-continer"}>
                    {selectedProgram && <div className="card-body text-center">
                        {(numberOfFacilities>0)?
                            <p>Notify {numberOfFacilities} facilities for the {selectedProgram}</p>
                          :<p>Please select one or more facilities.</p>
                        }
                        <button
                            onClick={() => handleNotifyClick()}
                            className={"button"}
                        >
                            NOTIFY
                        </button>
                        <NotifyPopup
                            message={notificationTemplate}
                            show={modalShow}
                            onHide={() => {
                                setModalShow(false)
                            }}
                            onSend={()=>{
                                setModalShow(false)
                                sendNotification()
                            }}
                        />
                    </div>}
                </div>
            </div>
        </div>
    );
}

export default FacilityDetails;

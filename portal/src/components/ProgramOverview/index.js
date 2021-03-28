import React, {useEffect, useState} from "react";
import {useAxios} from "../../utils/useAxios";
import {Card} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import keycloak from "../../utils/keycloak";
import {equals, reject} from "ramda";
import {API_URL} from "../../utils/constants";
import MedicineImg from "../../assets/img/medicine.svg";
import "./index.css";
import {formatDate} from "../../utils/dateutil";
import { Link } from "react-router-dom";

export default function ProgramOverview() {
    const [program, setProgram] = useState([]);
    const [facilityCode, setFacilityCode] = useState("");
    const [facilityOsid, setFacilityOsid] = useState("");
    const [programsList, setProgramsList] = useState([]);
    const [medicinesList, setMedicinesList] = useState([]);
    const axiosInstance = useAxios("");

    useEffect(() => {
        fetchPrograms().then((res) => setProgramsList(res.data));
        fetchMedicines().then((res) => {
            setMedicinesList(res.data)
        })
    }, []);

    useEffect(() => {
        keycloak.loadUserProfile().then((res) => {
            setFacilityCode(res["attributes"]["facility_code"][0]);
            fetchUserFacility(res["attributes"]["facility_code"][0]).then(
                (res) => {
                    res.data.forEach((item) => {
                        if (!("programs" in item)) {
                            Object.assign(item, {programs: []});
                        }
                    });
                    const activeProgramsList = res.data[0].programs.filter((data) => data.status === "Active");
                    setFacilityOsid(res.data[0].osid);
                    setProgram(activeProgramsList);
                }
            );
        });
    }, []);

    function fetchUserFacility(fc) {
        let params = {
            facilityCode: fc ? fc : facilityCode,
        };
        params = reject(equals(""))(params);
        const queryParams = new URLSearchParams(params);
        return axiosInstance.current.get(API_URL.USER_FACILITY_API, {
            params: queryParams,
        });
    }

    async function fetchPrograms() {
        return await axiosInstance.current.get(API_URL.PROGRAM_API);
    }

    async function fetchMedicines() {
        return await axiosInstance.current.get(API_URL.MEDICINE_API);
    }


    function showMedicineTable(tableData) {
        return (
            tableData.map(data => {
                const selectedMedicine = medicinesList.find((medicine) => medicine.osid === data);
                if(selectedMedicine) {
                    const effectiveUntil = selectedMedicine.effectiveUntil === undefined ? "N/A" :
                        selectedMedicine.effectiveUntil;
                    return (
                        <div className="medicine-row">
                            <div className="d-flex justify-content-between">
                                <b className="">{selectedMedicine['name']}</b>
                                <span className="">Validity {effectiveUntil} Days</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="">{selectedMedicine['provider']}</span>
                                <span className="">{selectedMedicine['price']}</span>
                            </div>
                        </div>
                    )
                }
            })
        )
    }


    function displayProgramDetails(data) {
        const selectedProgram = programsList.find((program) => program.name.toLowerCase() === data.name.toLowerCase());
        if (selectedProgram) {
            return (
                <Card className="card-container">
                    <CardContent>
                        {"logoURL" in selectedProgram && selectedProgram.logoURL.trim() !== "" ?
                            <span className='list-logo-img'>
                        <img alt="" src={selectedProgram.logoURL} width={"100%"}/>
                    </span> : <span className='list-logo-img list-view-logo-text'>
                        {selectedProgram.name.substr(0, 3)}
                    </span>
                        }

                        <h3 className="">{selectedProgram.name}</h3>
                        <p className="overview-description" title={selectedProgram.description}>{
                            selectedProgram.description.length > 320 ? selectedProgram.description.substr(0, 320) + "..." : selectedProgram.description
                        }</p>
                        <div className="d-flex justify-content-between">
                            <p className="">Start Date:</p>
                            <b className="">{formatDate(selectedProgram.startDate)}</b>
                        </div>
                        <div className="d-flex justify-content-between">
                            <p className="">End Date:</p>
                            <b className="">{formatDate(selectedProgram.endDate)}</b>
                        </div>
                        <div className="d-flex justify-content-between">
                            <Link to={{
                                "pathname": "/portal/facility_configure_slot",
                                "programId": selectedProgram.osid,
                                "programName": selectedProgram.name,
                                "facilityOsid": facilityOsid
                            }}><b style={{"fontSize": "12px"}}>CONFIGURE SLOTS</b></Link>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <h5>Program Medicines</h5>
                            <img src={MedicineImg}/>
                        </div>
                        <div className="medicines-list mt-2">
                            {showMedicineTable(selectedProgram.medicineIds)}
                        </div>
                    </CardContent>
                </Card>
            );
        } else {
            return null
        }
    }

    return (
        <div className="overview-container">
            {program.map((data) => displayProgramDetails(data))}
        </div>
    );
}

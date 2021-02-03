import React, { useEffect, useState } from "react";
import { useAxios } from "../../utils/useAxios";
import { Card } from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import keycloak from "../../utils/keycloak";
import { equals, reject } from "ramda";
import { API_URL } from "../../utils/constants";
import ProgramActiveImg from "../../assets/img/program-active.svg";
import "./index.css";

export default function ProgramOverview() {
    const [program, setProgram] = useState([]);
    const [facilityCode, setFacilityCode] = useState("");
    const [programsList, setProgramsList] = useState([]);
    const [medicinesList, setMedicinesList] = useState([]);
    const axiosInstance = useAxios("");

    useEffect(() => {
        fetchPrograms().then((res) => setProgramsList(res.data));
        fetchMedicines().then((res)=> {
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
                            Object.assign(item, { programs: [] });
                        }
                    });
                    const activeProgramsList = res.data[0].programs.filter((data) => data.status === "Active")
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


    function showMedicineTable(tableData){
        return(
            tableData.map(data => {
                const selectedMedicine = medicinesList.filter((medicine) => medicine.osid === data)
                return(
                    <div className="table-row">
                        <tr className={"d-flex"}>
                            <td className="p-2 mr-auto"><b>{selectedMedicine[0]['name']}</b></td>
                            <td className="p-2"></td>
                        </tr>
                        <tr className={"d-flex"}>
                            <td className="p-2 mr-auto">{selectedMedicine[0]['provider']}</td>
                            <td className="p-2">{selectedMedicine[0]['price']}</td>
                        </tr> 
                    </div>
                )
            })
        )
    }


    function displayProgramDetails(data) {
        const selectedProgram = programsList.filter((program) => program.name === data.id)[0];
        return (
            <Card className="card-container">
                <CardContent>
                    <span className={'list-view-logo-img card-padding'}>
                        {"image" in data ? <img alt="" src={selectedProgram.image} width={"100%"}/> : "LOGO"}
                        <img src={ProgramActiveImg}
                                className={'list-view-program-status-img'} alt={selectedProgram.status}
                                title={selectedProgram.status}/>
                    </span>
                    <h3 className="card-padding">{selectedProgram.name}</h3>
                    <p className="card-padding">{selectedProgram.description}</p>
                    <div className="d-flex">
                        <p className="p-2 mr-auto">Start Date:</p>
                        <b className="p-2">{selectedProgram.startDate}</b>
                    </div>
                    <div className="d-flex">
                        <p className="p-2 mr-auto">End Date:</p>
                        <b className="p-2">{selectedProgram.endDate}</b>
                    </div>
                    <h5>Program Medicines</h5>
                    <table className="table table-borderless">
                        <tbody>{showMedicineTable(selectedProgram.medicineIds)}</tbody>
                    </table>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="container">
            {program.map((data) => displayProgramDetails(data))}
        </div>
    );
}

import React, { useEffect, useState } from "react";
import { useAxios } from "../../utils/useAxios";
import { Card } from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import keycloak from "../../utils/keycloak";
import { equals, reject } from "ramda";
import { API_URL } from "../../utils/constants";
import "./index.css";

export default function ProgramOverview() {
    const [program, setProgram] = useState([]);
    const [facilityCode, setFacilityCode] = useState("");
    const [programsList, setProgramsList] = useState([]);
    const axiosInstance = useAxios("");

    useEffect(() => {
        fetchPrograms().then((res) => setProgramsList(res.data));
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
                    console.log("active programs", activeProgramsList);
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

    function displayProgramDetails(data) {
        const selectedProgram = programsList.filter((program) => program.name === data.id)[0];
        return (
            <Card className="card-container">
                <CardContent>
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

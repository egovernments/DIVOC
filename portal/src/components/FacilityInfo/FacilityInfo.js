import { Container } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import {useAxios} from "../../utils/useAxios";
import {useKeycloak} from "@react-keycloak/web";
import { CONSTANTS } from "../../utils/constants";
import FacilityForm from "../FacilityForm/FacilityForm";

function FacilityInfo() {
    const [facility, setFacility] = useState({});
    const axiosInstance = useAxios("");

    useEffect(() => {
        if (axiosInstance.current) {
            (async function () { await fetchFacility(); })()
        }
    }, [axiosInstance]);

    function fetchFacility() {
        return axiosInstance.current.get('/divoc/admin/api/v1/facility')
        .then(res => {
            setFacility(res.data.length > 0 ? res.data[0] : {})
        });
    }
    
    return <Container id="facility-details">
    <h2 id="heading">Facility Details</h2>
        <FacilityForm facility={facility} refreshFacility={fetchFacility}/>
    </Container>
}

export default FacilityInfo;
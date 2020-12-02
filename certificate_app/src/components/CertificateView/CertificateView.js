import React from "react";
import axios from 'axios';
import { useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { useState } from "react";

function CertificateView() {
    const { keycloak } = useKeycloak();
    const [certificateList,setCertificateList] = useState([])

    const config = {
        headers: {
            Authorization: `Bearer ${keycloak.token} `,
            "Content-Type": "application/json",
        },
    };

    useEffect(() => {
        getCertificate();
    },[])

    const getCertificate = async () => {
        const response = await axios
            .get("/divoc/api/v1/certificates/2343243439",config)
            .then((res) => {
                return res.data.VaccinationCertificate;
            })
        setCertificateList(response)
    }

    return(
        <div>
            <div>Download Certificate for </div>
        </div>
    );
}

export default CertificateView;
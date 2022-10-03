import React from "react";
import axios from 'axios';
import { useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";

function CreateSchema() {
    const { keycloak } = useKeycloak();

    const config = {
        headers: {
            Authorization: `Bearer ${keycloak.token} `,
            "Content-Type": "application/json",
        },
    };

    useEffect(() => {
        createSchema();
    },[])

    const createSchema = async () => {
        axios
            .post("/vc-management/v1/schema", {}, config)
            .then(res => res.data)
    }

    return(
        <div>
            <div>Create Schema</div>
        </div>
    );
}

export default CreateSchema;
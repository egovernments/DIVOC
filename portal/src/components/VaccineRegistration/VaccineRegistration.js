import React, { useState } from "react";
import styles from "./VaccineRegistration.module.css";
import { useKeycloak } from "@react-keycloak/web";
import axios from "axios";
import Form from "@rjsf/core";

function VaccineRegistration() {
    const { keycloak } = useKeycloak();
    const [formData, setFormData] = useState(null);

    const schema = {
        title: "Register New Vaccine",
        type: "object",
        properties: {
            name: {
                type: "string",
                title: "Name",
            },
            provider: {
                title: "Provider",
                type: "string",
            },
            schedule: {
                title: "Schedule",
                type: "object",
                description:
                    "How many times and how often vaccination should be repeated",
                properties: {
                    repeatTimes: {
                        type: "number",
                        title: "Repeat times",
                        description:
                            "How many times vaccination should be taken",
                    },
                    repeatInterval: {
                        title: "Repeat interval",
                        type: "number",
                        description:
                            "Number of times the vaccination should be taken.",
                    },
                },
            },
            effectiveUntil: {
                type: "number",
                description:
                    "Effective until n months after the full vaccination schedule is completed",
                title: "Effective until (months)",
            },
            status: {
                type: "string",
                enum: ["Active", "Inactive", "Blocked"],
                title: "Status",
            },
            price: {
                title: "Price (if fixed)",
                type: "number",
            },
        },
    };

    const handleSubmit = (dataToSend) => {
        const config = {
            headers: {
                Authorization: `Bearer ${keycloak.token} `,
                "Content-Type": "application/json",
            },
        };
        axios
            .post("/divoc/admin/api/v1/medicines", dataToSend, config)
            .then((res) => {
                alert("Status code is", res);
                console.log(res);
            });
    };

    const uiSchema = {};


    return (
        <div className={styles["container"]}>
            <div className={styles["registration-form"]}>
                <Form
                    schema={schema}
                    uiSchema={uiSchema}
                    onSubmit={(e) => {
                        // setFormData(e.formData);
                        handleSubmit(e.formData);
                    }}
                />
            </div>
            <div className={styles["registration-form"]}>
                <p>List of Registered Vaccines</p>
            </div>
        </div>
    );
}

export default VaccineRegistration;
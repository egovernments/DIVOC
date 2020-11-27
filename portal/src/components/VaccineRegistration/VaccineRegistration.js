import React, { useState } from "react";
import styles from "./VaccineRegistration.module.css";
import { useKeycloak } from "@react-keycloak/web";
import axios from "axios";
import Form from "@rjsf/core";

function VaccineRegistration() {
    const { keycloak } = useKeycloak();
    const [formData, setFormData] = useState(null);

    const schema = {
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
                properties: {
                    repeatTimes: {
                        type: "number",
                        title: "Repeat times",
                    },
                    repeatInterval: {
                        title: "Repeat interval",
                        type: "number",
                    },
                },
            },
            effectiveUntil: {
                type: "number",
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

    const uiSchema = {
        classNames: styles["form-conatiner"],
        title: {
            classNames: styles["form-title"],
        },
    };


    return (
        <div className={styles["container"]}>
            <div className={styles["registration-form"]}>
                <h4 className={styles['heading']}>Register New Vaccine</h4>
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
import React, { useState } from "react";
import styles from "./ProgramRegistration.module.css";
import axios from "axios";
import { useKeycloak } from "@react-keycloak/web";
import Form from "@rjsf/core";

function VaccineRegistration() {
    const { keycloak } = useKeycloak();
    const [formData, setFormData] = useState(null);

    const schema = {
        title: "Program",
        type: "object",
        required: ["name", "description", "startDate"],
        properties: {
            name: {
                type: "string",
                title: "Name",
            },
            description: {
                type: "string",
                title: "Description",
            },
            logoURL: {
                type: "string",
                title: "Program Logo",
                format: "file",
            },
            startDate: {
                type: "string",
                title: "Start Date",
                format: "date",
            },
            endDate: {
                type: "string",
                title: "End Date",
                format: "date",
            },
            status: {
                type: "string",
                title: "Status",
                format: "radio",
                enum: ["Active", "Inactive"],
            },
            medicineIds: {
                type: "array",
                items: {
                    type: "string",
                },
            },
        },
    };

    

    const uiSchema = {
        "ui:order": [
            "name",
            "description",
            "logoURL",
            "startDate",
            "endDate",
            "status",
            "medicineIds",
        ],
        name: {
            classNames: styles["custom-class-name"],
        },
        age: {
            classNames: "custom-class-age",
        },
        medicineIds: { "ui:widget": "hidden" },
    };

    const handleSubmit = () => {
        const config = {
            headers: {
                Authorization: `Bearer ${keycloak.token} `,
                "Content-Type": "application/json",
            },
        };
        axios
            .post("/divoc/admin/api/v1/programs", formData, config)
            .then((res) => {
                alert("Status code is", res);
                console.log(res);
            });
    };

    return (
        <div className={styles["container"]}>
            <div className={styles["registration-form"]}>
                <Form
                    schema={schema}
                    uiSchema={uiSchema}
                    onSubmit={(e) => {
                        // setFormData(e.formData)
                        handleSubmit(e.formData);
                    }}
                />
            </div>
            <div className={styles["registration-form"]}>
                <p>List of Registered Program</p>
            </div>
        </div>
    );
}

export default VaccineRegistration;
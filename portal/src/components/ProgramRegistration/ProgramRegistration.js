import React, { useState } from "react";
import styles from "./ProgramRegistration.module.css";
import axios from "axios";
import { useKeycloak } from "@react-keycloak/web";
import Form from "@rjsf/core";

function VaccineRegistration() {
    const { keycloak } = useKeycloak();
    const [formData, setFormData] = useState(null);

    const schema = {
        type: "object",
        required: ["name", "description", "startDate"],
        properties: {
            programId: {
                type: "number",
                title: "Internal Program UID",
            },
            name: {
                type: "string",
                title: "Program Name",
            },
            description: {
                type: "string",
                title: "Program Description",
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
                enum: [
                    "Active", 
                    "Inactive"
                ],
            },
        },
    };

    

    const uiSchema = {
        classNames: styles["form"],
        title: {
            classNames: styles["form-title"],
        },
        status: {
            classNames: styles["form-radio-buttons"],
            "ui:widget": "radio",
            "ui:options": {
                "inline": true,
            }
        }
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
            <div className={styles["form-container"]}>
            <h4 className={styles['heading']}>Register New Vaccine</h4>
                <Form
                    schema={schema}
                    uiSchema={uiSchema}
                    onSubmit={(e) => {
                        // setFormData(e.formData)
                        handleSubmit(e.formData);
                    }}
                >
                    <button type="submit" className={styles['button']}>SAVE</button>
                </Form>
            </div>
            <div className={styles["sub-container"]}>
                <p>List of Registered Program</p>
            </div>
        </div>
    );
}

export default VaccineRegistration;
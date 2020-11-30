import React, { useState, useEffect } from "react";
import styles from "./VaccineRegistration.module.css";
import { useKeycloak } from "@react-keycloak/web";
import axios from "axios";
import ListView from '../ListView/ListView';
import Form from "@rjsf/core";


function VaccineRegistration() {
    const { keycloak } = useKeycloak();
    const [formData, setFormData] = useState(null);
    const [medicineList, setMedicineList] = useState([])

    useEffect(() => {
        getListOfRegisteredVaccines();
    },[]);

    const config = {
        headers: {
            Authorization: `Bearer ${keycloak.token} `,
            "Content-Type": "application/json",
        },
    };

    const schema = {
        type: "object",
        properties: {
            name: {
                type: "string",
                title: "Name of Vaccine / Medicine",
            },
            medicineId: {
                type: "number",
                title: "Medicine ID (if applicable)",
            },
            program: {
                title: "Select Program",
                type: "object",
                properties: {
                  "Please select vaccine program": {
                    "type": "string",
                    "enum": [
                      "C-19 Program",
                    ],
                    "default": "C-10 Program"
                  }
            },
        },
            manufacturer: {
                type: "string",
                title: "Manufacturer",
            },
            provider: {
                title: "Supplier / Distributor",
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
                title: "Price Range",
                type: "number",
            },
            logoURL: {
                type: "string",
                title: "Vaccine Administering Details",
                format: "file",
            },
        },
    };

    const uiSchema = {
        classNames: styles["form-conatiner"],
        title: {
            classNames: styles["form-title"],
        },
    };

    const handleSubmit = (dataToSend) => {
        axios
            .post("/divoc/admin/api/v1/medicines", dataToSend, config)
            .then((res) => {
                alert("Status code is", res);
                console.log(res);
            });
    };

    

    const getListOfRegisteredVaccines = async () => {
        const res = await axios
            .get("/divoc/admin/api/v1/medicines", config)
            .then( (res) => {
                return res.data
            })
        setMedicineList(res)
    }


    return (
        <div className={styles["container"]}>
            <div className={styles["form-container"]}>
                <h4 className={styles['heading']}>Register New Vaccine</h4>
                <Form
                    schema={schema}
                    uiSchema={uiSchema}
                    onSubmit={(e) => {
                        // setFormData(e.formData);
                        handleSubmit(e.formData);
                    }}
                >
                    <button type="submit" className={styles['button']}>SAVE</button>
                </Form>
            </div>
            <div className={styles["sub-container"]}>
                <p className={styles['list-title']}>List of Registered Medicines / Vaccines</p>
                <ListView listData={medicineList} />
            </div>
        </div>
    );
}

export default VaccineRegistration;
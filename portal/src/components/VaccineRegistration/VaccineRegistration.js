import React, { useState, useEffect } from "react";
import styles from "./VaccineRegistration.module.css";
import { useKeycloak } from "@react-keycloak/web";
import axios from "axios";
import ListView from '../ListView/ListView';
import Form from "@rjsf/core";
import schema from '../../jsonSchema/vaccineSchema.json';


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
                alert("Successfully Registered");
                getListOfRegisteredVaccines()
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
                <ListView listData={medicineList} fields={["provider", "price", "effectiveUntil"]}/>
            </div>
        </div>
    );
}

export default VaccineRegistration;
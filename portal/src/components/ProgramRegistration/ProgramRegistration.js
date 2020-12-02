import React, { useState, useEffect } from "react";
import styles from "./ProgramRegistration.module.css";
import axios from "axios";
import { useKeycloak } from "@react-keycloak/web";
import Form from "@rjsf/core";
import ListView from '../ListView/ListView';
import schema from '../../jsonSchema/programSchema.json';

function VaccineRegistration() {
    const { keycloak } = useKeycloak();
    const [formData, setFormData] = useState(null);
    const [programList, setProgramList] = useState([]);
    const [programSchema, setProgramSchema] = useState(schema);

    useEffect(() => {
        getListOfRegisteredPrograms();
        getListOfRegisteredVaccines();
    },[]);

    const config = {
        headers: {
            Authorization: `Bearer ${keycloak.token} `,
            "Content-Type": "application/json",
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
        },
    };

    const handleSubmit = (datatoSend) => {
        axios
            .post("/divoc/admin/api/v1/programs", datatoSend, config)
            .then((res) => {
                alert("Successfully Registered");
                console.log(res);
                getListOfRegisteredPrograms()
            });
    };

    const getListOfRegisteredPrograms = async () => {
        const res = await axios
            .get("/divoc/admin/api/v1/programs", config)
            .then( (res) => {
                return res.data
            });
        setProgramList(res)
    };

    const getListOfRegisteredVaccines = async () => {
        const res = await axios
            .get("/divoc/admin/api/v1/medicines", config)
            .then( (res) => {
                return res.data
            })
        let vaccineIds = [], vaccineNames = [];
        res.forEach(r => {
           vaccineIds.push(r.osid);
           vaccineNames.push(r.name);
        });
        const updatedSchema = {...programSchema};
        updatedSchema.properties.vaccine.enum = vaccineIds;
        updatedSchema.properties.vaccine.enumNames = vaccineNames;
        //TODO: setting schema as empty, to enable rendering of the form.
        setProgramSchema({});
        setProgramSchema(updatedSchema);
    };

    return (
        <div className={styles["container"]}>
            <div className={styles["form-container"]}>
            <h4 className={styles['heading']}>Register New Vaccine Program</h4>
                <Form
                    schema={programSchema}
                    uiSchema={uiSchema}
                    onSubmit={(e) => {
                        setFormData(e.formData);
                        const newField = {medicineIds: [e.formData.vaccine]};
                        Object.assign(e.formData, newField);
                        handleSubmit(e.formData);
                    }}
                >
                    <button type="submit" className={styles['button']}>SAVE</button>
                </Form>
            </div>
            <div className={styles["sub-container"]}>
                <p className={styles['list-title']}>List of Registered Vaccine Programs</p>
                <ListView listData={programList} />
            </div>
        </div>
    );
}

export default VaccineRegistration;
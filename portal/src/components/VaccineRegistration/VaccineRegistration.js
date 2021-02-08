import React, { useState, useEffect } from "react";
import styles from "./VaccineRegistration.module.css";
import { useKeycloak } from "@react-keycloak/web";
import axios from "axios";
import VaccineList from "../VaccineListView/VaccineList";
import Form from "@rjsf/core";
import schema from '../../jsonSchema/vaccineSchema.json';
import Button from 'react-bootstrap/Button';
import {CustomDropdownWidget} from "../CustomDropdownWidget/index";
import {CustomTextWidget} from "../CustomTextWidget/index";
import {CustomTextAreaWidget} from "../CustomTextAreaWidget/index";


function VaccineRegistration() {
    const { keycloak } = useKeycloak();
    const [formData, setFormData] = useState(null);
    const [medicineList, setMedicineList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedMedicine,setSelectedMedicine] = useState([]);

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


    const widgets = {
        TextWidget: CustomTextWidget,
        TextareaWidget: CustomTextAreaWidget,
        SelectWidget: CustomDropdownWidget,
    };

    const handleSubmit = (dataToSend) => {
        if (dataToSend.edited) {
            axios
            .put("/divoc/admin/api/v1/medicines", dataToSend, config)
            .then((res) => {
                alert("Successfully Edited");
                getListOfRegisteredVaccines()
            });
        } else {
            axios
            .post("/divoc/admin/api/v1/medicines", dataToSend, config)
            .then((res) => {
                alert("Successfully Registered");
                getListOfRegisteredVaccines()
            });
        }
    };

    

    const getListOfRegisteredVaccines = async () => {
        const res = await axios
            .get("/divoc/admin/api/v1/medicines", config)
            .then( (res) => {
                return res.data.map(d => {
                    return {...d,edited: false}
                })
            })
        setMedicineList(res)
    }

    function onEdit(data) {
        data.edited = true;
        console.log("data to send",data)
        setSelectedMedicine(data);
        handleSubmit(data);
        getListOfRegisteredVaccines();
    }

    function autoFillForm() {
        return { 
            osid: selectedMedicine.osid,
            name: selectedMedicine.name,
            effectiveUntil: selectedMedicine.effectiveUntil,
            price: selectedMedicine.price,
            provider: selectedMedicine.provider,
            schedule: selectedMedicine.schedule,
            status: selectedMedicine.status,
        }
    } 

    return (
        <div className={styles["container"]}>
            {showForm && <div className={styles["form-container"]}>
            <div className="d-flex">
                <h5 className={"mr-auto"}>Register New Vaccine</h5>
                <Button variant="outline-primary" onClick={()=> setShowForm(!showForm)}>BACK</Button>
            </div>
            <Form
                widgets={widgets}
                schema={schema}
                uiSchema={uiSchema}
                onSubmit={(e) => {
                    // setFormData(e.formData);
                    handleSubmit(e.formData);
                }}
            >
                <button type="submit" className={styles['button']}>SAVE</button>
            </Form>
            </div>}
            {!showForm && <div className={styles["sub-container"]}>
            <VaccineList
                schema={schema}
                uiSchema={uiSchema}
                widgets={widgets}
                listData={medicineList} 
                show={showForm} 
                setShow={setShowForm}
                autoFillForm={autoFillForm}
                onEdit={onEdit}
                setSelectedData={setSelectedMedicine}
            />
            </div>}
        </div>
    );
}

export default VaccineRegistration;
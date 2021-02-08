import React, { useState, useEffect } from "react";
import styles from "./ProgramRegistration.module.css";
import axios from "axios";
import { useKeycloak } from "@react-keycloak/web";
import Form from "@rjsf/core";
import ListView from '../ListView/ListView';
import schema from '../../jsonSchema/programSchema.json';
import Program from "../../assets/img/program.svg";
import Button from 'react-bootstrap/Button';
import {CustomDateWidget} from '../CustomDateWidget/index';
import {CustomTextWidget} from '../CustomTextWidget/index';
import {CustomTextAreaWidget} from '../CustomTextAreaWidget/index';
import {CustomDropdownWidget} from "../CustomDropdownWidget/index";

function VaccineRegistration() {
    const { keycloak } = useKeycloak();
    const [formData, setFormData] = useState(null);
    const [programList, setProgramList] = useState([]);
    const [programSchema, setProgramSchema] = useState(schema);
    const [showForm, setShowForm] = useState(false);
    const[selectedProgram,setSelectedProgram] = useState([]);

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
        description: {
            "ui:widget": "textarea",
            "ui:options": {
                rows: 5
              }
        }
    };

    const widgets = {
        DateWidget: CustomDateWidget,
        TextWidget: CustomTextWidget,
        TextareaWidget: CustomTextAreaWidget,
        SelectWidget: CustomDropdownWidget,
    };

    const handleSubmit = (datatoSend) => {
        if (datatoSend.edited) {
            axios
            .put("/divoc/admin/api/v1/programs", datatoSend, config)
            .then((res) => {
                alert("Successfully Edited");
                console.log(res);
                getListOfRegisteredPrograms()
            });
        } else {
            axios
            .post("/divoc/admin/api/v1/programs", datatoSend, config)
            .then((res) => {
                alert("Successfully Registered");
                console.log(res);
                getListOfRegisteredPrograms()
            });
        }
    };

    const getListOfRegisteredPrograms = async () => {
        let res = await axios
            .get("/divoc/admin/api/v1/programs", config)
            .then( (res) => {
                return res.data.map(d => {
                    return {...d,edited: false}
                })
            });
        res = res.map(r => ({...r, image: Program}));
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


    function onEdit(data) {
        let editedData = {...data}
        editedData.edited = true;
        console.log("edited data",data)
        setSelectedProgram(editedData);
        handleSubmit(editedData);
        getListOfRegisteredPrograms();
    }

    function autoFillForm() {
        return { 
            osid: selectedProgram.osid,
            name : selectedProgram.name, 
            description: selectedProgram.description,
            logoURL: selectedProgram.image,
            startDate: selectedProgram.startDate,
            endDate: selectedProgram.endDate,
            medicineIds: [...selectedProgram.medicineIds],
        }
    } 

    return (
        <div className={styles["container"]}>
            {showForm && <div className={styles["form-container"]}>
            <div className="d-flex">
                <h5 className={"mr-auto"}>Register New Vaccine Program</h5>
                <Button variant="outline-primary" onClick={()=> setShowForm(!showForm)}>BACK</Button>
            </div>
            
            <Form
                schema={programSchema}
                uiSchema={uiSchema}
                widgets={widgets}
                onSubmit={(e) => {
                    setFormData(e.formData);
                    const newField = {medicineIds: [e.formData.vaccine]};
                    Object.assign(e.formData, newField);
                    handleSubmit(e.formData);
                }}
            >
                <button type="submit" className={styles['button']}>SAVE</button>
            </Form>
            </div>}
            {!showForm && <div className={styles["sub-container"]}>
            <ListView
                schema={programSchema}
                uiSchema={uiSchema}
                widgets={widgets}
                listData={programList} 
                fields={["description", "startDate", "endDate"]} 
                show={showForm} 
                setShow={setShowForm}
                buttonTitle="Register New Vaccine Program"
                title="List of Registered Vaccine Programs"
                showDetails={true}
                onEdit={onEdit}
                setSelectedData={setSelectedProgram}
                autoFillForm={autoFillForm}
            />
            </div>}
        </div>
    );
}

export default VaccineRegistration;
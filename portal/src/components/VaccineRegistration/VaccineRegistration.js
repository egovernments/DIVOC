import React, {useEffect, useState} from "react";
import styles from "./VaccineRegistration.module.css";
import {useKeycloak} from "@react-keycloak/web";
import axios from "axios";
import ListView from '../ListView/ListView';
import Form from "@rjsf/core";
import schema from '../../jsonSchema/vaccineSchema.json';
import Button from 'react-bootstrap/Button';
import {CustomDropdownWidget} from "../CustomDropdownWidget/index";
import {CustomTextWidget} from "../CustomTextWidget/index";
import {CustomTextAreaWidget} from "../CustomTextAreaWidget/index";
import * as R from "ramda";
import {TextInCenter} from "../TextInCenter";


function VaccineRegistration() {
    const {keycloak} = useKeycloak();
    const [formData, setFormData] = useState(null);
    const [medicineList, setMedicineList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [uiSchema, setUiSchema] = useState({
        classNames: styles["form-conatiner"],
        title: {
            classNames: styles["form-title"],
        },
    });

    useEffect(() => {
        getListOfRegisteredVaccines();
    }, []);

    const config = {
        headers: {
            Authorization: `Bearer ${keycloak.token} `,
            "Content-Type": "application/json",
        },
    };

    const widgets = {
        TextWidget: CustomTextWidget,
        TextareaWidget: CustomTextAreaWidget,
        SelectWidget: CustomDropdownWidget,
    };

    const validateFields = (data) => {
        const requiredFields = ["name", "provider", "price"];
        let valid = true;
        requiredFields.forEach(field => {
            if (!R.pathOr(false, [field], data)) {
                valid = false;
                alert(`${field} is a required field`)
            }
        });
        return valid
    };

    const handleSubmit = () => {
        if (validateFields(formData)) {
            axios
                .post("/divoc/admin/api/v1/medicines", {...formData, status: "Active"}, config)
                .then((res) => {
                    alert("Successfully Registered");
                    getListOfRegisteredVaccines()
                });
            setShowForm(!showForm)
        }
    };

    const getListOfRegisteredVaccines = async () => {
        let res = await axios
            .get("/divoc/admin/api/v1/medicines", config)
            .then((res) => {
                return res.data.map(d => {
                    return {...d, edited: false}
                })
            });
        const sortByNameCaseInsensitive = R.sortBy(R.compose(R.toLower, R.prop('name')));
        res = sortByNameCaseInsensitive(res);
        setMedicineList(res)
    };

    function onEdit(data) {
        if (validateFields(data)) {
            axios
                .put("/divoc/admin/api/v1/medicines", {...data}, config)
                .then((res) => {
                    alert("Successfully Registered");
                    getListOfRegisteredVaccines()
                });
            setShowForm(false)
        }
    }

    let blockedVaccines = medicineList.filter(data => data.status === "Blocked");
    let inactiveVaccines = medicineList.filter(data => data.status === "Inactive");
    let activeVaccines = medicineList.filter(data => data.status === "Active");
    return (
        <div className={styles["container"]}>
            {showForm && <div className={styles["form-container"]}>
                <div className="d-flex">
                    <h5 className={"mr-auto"}>{formData.edited ? formData.name : "Register New Vaccine"}</h5>
                    <Button variant="outline-primary" onClick={() => {
                        setShowForm(!showForm);
                        setUiSchema({...uiSchema, "name": {}})
                    }}>BACK</Button>
                </div>
                <Form
                    widgets={widgets}
                    schema={schema}
                    uiSchema={uiSchema}
                    formData={formData}
                    onChange={(e) => {
                        setFormData(e.formData)
                    }}
                    onSubmit={(e) => {
                        if (e.formData.edited) {
                            onEdit(e.formData)
                        } else {
                            handleSubmit();
                        }
                    }}
                >
                    <button type="submit" className={styles['button']}>SAVE</button>
                </Form>
            </div>}
            {!showForm && <div className={styles["sub-container"]}>
                <ListView
                    listData={activeVaccines}
                    onRegisterBtnClick={() => {
                        setShowForm(true);
                        setFormData({});
                    }}
                    title={activeVaccines.length > 0 ? "Active Vaccines" : ""}
                    buttonTitle="Register New Vaccine"
                    showDetails={false}
                    onActiveSwitchClick={onEdit}
                    setSelectedData={
                        (data) => {
                            setFormData({...data, edited: true});
                            setShowForm(true)
                            setUiSchema({...uiSchema, "name": {"ui:widget": "hidden"}})
                        }
                    }
                />
                {inactiveVaccines.length > 0 && <>
                    <div className="mt-3"/>
                    <ListView
                        listData={inactiveVaccines}
                        onRegisterBtnClick={() => {
                            setShowForm(true);
                            setFormData({});
                        }}
                        title="Inactive Vaccines"
                        buttonTitle=""
                        showDetails={false}
                        onActiveSwitchClick={onEdit}
                        setSelectedData={
                            (data) => {
                                setFormData({...data, edited: true});
                                setShowForm(true)
                            }
                        }
                    /></>}
                {blockedVaccines.length > 0 && <>
                    <div className="mt-3"/>
                    <ListView
                        listData={blockedVaccines}
                        onRegisterBtnClick={() => {
                            setShowForm(true);
                            setFormData({});
                        }}
                        title="Blocked Vaccines"
                        buttonTitle=""
                        showDetails={false}
                        onActiveSwitchClick={onEdit}
                        setSelectedData={
                            (data) => {
                                setFormData({...data, edited: true});
                                setShowForm(true)
                            }
                        }
                    />
                </>}
            </div>}
            {medicineList.length === 0 && <TextInCenter text={"No Vaccine Added"}/>}
        </div>
    );
}

export default VaccineRegistration;

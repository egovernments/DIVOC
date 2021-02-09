import React, {useEffect, useState} from "react";
import styles from "./ProgramRegistration.module.css";
import "./index.css"
import axios from "axios";
import {useKeycloak} from "@react-keycloak/web";
import Form from "@rjsf/core";
import ListView from '../ListView/ListView';
import schema from '../../jsonSchema/programSchema.json';
import Button from 'react-bootstrap/Button';
import {CustomDateWidget} from '../CustomDateWidget/index';
import {CustomTextWidget} from '../CustomTextWidget/index';
import {CustomTextAreaWidget} from '../CustomTextAreaWidget/index';
import {CustomDropdownWidget} from "../CustomDropdownWidget/index";
import {formatDate} from "../../utils/dateutil";
import * as R from "ramda";

function VaccineRegistration() {
    const {keycloak} = useKeycloak();
    const [formData, setFormData] = useState(null);
    const [programList, setProgramList] = useState([]);
    const [programSchema, setProgramSchema] = useState(schema);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        getListOfRegisteredPrograms();
    }, []);

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

    const validateFields = (data) => {
        const requiredFields = ["name", "startDate", "endDate"];
        let valid = true;
        requiredFields.forEach(field => {
            if (!R.pathOr(false, [field], data)) {
                valid = false;
                alert(`${field} is a required field`)
            }
        });
        return valid
    }

    const handleSubmit = () => {
        const requestBody = {...formData, ...formData.dateRange};
        if (validateFields(requestBody)) {
            axios
                .post("/divoc/admin/api/v1/programs", {...requestBody, status: "Active"}, config)
                .then((res) => {
                    alert("Successfully Registered");
                    console.log(res);
                    getListOfRegisteredPrograms()
                });
            setShowForm(false)
        }
    };

    const getListOfRegisteredPrograms = async () => {
        let res = await axios
            .get("/divoc/admin/api/v1/programs", config)
            .then((res) => {
                return res.data.map(d => {
                    const dateRange = {
                        startDate: d.startDate || formatDate(new Date()),
                        endDate: d.endDate || formatDate(new Date())
                    }
                    return {...d, edited: false, dateRange}
                })
            });
        const sortByNameCaseInsensitive = R.sortBy(R.compose(R.toLower, R.prop('name')));
        res = sortByNameCaseInsensitive(res);
        setProgramList(res)
        getListOfRegisteredVaccines();
    };

    const getListOfRegisteredVaccines = async () => {
        const res = await axios
            .get("/divoc/admin/api/v1/medicines", config)
            .then((res) => {
                return res.data
            })
        let vaccineIds = [], vaccineNames = [];
        res.forEach(r => {
            vaccineIds.push(r.osid);
            vaccineNames.push(r.name);
        });
        const updatedSchema = {...programSchema};
        updatedSchema.properties.medicineIds.items.enum = vaccineIds;
        updatedSchema.properties.medicineIds.items.enumNames = vaccineNames;
        setFormData({medicineIds: []});
        setProgramSchema({});
        setProgramSchema(updatedSchema);
    };


    function onEdit(data) {
        const requestBody = {...data, ...data.dateRange};
        if (validateFields(requestBody)) {
            axios
                .put("/divoc/admin/api/v1/programs", requestBody, config)
                .then((res) => {
                    alert("Successfully Edited");
                    console.log(res);
                    getListOfRegisteredPrograms()
                });
            setShowForm(false)
        }
    }

    return (
        <div className={styles["container"]}>
            {showForm && <div className={styles["form-container"]}>
                <div className="d-flex">
                    <h5 className={"mr-auto"}>{formData.edited ? formData.name : "Register New Vaccine Program"}</h5>
                    <Button variant="outline-primary" onClick={() => setShowForm(!showForm)}>BACK</Button>
                </div>

                <Form
                    schema={programSchema}
                    uiSchema={uiSchema}
                    widgets={widgets}
                    formData={formData}
                    onSubmit={(e) => {
                        if (e.formData.edited) {
                            onEdit(e.formData)
                        } else {
                            handleSubmit();
                        }
                    }}
                    onChange={(evt) => {
                        setFormData(evt.formData)
                    }}
                >
                    <button type="submit" className={styles['button']}>SAVE</button>
                </Form>
            </div>}
            {!showForm && <div className={styles["sub-container"]}>
                <ListView
                    listData={programList}
                    onRegisterBtnClick={() => {
                        setShowForm(true);
                        setFormData({medicineIds: []});
                    }}
                    title="List of Registered Vaccine Programs"
                    buttonTitle="Register New Vaccine Program"
                    showDetails={true}
                    onActiveSwitchClick={onEdit}
                    setSelectedData={(data) => {
                        setFormData({...data, edited: true});
                        setShowForm(true)
                    }}
                />
            </div>}
        </div>
    );
}

export default VaccineRegistration;
import React, {useEffect, useState} from "react";
import styles from "./VaccineRegistration.module.css";
import {useKeycloak} from "@react-keycloak/web";
import axios from "axios";
import ListView from '../ListView/ListView';
import * as R from "ramda";
import {TextInCenter} from "../TextInCenter";
import VaccineRegistrationForm from "../VaccineRegistrationForm"


function VaccineRegistration() {
    const {keycloak} = useKeycloak();
    const [formData, setFormData] = useState({});
    const [medicineList, setMedicineList] = useState([]);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        getListOfRegisteredVaccines();
    }, []);

    const config = {
        headers: {
            Authorization: `Bearer ${keycloak.token} `,
            "Content-Type": "application/json",
        },
    };

    const handleSubmit = (data) => {
        axios
            .post("/divoc/admin/api/v1/medicines", {...data, status: "Active"}, config)
            .then((res) => {
                alert("Successfully Registered");
                getListOfRegisteredVaccines()
            });
        setShowForm(!showForm)
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
        axios
            .put("/divoc/admin/api/v1/medicines", {...data}, config)
            .then((res) => {
                alert("Successfully Updated");
                getListOfRegisteredVaccines()
            });
        setShowForm(false)
    }


    // custom widget to handle time Intreval (instead of number widget)
    // custom template to handle the doses
    let blockedVaccines = medicineList.filter(data => data.status === "Blocked");
    let inactiveVaccines = medicineList.filter(data => data.status === "Inactive");
    let activeVaccines = medicineList.filter(data => data.status === "Active");
    return (
        <div className={styles["container"]}>
            {showForm &&
                <VaccineRegistrationForm
                    vaccine={formData}
                    onSubmit={(vaccine) => {
                        if (vaccine.edited) {
                            onEdit(vaccine)
                        } else {
                            handleSubmit(vaccine);
                        }
                    }}
                    onBackClick={() => {
                        setShowForm(!showForm);
                    }}
                />
            }
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
                            setShowForm(true);
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
            {medicineList.length === 0 && !showForm && <TextInCenter text={"No Vaccine Added"}/>}
        </div>
    );
}

export default VaccineRegistration;

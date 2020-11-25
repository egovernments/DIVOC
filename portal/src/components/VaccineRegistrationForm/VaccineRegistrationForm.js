import React, { useState } from "react";
import axios from "axios";
import styles from "./VaccineRegistrationForm.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import DropDown from "../DropDown/DropDown";
import {useKeycloak} from "@react-keycloak/web";

function RegistrationForm() {
    const { keycloak } = useKeycloak();
    const [formData, setFormInput] = useState({
        name: "",
        provider: "",
        schedule: {
            repeatTimes: 0,
            repeatInterval: 0
        },
        effectiveUntil: 0,
        status: "Active",
        price: 0,
    });

    const handleSubmit = (event) => {
        const config = {
            headers: { "Authorization": `Bearer ${keycloak.token} `, "Content-Type": "application/json" }
        };
        axios
            .post("/divoc/admin/api/v1/medicine", formData, config)
            .then((res) => {
                alert("Status code is",res.status)
                console.log(res);
            });
    };
    const handleFormInputChange = (e) => {
        let value = e.target.value;
        setFormInput({ ...formData, [e.target.name]: value });
    };


    return (
        <div className={styles["form-container"]}>
            <form
                className={styles["form"]}
                onSubmit={handleSubmit}
                method="post"
            >
                <h1 className={styles["heading"]}>Register New Vaccine</h1>

                <p className={styles["title"]}>Name of Vaccine / Medicine</p>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormInputChange}
                    className={styles["input"]}
                    required
                />

                <p className={styles["title"]}>Medicine ID (if applicable)</p>
                <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleFormInputChange}
                    className={styles["input"]}
                />

                <p className={styles["title"]}>Select Program</p>
                <DropDown formData={formData} setFormData={setFormInput} />

                <p className={styles["title"]}>Manufacturer</p>
                <input
                    type="text"
                    name="manf"
                    value={formData.manf}
                    onChange={handleFormInputChange}
                    className={styles["input"]}
                    required
                />

                <p className={styles["title"]}>Supplier / Distributor</p>
                <input
                    type="text"
                    name="provider"
                    value={formData.provider}
                    onChange={handleFormInputChange}
                    className={styles["input"]}
                    required
                />
                <p className={styles["title"]}>Schedule Details</p>
                <div className={styles["box"]}>
                    <div>
                        <p className={styles["title"]}>Repeat Times</p>
                        <input
                            type="number"
                            onChange={(evt) =>
                                setFormInput({
                                    ...formData,
                                    schedule: {
                                        ...formData.schedule,
                                        repeatTimes: parseInt(evt.target.value),
                                    },
                                })
                            }
                            className={styles["input"]}
                            required
                        />
                    </div>
                    <div>
                        <p className={styles["title"]}>Repeat Interval</p>
                        <input
                            type="number"
                            onChange={(evt) =>
                                setFormInput({
                                    ...formData,
                                    schedule: {
                                        ...formData.schedule,
                                        repeatInterval: parseInt(evt.target.value),
                                    },
                                })
                            }
                            className={styles["input"]}
                            required
                        />
                    </div>
                </div>
                <div>
                    <p className={styles["title"]}>Effective Until</p>
                    <DatePicker
                        className={styles["input"]}
                        selected={formData.effectiveUntil}
                        onChange={(date) =>
                            setFormInput({ ...formData, effectiveUntil: date })
                        }
                    />
                </div>
                <div className={styles["box"]}>
                    <div>
                        <p className={styles["title"]}>Price Range</p>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleFormInputChange}
                            className={styles["input"]}
                            required
                        />
                    </div>
                    <div>
                        <p className={styles["title"]}>
                            Vaccine Administering Details
                        </p>
                        <div className={styles["box"]}>
                            <input
                                type="file"
                                accept=".pdf"
                                id="file"
                                onChange={(evt) => {
                                    setFormInput({
                                        ...formData,
                                        file: evt.target.files[0],
                                    });
                                }}
                                required
                            />
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className={styles["button"]}
                >
                    SAVE
                </button>
            </form>
        </div>
    );
}

export default RegistrationForm;

import React, { useState } from "react";
import axios from "axios";
import styles from "./ProgramRegistrationForm.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";

function ProgramRegistration() {
    const [formData, setFormInput] = useState({
        name: "",
        description: "",
        logoURL: "",
        startDate: "",
        endDate: "",
        status: "Active",
        medicineIds: [""],
    });

    const handleSubmit = (event) => {
        const config = {
            headers: {
                Authorization: "Bearer abcd",
                "Content-Type": "application/json",
            },
        };
        axios
            .post("/divoc/admin/api/v1/program", formData, config)
            .then((res) => {
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
                <h1 className={styles["heading"]}>
                    Register New Vaccine Program
                </h1>

                <p className={styles["title"]}>Internal Program UID</p>
                <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleFormInputChange}
                    className={styles["input"]}
                    required
                />

                <p className={styles["title"]}>Program Name</p>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormInputChange}
                    className={styles["input"]}
                />

                <p htmlFor="description" className={styles["title"]}>
                    Program Description
                </p>
                <textarea
                    id="description"
                    name="description"
                    rows="4"
                    cols="50"
                    value={formData.description}
                    onChange={handleFormInputChange}
                    className={styles["input"]}
                ></textarea>
                <div className={styles["box"]}>
                    <input
                        type="file"
                        className={styles["input"]}
                        onChange={(evt) => {
                            setFormInput({
                                ...formData,
                                logoURL: evt.target.files[0],
                            });
                        }}
                        required
                    />
                </div>
                <div className={styles["box"]}>
                    <div>
                        <p className={styles["title"]}>Start Date</p>
                        <DatePicker
                            className={styles["input"]}
                            selected={formData.startDate}
                            onChange={(date) =>
                                setFormInput({ ...formData, startDate: date })
                            }
                        />
                    </div>
                    <div>
                        <p className={styles["title"]}>End Date</p>
                        <DatePicker
                            className={styles["input"]}
                            selected={formData.endDate}
                            onChange={(date) =>
                                setFormInput({ ...formData, endDate: date })
                            }
                        />
                    </div>
                </div>
                <p className={styles["title"]}>Status</p>
                <div className={styles["box"]}>
                    <input
                        type="radio"
                        id="active"
                        name="status"
                        value="active"
                        onClick={handleFormInputChange}
                    />
                    <label className={styles["radio-label"]} htmlFor="acive">
                        Active
                    </label>
                    <input
                        type="radio"
                        id="inactive"
                        name="status"
                        value="inactive"
                        onClick={handleFormInputChange}
                    />
                    <label className={styles["radio-label"]} htmlFor="inactive">
                        Inactive
                    </label>
                    <input
                        type="radio"
                        id="blocked"
                        name="status"
                        value="blocked"
                        onClick={handleFormInputChange}
                    />
                    <label className={styles["radio-label"]} htmlFor="blocked">
                        Blocked
                    </label>
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

export default ProgramRegistration;

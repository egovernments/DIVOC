import React, { useState } from "react";
import styles from "./RegistrationForm.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import DropDown from "../DropDown/DropDown";

function RegistrationForm() {
    const [formData, setFormInput] = useState({
        name: "",
        id: "",
        effectiveUntil: new Date(),
        program: "",
        manf: "",
        provider: "",
        details: "",
        price: "",
        file: "",
        status: "active",
    });


    const handleSubmit = (event) => {
        console.log("form data", formData);
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

                <div className={styles["box"]}>
                    <div>
                        <p className={styles["title"]}>Schedule Details</p>
                        <input
                            type="text"
                            name="details"
                            value={formData.details}
                            onChange={handleFormInputChange}
                            className={styles["input"]}
                            required
                        />
                    </div>
                    <div>
                        <p className={styles["title"]}>Effective Until</p>
                        <DatePicker
                            selected={formData.effectiveUntil}
                            onChange={(date) =>
                                setFormInput({ ...formData, effectiveUntil: date })
                            }
                        />
                    </div>
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
                                id="actual-btn"
                                onChange={(evt) =>
                                    setFormInput({
                                        ...formData,
                                        file: evt.target.files[0],
                                    })
                                }
                                hidden
                                required
                            />
                            <label
                                for="actual-btn"
                                className={styles["upload-button"]}
                                
                            >
                                Upload
                            </label>
                        </div>
                    </div>
                </div>
                <button onClick={handleSubmit} className={styles["button"]}>
                    SAVE
                </button>
            </form>
        </div>
    );
}

export default RegistrationForm;

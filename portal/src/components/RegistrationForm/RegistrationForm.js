import React, { useState } from "react";
import styles from "./RegistrationForm.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";

function RegistrationForm() {
    const [formInput, setFormInput] = useState({
        name: "",
        id: "",
        date: new Date(),
        program: "",
        manf: "",
        supplier: "",
        details: "",
        price: "",
    });

    const handleSubmit = (event) => {
        alert("You are submitting " + formInput.name + formInput.id);
    };
    const handleFormInputChange = (e) => {
        let value = e.target.value;
        setFormInput({ ...formInput, [e.target.name]: value });
    };

    return (
        <div className={styles["form-container"]}>
            <form className={styles["form"]} onSubmit={handleSubmit}>
                <h1 className={styles["heading"]}>Register New Vaccine</h1>

                <p className={styles["title"]}>Name of Vaccine / Medicine</p>
                <input
                    type="text"
                    name="name"
                    value={formInput.name}
                    onChange={handleFormInputChange}
                    className={styles["input"]}
                    required
                />

                <p className={styles["title"]}>Medicine ID (if applicable)</p>
                <input
                    type="text"
                    name="id"
                    value={formInput.id}
                    onChange={handleFormInputChange}
                    className={styles["input"]}
                />

                <p className={styles["title"]}>Select Program</p>

                <p className={styles["title"]}>Manufacturer</p>
                <input
                    type="text"
                    name="manf"
                    value={formInput.manf}
                    onChange={handleFormInputChange}
                    className={styles["input"]}
                    required
                />

                <p className={styles["title"]}>Supplier / Distributor</p>
                <input
                    type="text"
                    name="supplier"
                    value={formInput.supplier}
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
                            value={formInput.details}
                            onChange={handleFormInputChange}
                            className={styles["input"]}
                            required
                        />
                    </div>
                    <div>
                        <p className={styles["title"]}>Effective Until</p>
                        <DatePicker
                            selected={formInput.date}
                            onChange={(date) =>
                                setFormInput({ ...formInput, date: date })
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
                            value={formInput.price}
                            onChange={handleFormInputChange}
                            className={styles["input"]}
                            required
                        />
                    </div>
                    <div>
                        <p className={styles["title"]}>
                            Vaccine Administering Details
                        </p>
                        
                        <input type="file" id="myfile" name="myfile" required/>
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

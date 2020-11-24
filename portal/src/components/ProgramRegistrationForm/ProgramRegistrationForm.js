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
        medicineIds: [""]
    });

    const handleSubmit = (event) => {
        const config = {
            headers: { "Authorization": "Bearer abcd", "Content-Type": "application/json" }
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
                <h1 className={styles["heading"]}>Register New Vaccine Program</h1>

                <p className={styles["title"]}>Internal Program UID</p>
                <input
                    type="number"
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

                <p className={styles["title"]}>Program Description</p>
                <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleFormInputChange}
                    className={styles["input"]}
                    required
                />
                
               
        
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
                <div className={styles["box"]} >
                    <p className={styles["title"]}>Status</p>
                        <input type="radio" id="active" name="status" value="active" onClick={handleFormInputChange}/>Active
                        <input type="radio" id="inactive" name="status" value="inactive" onClick={handleFormInputChange}/>Inactive
                        <input type="radio" id="blocked" name="status" value="blocked" onClick={handleFormInputChange}/>Blocked
                    
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

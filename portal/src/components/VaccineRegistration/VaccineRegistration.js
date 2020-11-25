import React from 'react';
import axios from "axios";
import VaccineRegistrationForm from '../VaccineRegistrationForm/VaccineRegistrationForm';
import styles from './VaccineRegistration.module.css';
import {useKeycloak} from "@react-keycloak/web";

function VaccineRegistration() {
    const { keycloak } = useKeycloak();

    // const GetRequest = () => {
    //     const config = {
    //         headers: { "Authorization": `Bearer ${keycloak.token} `, "Content-Type": "application/json" }
    //     };
    //     axios
    //         .get("/divoc/admin/api/v1/medicine", config)
    //         .then((res) => {
    //             alert("Status code is",res.status)
    //             console.log(res);
    //         });
    // }
    return(
        <div className={styles['container']}>
            <div className={styles['registration-form']}>
            <VaccineRegistrationForm />
        </div>
        <div className={styles['registration-form']}>
            {/* <GetRequest/> */}
        </div>
        </div>
    );
}

export default VaccineRegistration;
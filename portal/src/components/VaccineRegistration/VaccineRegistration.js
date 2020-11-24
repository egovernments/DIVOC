import React from 'react';
import RegistrationForm from '../RegistrationForm/RegistrationForm';
import styles from './VaccineRegistration.module.css';

function VaccineRegistration() {
    return(
        <div className={styles['container']}>
            <div className={styles['registration-form']}>
            <RegistrationForm />
        </div>
        <div className={styles['registration-form']}>
            <p>List of Registered medicines</p>
        </div>
        </div>
    );
}

export default VaccineRegistration;
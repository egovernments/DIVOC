import React from 'react';
import ProgramRegistrationForm from '../ProgramRegistrationForm/ProgramRegistrationForm';
import styles from './ProgramRegistration.module.css';

function VaccineRegistration() {
    return(
        <div className={styles['container']}>
            <div className={styles['registration-form']}>
            <ProgramRegistrationForm />
        </div>
        <div className={styles['registration-form']}>
            <p>List of Registered Program</p>
        </div>
        </div>
    );
}

export default VaccineRegistration;
import React from 'react';
import Divoc from '../../Images/Divoc.svg';
import Image from '../../Images/Image.png';
import styles from './Header.module.css';
import Injection from '../../Images/Injection.svg';

function Header() {

    return(
        <div>
            <div className={styles['header']}>
            <img className={styles['divoc-logo']} src={Divoc} alt="DIVOC"/>
            <img className={styles['image1']} src={Image} alt="image1"/>
        </div>
            <div className={styles['top-heading']}>
                <img className={styles['image']} src={Injection} alt="Injection"/>
                <p className={styles['heading-content']}>Vaccine Program Overview</p>
                <div className={styles['population']}>
                    <p className={styles['population-field']}>POPULATION</p>
                    <p className={styles['population-figures']}>1,380,004,385</p>
                </div>
            </div>
        </div>
        
    );
}

export default Header;
import React from 'react';
import Divoc from '../../Images/Divoc.svg';
import Image from '../../Images/Image.png';
import styles from './Header.module.css';

function Header() {

    return(
        <div className={styles['header']}>
            <img className={styles['divoc-logo']} src={Divoc} alt="DIVOC"/>
            <img className={styles['image1']} src={Image} alt="image1"/>
        </div>
    );
}

export default Header;
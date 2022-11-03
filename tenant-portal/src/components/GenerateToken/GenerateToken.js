import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import GenTokenImg from "../../assets/img/generate_viewToken.png";
import GenericButton from '../GenericButton/GenericButton';
import styles from './GenerateToken.module.css';

function GenerateToken() {
  const bstyles = {
    style1: {
      color: 'red',
    },
    style2: {
      background: 'linear-gradient(270deg, #5367CA 0%, #73BAF4 100%)',
      margin: '',
      width: '100%'
    }
  }
  const bclassNames = {
    className1: 'm-1 w-100',
    className2: 'm-1 w-50'
  }
  return (
    <div className='row m-4 p-4'>
        <div className='col-md-6 p-2'>
            <div className={styles['title']}>Connect your system with the DIVOC Platform</div>
            <div className={styles['text']}>
                <p>You need to connect to your system with the DIVOC platform to start issuing verifiable credentials.</p>
                <p>Click on the button below to generate the token to connect your system with DIVOC</p>
            </div>            
            <GenericButton img='' text='Generate Token' type='secondary' styles={bstyles.style2} className={bclassNames.className1}/>
        </div>
        <img src={GenTokenImg} alt="Generate Token Image" className="col-md-6"/>
    </div>
  )
}

export default GenerateToken

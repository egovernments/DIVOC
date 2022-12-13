import React, { useState , useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import GenTokenImg from "../../assets/img/generate_viewToken.png";
import CopyIcon from "../../assets/img/copy.svg";
import DownloadIcon from "../../assets/img/download.svg";
import AlertIcon from '../../assets/img/alert.svg';
import GenericButton from '../GenericButton/GenericButton';
import styles from './GenerateToken.module.css';
import {useKeycloak} from '@react-keycloak/web'
import {useTranslation} from "react-i18next";
import { Form } from 'react-bootstrap';
import InfoCard from '../InfoCard/InfoCard';
import config from '../../config.json';
import { Link, useNavigate } from 'react-router-dom';
import ToastComponent from '../ToastComponent/ToastComponent';

const axios = require('axios');

function GenerateToken() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`${config.urlPath}/generate-token`)
  }, []);
  
  const [token, setToken] = useState("");
  const [toast, setToast] = useState("");
  const { t } = useTranslation();
  const {keycloak} = useKeycloak();

  const showToastFunc = () => {
    setToast (<ToastComponent header="Copied the token to Clipboard"
          variant="success" delay='200000' position="top-center" className="copy-toast" />);
          setTimeout(() => {
            setToast("");
          }, 200000);
  }
  async function copyToken() {
    var copyText = document.getElementById("token");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(copyText.value);
    } else {
      document.execCommand('copy', true, copyText.value);
    }
  }

  function downloadToken() {
    const element = document.createElement("a");
    const file = new Blob([document.getElementById('token').value],    
                {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = "myToken.txt";
    document.body.appendChild(element);
    element.click();
  }

  const getUserId = async () => {    
      const userInfo = await keycloak.loadUserInfo();
      return userInfo.email;
  }
  const getToken = async () => {
      const userId = await getUserId();
      return axios.get(`${config.tokenEndPoint}/${userId}`).then(res =>
      res.data.access_token.access_token
  ).catch(error => {
      console.error(error);
      throw error;
  });
  };
  const outputToken = async () => {
      const access_token = await getToken();
      setToken(access_token)
  }
 
  return (
    <div className='d-flex flex-wrap'>
      {toast}
        <div className='col-md-6 col-sm-12 page-content'>
            <div className='title'>{t('genTokenPage.title')}</div>
            {token==='' && <div>
              <div className='text'>
              <div className='mb-3'>{t('genTokenPage.text')}</div>
              <div className='mb-3'>{t('genTokenPage.buttonClickInfo')}</div>
              </div>           
              <Link to={`${config.urlPath}/generate-token/view-token`}
               onClick={ async () => await outputToken()} >
                <GenericButton img='' text={t('genTokenPage.buttonText')} type='button' variant='primary' />
              </Link>
            </div>}
            {token && <div>
              <div className='text'>
              <p className='mb-0'>{t('viewTokenPage.text1')}</p>
              <p className='mb-0'>{t('viewTokenPage.text2')}</p>
              </div>
              <Form.Control className={`my-3 ${styles['token']}`} size="lg" type="text" readOnly id='token' defaultValue={token} />
              <div className='container-fluid my-3 px-0'>
                <div className='px-0 mx-0 d-flex flex-wrap'>
                  <div className='col-12 col-lg-6 my-2 pe-0 pe-lg-2' 
                  onClick={async () => {await copyToken(); showToastFunc();}}>
                  <GenericButton img={CopyIcon} text='Copy' type='button' variant='primary' />
                  </div>
                  <div className='col-12 col-lg-6 my-2 ps-0 ps-lg-2' onClick={() =>  downloadToken()}>
                  <GenericButton img={DownloadIcon} text='Download' type='button' variant='primary' />
                  </div>
                  </div>
              </div>
              <InfoCard  icon={AlertIcon}
              title={t('viewTokenPage.alertCard.title')}
              text={t('viewTokenPage.alertCard.text')} 
              imptext={t('viewTokenPage.alertCard.imptext')} className='alertCard mt-4' />
            </div>}
        </div>
        <div className="col-md-6 col-sm-12 text-center">
        <img src={GenTokenImg} alt="GenToken" className='page-image' />
        </div>
    </div>
  )
}

export default GenerateToken

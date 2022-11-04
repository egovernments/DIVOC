import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import GenTokenImg from "../../assets/img/generate_viewToken.png";
import CopyIcon from "../../assets/img/copyIcon.png"
import DownloadIcon from "../../assets/img/downloadIcon.png"
import GenericButton from '../GenericButton/GenericButton';
import styles from './GenerateToken.module.css';
import {useKeycloak} from '@react-keycloak/web'
import {useTranslation} from "react-i18next";
import { Container, Card, Col, Row, Form } from 'react-bootstrap';
const axios = require('axios');

function GenerateToken() {
  const [token, setToken] = useState("");
  const { t } = useTranslation();
  const {keycloak} = useKeycloak();
  function copyToken() {
    var copyText = document.getElementById("token");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    alert("Copied the token: " + copyText.value);
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
      return axios.get(`http://localhost/vc-management/v1/tenant/generatetoken/${userId}`).then(res =>
      res.data.access_token.access_token
  ).catch(error => {
      console.error(error);
      throw error;
  });
  }
  const displayToken = async () => {
      const access_token = await getToken();
      setToken(access_token)
  }

  return (
    <div className='row m-4 p-4'>
        <div className='col-md-6 p-2'>
          <div>
            <div className={styles['title']}>{t('genTokenPage.title')}</div>
            {token==='' && <div>
              <div className={styles['text']}>
              <p>{t('genTokenPage.text')}</p>
              <p>{t('genTokenPage.buttonClickInfo')}</p>
              </div>           
              <div onClick={() => displayToken()}><GenericButton img='' text={t('genTokenPage.buttonText')} type='primary' /></div>
            </div>}
            {token && <div>
              <div className={styles['text']}>
              <p>{t('viewTokenPage.text')}</p>
              </div>
              <div id='token'>{token}</div>
              <Container fluid className='my-3'>
                <Row gutterX='3'>
                    <Col onClick={() => copyToken()}>
                      <GenericButton img={CopyIcon} text='Copy' type='primary' />
                    </Col>
                    <Col onClick={() => downloadToken()}>
                      <GenericButton img={DownloadIcon} text='Download' type='primary' />
                    </Col>
                </Row>
              </Container>
            </div>}
          </div>
        </div>
        <img src={GenTokenImg} alt="Generate Token Image" className="col-md-6"/>
    </div>
  )
}

export default GenerateToken

import React, { useState, useEffect} from 'react';
import {useTranslation} from "react-i18next";
import GenericButton from '../GenericButton/GenericButton';
import { Link } from 'react-router-dom';
import config from '../../config.json'
import { Col, Row } from 'react-bootstrap';
import DraftIcon from '../../assets/img/Loaders.svg';
import PublishedIcon from '../../assets/img/done_all.svg';
import {useKeycloak} from '@react-keycloak/web';
const axios = require('axios');


const ManageSchemaHome = () => {
    const { keycloak } = useKeycloak();
    const { t } = useTranslation();
    const[schemaCheck, setSchemaCheck] = useState(false);
    const[schemasList, setSchemasList] = useState([]);
    const [searchSchemaInput, setSearchSchemaInput] = useState('');
    const filteredData = schemasList.filter(schemas => {
        return Object.keys(schemas).some(key =>
          (schemas.name).toLowerCase().includes(searchSchemaInput.toLowerCase())
        );
      });
    useEffect(() => {
        const getSchemaList = async () =>{
            const userToken = await getToken();
            console.log(userToken);
            return axios.get(`/vc-management/v1/schema`, {headers:{"Authorization" :`Bearer ${userToken}`}}).then(res =>
                res.data.schemas
            ).catch(error => {
                console.error(error);
                throw error;
            });
        };
        const setSchemListFunc = async () => {
            const schemasList  = await getSchemaList();
            setSchemasList(schemasList);
        }    
        setSchemListFunc();
        if(schemasList.length>0){setSchemaCheck(true)};
    }, [])
    
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
  return (
    <div className={!schemaCheck? "page-content": ""}>
        {!schemaCheck && 
        <div >
            <h1>{t('noSchemaPage.title')}</h1>
            <h3>{t('noSchemaPage.subtitle')}</h3>
            <ul className="mr-4">
                <li className="pb-2">{t('noSchemaPage.info.0')}</li>
                <li className="pb-2">{t('noSchemaPage.info.1')}</li>
                <li className="pb-2">{t('noSchemaPage.info.2')}</li>
                <li className="pb-2">{t('noSchemaPage.info.3')}</li>
                <li className="pb-2">{t('noSchemaPage.info.4')}</li>
                <li className="pb-2">{t('noSchemaPage.info.5')}</li>
                <li className="pb-2">{t('noSchemaPage.info.6')}</li>
            </ul>
        </div>}
        {schemaCheck && 
        <div className='d-flex flex-wrap'>
            <div className='col-md-3 col-sm-4 col-xs-12 px-4'>
                <h3>Schemas Created</h3>
                <input 
                className='search-icon w-100'
                style={{borderRadius:'4px'}}
                type='text'
                value={searchSchemaInput}
                placeholder='Search Schema name'
                onChange={(e) => setSearchSchemaInput(e.target.value)}
                />
                <div className='schema-list'>
                    {filteredData.map(schema => (
                        <div key={schema.name}>
                            <div className='schema-list-items justify-content-between d-flex' >
                                <div>{schema.name}</div>
                             <div>{(schema.status).toLowerCase()=="published"? 
                            <img src={PublishedIcon}/>:<img src={DraftIcon}/>}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className='col-md-9 col-sm-8 col-xs-12'>
                <h1>{t('schemasHomePage.createNewSchemas.title')}</h1>
                <ol className="mr-4">
                    <li className="pb-2">{t('schemasHomePage.createNewSchemas.info.0')}</li>
                    <li className="pb-2">{t('schemasHomePage.createNewSchemas.info.1')}</li>
                    <li className="pb-2">{t('schemasHomePage.createNewSchemas.info.2')}</li>
                    <li className="pb-2">{t('schemasHomePage.createNewSchemas.info.3')}</li>
                    <li className="pb-2">{t('schemasHomePage.createNewSchemas.info.4')}</li>
                    <li className="pb-2">{t('schemasHomePage.createNewSchemas.info.5')}</li>
                    <li className="pb-2">{t('schemasHomePage.createNewSchemas.info.6')}</li>
                    <li className="pb-2">{t('schemasHomePage.createNewSchemas.info.7')}</li>
                </ol>
                <h1>{t('schemasHomePage.manageSchema.title')}</h1>
                <ol className="mr-4">
                    <li className="pb-2">{t('schemasHomePage.manageSchema.info.0')}</li>
                    <li className="pb-2">{t('schemasHomePage.manageSchema.info.1')}</li>
                    <li className="pb-2">{t('schemasHomePage.manageSchema.info.2')}</li>
                    <li className="pb-2">{t('schemasHomePage.manageSchema.info.3')}</li>
                </ol>
            </div>
        </div>
        }
        <div >
        <Row gutter='3' xs={1} sm={2} md={3} lg={4} className="justify-content-end">
            <Col className="my-1 h-100">
                <Link to={`${config.urlPath}/manage-schema/view-inbuilt-attributes`} >
                    <GenericButton img='' text={t('noSchemaPage.viewAttributesBtn')} type='outline-primary' style={{height:'100%'}}/> 
                </Link>
            </Col>
            <Col className="my-1 h-100">
                <Link to={`${config.urlPath}/manage-schema/view-inbuilt-attributes`} >
                    <GenericButton img='' text={t('noSchemaPage.createSchemaBtn')} type='primary' style={{height:'100%'}}/> 
                </Link>
            </Col>
        </Row>
        </div>
    </div>
  )
    }

export default ManageSchemaHome
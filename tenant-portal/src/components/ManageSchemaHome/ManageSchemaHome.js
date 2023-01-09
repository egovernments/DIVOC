import React, { useState, useEffect} from 'react';
import {useTranslation} from "react-i18next";
import GenericButton from '../GenericButton/GenericButton';
import { Link, useNavigate } from 'react-router-dom';
import config from '../../config.json'
import { Col, Row, FormControl } from 'react-bootstrap';
import DraftIcon from '../../assets/img/Loaders.svg';
import PublishedIcon from '../../assets/img/done_all.svg';
import {getToken, getUserId} from '../../utils/keycloak';
import SchemaAttributes from '../SchemaAttributes/SchemaAttributes';
import BreadcrumbComponent from '../BreadcrumbComponent/BreadcrumbComponent';
import TestAndPublish from '../TestAndPublish/TestAndPublish';
import {ATTRIBUTE_MODIFY_ACTIONS, SCHEMA_STATUS} from "../../constants";
import AddSchemaFieldComponent from "../AddSchemaFieldComponent/AddSchemaFieldComponent";
import {transformSchemaToAttributes} from "../../utils/schema";
const axios = require('axios');

const ManageSchemaHome = () => {
    const { t } = useTranslation();
    const[schemasList, setSchemasList] = useState([]);
    const [schemaPreview, setschemaPreview] = useState(false);
    const [searchSchemaInput, setSearchSchemaInput] = useState('');
    const [schemaClicked, setSchemaClicked] = useState(false);
    const [selectedSchema, setSelectedSchema] =useState();
    const [createSchemaField, setCreateSchemaField] =useState(false);
    const [attributes, setAttributes] = useState([]);
    const schemaAttViewFunc = (schema) => {
        setSelectedSchema(schema);
        setSchemaClicked(true);
        const selectedSchemaAttributes = transformSchemaToAttributes(JSON.parse(schema.schema));
        setAttributes([...selectedSchemaAttributes]);
    }
    const createNewFieldInSchema = () => {
        setCreateSchemaField(true);
    }

    const addNewAttributeToSchema = (attr) => {
        setCreateSchemaField(false);
        setAttributes([attr, ...attributes]);
    }
    const filteredData = schemasList.filter(schemas => {
        return Object.keys(schemas).some(key =>
          (schemas?.name)?.toLowerCase().includes(searchSchemaInput?.toLowerCase())
        );
      });
    const modifyAttribute = (index, action, newDetails) => {
        switch (action) {
            case ATTRIBUTE_MODIFY_ACTIONS.DELETE:
                attributes.splice(index, 1);
                setAttributes([...attributes]);
                break;
            case ATTRIBUTE_MODIFY_ACTIONS.EDIT:
                attributes[index].editMode = true;
                setAttributes([...attributes]);
                break;
            case ATTRIBUTE_MODIFY_ACTIONS.UPDATE:
                for (const [key, value] of Object.entries(newDetails)) {
                    attributes[index][key]=value;
                }
                attributes[index].editMode = false;
                setAttributes([...attributes]);
                break;
            case ATTRIBUTE_MODIFY_ACTIONS.CANCEL:
                attributes[index].editMode = false;
                setAttributes([...attributes]);
                break;
            default:
                console.log("Invalid action");
        }
    }
    useEffect(() => {
        (async () =>{
            const userToken = await getToken();
            return axios.get(`/vc-management/v1/schema`, {headers:{"Authorization" :`Bearer ${userToken}`}}).then(res =>
                setSchemasList([...res.data?.schemas])
            ).catch(error => {
                console.error(error);
                throw error;
            });
        }) ();
    }, [])
    
  return (
    <div>
        {
            !createSchemaField &&
            <div>
                {!schemasList.length>0 ? <BreadcrumbComponent showBreadCrumb={true} />: ""}
                <div className={schemasList.length>0 ? "row w-100": "page-content"}>
                    {!schemasList.length>0 && !schemaPreview &&
                    <div className='mx-5'>
                        <div className='title'>{t('noSchemaPage.title')}</div>
                        <div className='text p-0 lh-lg'>
                        <div>{t('noSchemaPage.subtitle')}</div>
                        <ul>
                            <li className="pb-2">{t('noSchemaPage.info.0')}</li>
                            <li className="pb-2">{t('noSchemaPage.info.1')}</li>
                            <li className="pb-2">{t('noSchemaPage.info.2')}</li>
                            <li className="pb-2">{t('noSchemaPage.info.3')}</li>
                            <li className="pb-2">{t('noSchemaPage.info.4')}</li>
                            <li className="pb-2">{t('noSchemaPage.info.5')}</li>
                            <li className="pb-2">{t('noSchemaPage.info.6')}</li>
                        </ul></div>
                    </div>}
                    {schemasList.length>0 && !schemaPreview &&
                    <div className='d-flex flex-wrap'>
                        <div className={`col-3 px-4 border-end`}>
                            <h3>Schemas Created</h3>
                            <FormControl
                            className='search-icon w-100 border border-1'
                            style={{borderRadius:'4px', borderColor:'#C4C4C4'}}
                            type='text'
                            value={searchSchemaInput}
                            placeholder='Search Schema Name'
                            onChange={(e) => setSearchSchemaInput(e.target.value)}
                            />
                            <div className='schema-list'>
                                {filteredData.map(schema => (
                                    <div key={schema.name} onClick={() =>{schemaAttViewFunc(schema);}}>
                                        <div className='schema-list-items justify-content-between d-flex' >
                                            <div>{schema.name}</div>
                                         <div>{(schema.status).toLowerCase()===SCHEMA_STATUS.PUBLISHED.toLowerCase()?
                                        <img src={PublishedIcon}/>:<img src={DraftIcon}/>}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='col-9 px-4'>
                            <BreadcrumbComponent showBreadCrumb={true} />
                        {!schemaClicked && <div className='px-3'>
                            <h1 className='m-0'>{t('schemasHomePage.createNewSchemas.title')}</h1>
                            <ol className="ms-2 text lh-sm">
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
                            <ol className="ms-2 text lh-sm">
                                <li className="pb-2">{t('schemasHomePage.manageSchema.info.0')}</li>
                                <li className="pb-2">{t('schemasHomePage.manageSchema.info.1')}</li>
                                <li className="pb-2">{t('schemasHomePage.manageSchema.info.2')}</li>
                                <li className="pb-2">{t('schemasHomePage.manageSchema.info.3')}</li>
                                <li className="pb-2">{t('schemasHomePage.manageSchema.info.4')}</li>
                            </ol>

                        </div>}

                        {
                            schemaClicked &&
                            <SchemaAttributes
                                schemaDetails={selectedSchema}
                                setschemaPreview={setschemaPreview}
                                setUpdatedSchema={schemaAttViewFunc}
                                attributes={attributes}
                                modifyAttribute={modifyAttribute}
                                createNewFieldInSchema={createNewFieldInSchema} />
                        }
                        </div>
                    </div>}
                    { !schemaClicked && <div><hr/>
                    <Row gutter='3' xs={1} sm={2} md={5} className="justify-content-end">
                    <Col className="my-1 h-100">
                        <Link to={`${config.urlPath}/manage-schema/view-inbuilt-attributes`} >
                            <GenericButton img='' text={t('noSchemaPage.viewAttributesBtn')} variant='outline-primary' />
                        </Link>
                    </Col>
                    <Col className="my-1 h-100">
                        <Link to={`${config.urlPath}/manage-schema/create-new-schema`} >
                            <GenericButton img='' text={t('noSchemaPage.createSchemaBtn')} variant='primary' />
                        </Link>
                    </Col>
                    </Row></div>}

                    {
                        schemaPreview &&
                        <div>
                            <BreadcrumbComponent showBreadCrumb={true} />
                            <TestAndPublish schema={selectedSchema} setSchemaPreview={setschemaPreview}/>
                        </div>
                    }
                </div>
            </div>
        }
        {
            createSchemaField &&
            <div>
                <AddSchemaFieldComponent addNewAttributeToSchema={addNewAttributeToSchema}></AddSchemaFieldComponent>
            </div>
        }
    </div>
  )
    }

export default ManageSchemaHome
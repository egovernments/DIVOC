import React, { useState } from 'react';
import {useTranslation} from "react-i18next";

const ManageSchemaHome = () => {
    const { t } = useTranslation();
    const[schemaCheck, setSchemaCheck] = useState(false);
    const schemaFunc = () => {
        setSchemaCheck(!schemaCheck)
        return
    }
    
  return (
    <div>
        <button onClick={schemaFunc}>check</button>
        {!schemaCheck && <div>
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
        <div>
            <h1>{t('schemasHomePage.createNewSchemas.title')}</h1>
            <ul className="mr-4">
                <li className="pb-2">{t('schemasHomePage.createNewSchemas.info.0')}</li>
                <li className="pb-2">{t('schemasHomePage.createNewSchemas.info.1')}</li>
                <li className="pb-2">{t('schemasHomePage.createNewSchemas.info.2')}</li>
                <li className="pb-2">{t('schemasHomePage.createNewSchemas.info.3')}</li>
                <li className="pb-2">{t('schemasHomePage.createNewSchemas.info.4')}</li>
                <li className="pb-2">{t('schemasHomePage.createNewSchemas.info.5')}</li>
                <li className="pb-2">{t('schemasHomePage.createNewSchemas.info.6')}</li>
                <li className="pb-2">{t('schemasHomePage.createNewSchemas.info.7')}</li>
            </ul>
            <h1>{t('schemasHomePage.manageSchema.title')}</h1>
            <ul className="mr-4">
                <li className="pb-2">{t('schemasHomePage.manageSchema.info.0')}</li>
                <li className="pb-2">{t('schemasHomePage.manageSchema.info.1')}</li>
                <li className="pb-2">{t('schemasHomePage.manageSchema.info.2')}</li>
                <li className="pb-2">{t('schemasHomePage.manageSchema.info.3')}</li>
            </ul>
        </div>
        }
    </div>
  )
}

export default ManageSchemaHome
import {useTranslation} from "react-i18next";
import Attribute from "../Attribute/Attribute";
import {INBUILT_ATTRIBUTES} from "../../constants"
import config from "../../config.json";
import GenericButton from "../GenericButton/GenericButton";
import {Link} from "react-router-dom";
import React from "react";
import styles from "./InbuiltAttributesComponent.module.css";

function InbuiltAttributesComponent() {
    const { t } = useTranslation();
    return(
        <div className="d-flex flex-column justify-content-between">
            <div className={styles["inbuiltAttributes"]}>
                <p className="title">{t('inbuiltAtrributesPage.inbuiltAttributes')}</p>
                <p className="mb-0">{t('inbuiltAtrributesPage.inbuiltAttributesHeading1')}</p>
                <p>{t('inbuiltAtrributesPage.inbuiltAttributesHeading2')}</p>
                <div className="p-3 border overflow-auto d-xxl-inline-block">
                    <p className="table-heading">{t('inbuiltAtrributesPage.fields')}</p>
                    <table className={styles["inbuiltAttributesTable"]}>
                        <thead className="table-col-header">
                            <th>{t('inbuiltAtrributesPage.label')}</th>
                            <th>{t('inbuiltAtrributesPage.fieldType')}</th>
                            <th className="text-center">{t('inbuiltAtrributesPage.mandatory')}</th>
                            <th className="text-center">{t('inbuiltAtrributesPage.indexed')}</th>
                            <th className="text-center">{t('inbuiltAtrributesPage.unique')}</th>
                            <th>{t('inbuiltAtrributesPage.description')}</th>
                        </thead>
                        <tbody>
                        {
                            INBUILT_ATTRIBUTES.map((attribute) => {
                                return <Attribute schemaAttribute={attribute}></Attribute>
                            })
                        }
                        </tbody>
                    </table>
                </div>
            </div>
            <div>
                <hr/>
                <div className="d-flex justify-content-center justify-content-md-end px-md-4 px-lg-5">
                    <Link to={`${config.urlPath}/manage-schema`}>
                        <GenericButton img='' text={t('inbuiltAtrributesPage.backButton')} type='primary' />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default InbuiltAttributesComponent;
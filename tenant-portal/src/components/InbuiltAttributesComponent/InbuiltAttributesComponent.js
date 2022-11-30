import {useTranslation} from "react-i18next";
import SchemaAttribute from "../SchemaAttribute/SchemaAttribute";
import {INBUILT_ATTRIBUTES} from "../../constants"
import config from "../../config.json";
import GenericButton from "../GenericButton/GenericButton";
import {Link} from "react-router-dom";
import React from "react";

function InbuiltAttributesComponent() {
    const { t } = useTranslation();
    return(
        <div>
            <div>
                <p className="title">{t('Inbuilt Attributes')}</p>
                <p>View the inbuilt attributes below that are required as a part of W3C standards.</p>
                <p>These inbuilt attributes are common across schemas and no new fields can be added and existing fields be deleted.</p>
                <div className="p-3">
                    <p>Fields</p>
                    <table>
                        <thead>
                            <th>Label</th>
                            <th>Field Type</th>
                            <th>Mandatory</th>
                            <th>Indexed</th>
                            <th>Unique</th>
                            <th>Description</th>
                        </thead>
                        <tbody>
                        {
                            INBUILT_ATTRIBUTES.map((attribute) => {
                                return <SchemaAttribute schemaAttribute={attribute}></SchemaAttribute>
                            })
                        }
                        </tbody>
                    </table>
                </div>
            </div>
            <div>
                <Link to={`${config.urlPath}/manage-schema`}>
                    <GenericButton img='' text='Back to Manage Schema' type='primary' />
                </Link>
            </div>
        </div>
    );
}

export default InbuiltAttributesComponent;
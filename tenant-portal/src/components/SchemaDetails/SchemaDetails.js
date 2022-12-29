import React, {useState} from "react";
import axios from 'axios';
import { useKeycloak } from "@react-keycloak/web";
import upload_image from "../../assets/img/upload_image.png";
import "./SchemaDetails.css"
import GenericButton from '../GenericButton/GenericButton';
import {  Col, Container, Form, FormControl, FormGroup, Row, Image } from "react-bootstrap";
import {useTranslation} from "react-i18next";
function SchemaDetails({addInitialSchemaDetails}) {
    const { keycloak } = useKeycloak();

    const config = {
        headers: {
            Authorization: `Bearer ${keycloak.token} `,
            "Content-Type": "application/json",
        },
    };

    const {t} = useTranslation()
    const [schemaName, setSchemaName] = useState("");
    const [schemaDescription, setSchemaDescription] = useState("");

    return(
        <div>
                <Container fluid="md" className="py-3">
                <Row className="justify-content-between px-5" >
                    <Col md={6}>
                        <Row className="title gx-0">{t('createSchema.title')}</Row>
                        <Form id="schema-details"   >
                            <FormGroup className="py-3">
                                <Form.Label className="input-label">{t('schemaDetails.label1')}</Form.Label>
                                <FormControl
                                    id="name"
                                    type="text"
                                    className="w-75 input-box"
                                    onChange={(e) => setSchemaName(e.target.value)}
                                    value={schemaName}/>
                            </FormGroup>
                            <FormGroup className="py-3">
                                <Form.Label className="input-label">{t('schemaDetails.label2')}<span className="secondary-label">{t('schemaDetails.labelOptional')}</span></Form.Label>
                                <FormControl
                                    type="text"
                                    className="w-75 input-box"
                                    value={schemaDescription}
                                    onChange={(e) => setSchemaDescription(e.target.value)}
                                    style={{height: "100px"}}/>
                            </FormGroup>
                        </Form>
                    </Col>
                    <Col md={5}>
                        <Image className="w-100" src={upload_image} />
                    </Col>
                </Row>
                
            </Container>
            <Row className="custom-footer justify-content-end w-100 gx-0 p-4" >
                <div onClick={() => {addInitialSchemaDetails(schemaName, schemaDescription)}} className="text-end">
                    <GenericButton img={''} text='Save' type='button' form="schema-details" variant='primary' styles={{width:"15%"}}/>
                </div>
            </Row>
        </div>
    );
}

export default SchemaDetails;
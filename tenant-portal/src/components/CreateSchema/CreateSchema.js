import React from "react";
import axios from 'axios';
import { useKeycloak } from "@react-keycloak/web";
import upload_image from "../../assets/img/upload_image.png";
import "./CreateSchema.css"
import { Button, Col, Container, Form, FormControl, FormGroup, Row, Image } from "react-bootstrap";

function CreateSchema() {
    const { keycloak } = useKeycloak();

    const config = {
        headers: {
            Authorization: `Bearer ${keycloak.token} `,
            "Content-Type": "application/json",
        },
    };

    const createSchema = async () => {
        axios
            .post("/vc-management/v1/schema", {}, config)
            .then(res => res.data)
    }

    return(
        <div>
            <Container fluid="md" className="py-3">
                <Row className="justify-content-between px-5" >
                    <Col md={6}>
                        <Row className="title gx-0">Create New Schema</Row>
                        <Form id="create-schema" action="/manage-schema/create-schema/custom-attributes">
                            <FormGroup className="py-3">
                                <Form.Label className="input-label">Name of the Schema</Form.Label>
                                <FormControl type="text" className="w-75 input-box"/>
                            </FormGroup>
                            <FormGroup className="py-3">
                                <Form.Label className="input-label">Description<span className="secondary-label">(optional)</span></Form.Label>
                                <FormControl type="text" className="w-75 input-box" style={{height: "100px"}}/>
                            </FormGroup>
                        </Form>
                    </Col>
                    <Col md={5}>
                        <Image className="w-100" src={upload_image} />
                    </Col>
                </Row>
                
            </Container>
            <Row className="custom-footer justify-content-end w-100 gx-0 p-4">             
                <Button type="submit" form="create-schema" >Save</Button>
            </Row>
        </div>
    );
}

export default CreateSchema;
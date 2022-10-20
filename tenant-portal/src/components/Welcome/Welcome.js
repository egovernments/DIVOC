import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Card, Container, Col, Button, Row} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import WelcomeImg from "../../assets/images/welcome_Image.png";
import './Welcome.css';

function Welcome() {
    const navigate = useNavigate();
    const genToken = () => {
        navigate('/tenant-portal/vcwelcome');
    };
    const manageSchema = () => {
        navigate('/tenant-portal/vcwelcome');
    };
    return(
        <div className="row m-4">
            <div className="col-md-6">
                <div className="p-2">
                    <h2>Welcome to DIVOC VC Issuance platform</h2><br/>
                    <p>Create Verifiable Credentials</p>
                    <p>View <a href="#" className="mx-2"> Training Material </a> Or <a href="#" className="mx-2"> Watch Videos </a></p>
                </div>
                <Container fluid>
                    <Row gutterX='3'>
                        <Col>
                            <Card onClick={genToken} style={{ cursor: "pointer" }}>
                                <Card.Body>
                                    <Card.Title className='card-title'>Generate Token</Card.Title>
                                    <Card.Text className='card-text'>Generate Token to connect your system with the DIVOC Platform</Card.Text>
                                </Card.Body>
                            </Card> 
                        </Col>
                        <Col>
                            <Card onClick={manageSchema} style={{ cursor: "pointer" }}>
                                <Card.Body>
                                    <Card.Title className='card-title'>Manage Schema</Card.Title>
                                    <Card.Text className='card-text'>Create new schemas, View/Edit existing schemas</Card.Text>
                                </Card.Body>
                            </Card> 
                        </Col>
                    </Row>
                </Container>
            </div>
            <img src={WelcomeImg} alt="Home Image" className="col-md-6"/>
        </div>
    );
}
export default Welcome;

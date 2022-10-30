import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Card, Container, Col, Button, Row} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import WelcomeImg from "../../assets/images/welcome_Image.png";
import styles from './Welcome.module.css';
import {useTranslation} from "react-i18next";

function Welcome() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const genToken = () => {
        navigate('/tenant-portal/vcwelcome');
    };
    const manageSchema = () => {
        navigate('/tenant-portal/vcwelcome');
    };
    return(
        <div className="row mx-5 px-5 my-5">
            <div className="col-md-6">
                <div className="p-2">
                    <h2>{t('welcomePage.title')}</h2><br/>
                    <p>{t('welcomePage.text')}</p>
                    <p>{t('welcomePage.view')} <a href="#" className="mx-2">{t('welcomePage.trainingMaterial')}</a> Or <a href="#" className="mx-2">{t('welcomePage.videosLink')}</a></p>
                </div>
                <Container fluid>
                    <Row gutterX='3'>
                        <Col>
                            <Card onClick={genToken} style={{ cursor: "pointer" }} className={styles['card']}>
                                <Card.Body>
                                    <Card.Title className={styles['card-title']}>{t('welcomePage.genTokenCard.title')}</Card.Title>
                                    <Card.Text className={styles['card-text']}>{t('welcomePage.genTokenCard.text')}</Card.Text>
                                </Card.Body>
                            </Card> 
                        </Col>
                        <Col>
                            <Card onClick={manageSchema} style={{ cursor: "pointer" }}  className={styles['card']}>
                                <Card.Body>
                                    <Card.Title className={styles['card-title']}>{t('welcomePage.manageSchemaCard.title')}</Card.Title>
                                    <Card.Text className={styles['card-text']}>{t('welcomePage.manageSchemaCard.text')}</Card.Text>
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

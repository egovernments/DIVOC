import React, {useEffect} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Card, Container, Col, Button, Row} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import HomeImg from "../../assets/img/homeImage.png";
import styles from './Home.module.css';
import {useTranslation} from "react-i18next";
import config from '../../config.json';

function Home() {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const genToken = () => {
        navigate('/tenant-portal');
    };
    const manageSchema = () => {
        navigate('/tenant-portal');
    };

    useEffect(() => {
        navigate(config.urlPath + "/login");
    }, [navigate]);

    return(
        <div className="row mx-5 px-5 my-5">
            <div className="col-md-6">
                <div className="p-2">
                    <h2>{t('homePage.title')}</h2><br/>
                    <p>{t('homePage.text')}</p>
                    <p>{t('homePage.view')} <a href="#" className="mx-2">{t('homePage.trainingMaterial')}</a> {t('homePage.or')} <a href="#" className="mx-2">{t('homePage.videosLink')}</a></p>
                </div>
                <Container fluid>
                    <Row gutterX='3'>
                        <Col>
                            <Card onClick={genToken} style={{ cursor: "pointer" }} className={styles['card']}>
                                <Card.Body>
                                    <Card.Title className={styles['card-title']}>{t('homePage.genTokenCard.title')}</Card.Title>
                                    <Card.Text className={styles['card-text']}>{t('homePage.genTokenCard.text')}</Card.Text>
                                </Card.Body>
                            </Card> 
                        </Col>
                        <Col>
                            <Card onClick={manageSchema} style={{ cursor: "pointer" }}  className={styles['card']}>
                                <Card.Body>
                                    <Card.Title className={styles['card-title']}>{t('homePage.manageSchemaCard.title')}</Card.Title>
                                    <Card.Text className={styles['card-text']}>{t('homePage.manageSchemaCard.text')}</Card.Text>
                                </Card.Body>
                            </Card> 
                        </Col>
                    </Row>
                </Container>
            </div>
            <img src={HomeImg} alt="Home Image" className="col-md-6"/>
        </div>
    );
}

export default Home;
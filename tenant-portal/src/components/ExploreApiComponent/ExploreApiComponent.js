import {Container, Form, Row} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {VC_MANAGEMENT_SWAGGER_URL} from "../../constants";
import GenericButton from "../GenericButton/GenericButton";
import CopyIcon from "../../assets/img/copy-outline.svg";
import DownloadIcon from "../../assets/img/download-outline.svg";
import ExploreAPIImage from "../../assets/img/explore-api-image.png";
import React, {useState} from "react";
import ToastComponent from "../ToastComponent/ToastComponent";
import axios from "axios";
import styles from "../ExploreApiComponent/ExploreApiComponent.module.css";

function ExploreApiComponent() {

    const { t } = useTranslation();
    const [toast, setToast] = useState("");
    const swaggerUrl = `${window.location.protocol}//${window.location.hostname}/${VC_MANAGEMENT_SWAGGER_URL}/`;
    const showToastFunc = () => {
        setToast (<ToastComponent header="Copied the url to Clipboard"
                                  variant="success" delay='3000' position="top-center" className="copy-toast" />);
        setTimeout(() => {
            setToast("");
        }, 3000);
    }
    async function copySwaggerURL() {
        var copyText = document.getElementById("swaggerUrl");
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        if ('clipboard' in navigator) {
            await navigator.clipboard.writeText(copyText.value);
        } else {
            document.execCommand('copy', true, copyText.value);
        }
    }

    function downloadSwagger() {
        const element = document.createElement("a");
        const file = new Blob([document.getElementById('swaggerUrl').value],
            {type: 'text/plain;charset=utf-8'});
        element.href = URL.createObjectURL(file);
        element.download = "swaggerUrl.txt";
        document.body.appendChild(element);
        element.click();
    }

    return (
        <Container>
            {toast}
            <Row className="align-items-center">
                <Container className="col-lg-6">
                    <p className="title">{t('exploreAPI.header')}</p>
                    <p>{t('exploreAPI.body')}</p>
                    <Form.Control className={`my-3 ${styles['swagger-url']}`} size="lg" type="text" readOnly id='swaggerUrl' defaultValue={swaggerUrl} />
                    <div className='container-fluid my-3 px-0'>
                        <div className='px-0 mx-0 d-flex flex-wrap'>
                            <div className='col-12 col-lg-6 my-2 pe-0 pe-lg-2'
                                 onClick={async () => {await copySwaggerURL(); showToastFunc();}}>
                                <GenericButton img={CopyIcon} text='Copy' type='button' variant='outline-primary' />
                            </div>
                            <div className='col-12 col-lg-6 my-2 ps-0 ps-lg-2' onClick={() =>  downloadSwagger()}>
                                <GenericButton img={DownloadIcon} text='Download' type='button' variant='outline-primary' />
                            </div>
                        </div>
                    </div>
                </Container>
                <div className="col-lg-6 text-center">
                    <img src={ExploreAPIImage} className="mw-100" alt="explore api image"/>
                </div>
            </Row>
        </Container>
    )

}

export default ExploreApiComponent
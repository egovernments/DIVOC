import {Col, Container, Row} from "react-bootstrap";
import SuccessCheckMark from "../../assets/img/success-checkmark.svg";
import ErrorAlert from "../../assets/img/error-alert.svg";
import SuccessAction from "../../assets/img/successful-upload.png";
import ErrorAction from "../../assets/img/error-upload.png";
import GenericButton from "../GenericButton/GenericButton";
import styles from "./ActionInfoComponent.module.css"

const ActionInfoComponent = ({
    isActionSuccessful,
    actionHeaderMessage,
    actionBodyMessage,
    primaryButtonText,
    primaryActionKey,
    secondaryButtonText,
    secondaryActionKey,
    nextActionHandler
}) =>{
    return (
        <Container>
            <Row>
                <Col className="col-12 col-md-6 col-xl-5 mb-3 mb-md-0">
                    <Container>
                        <Row className="flex-nowrap align-items-center mb-2">
                            {
                                <img src={isActionSuccessful ? SuccessCheckMark : ErrorAlert}
                                     className={styles['action-status-icon']} alt={'action status icon'}/>
                            }
                            <p className={`mb-0 ${isActionSuccessful ? styles['success-action-message'] : styles['erro-action-message']}`}>
                                {actionHeaderMessage}
                            </p>
                        </Row>
                        <Row>
                            <p className={`ps-0 ${styles['action-message-body']}`}>{actionBodyMessage}</p>
                        </Row>
                        <Row>
                            {
                                secondaryButtonText && <GenericButton
                                    text={secondaryButtonText} type='button'
                                    variant='secondary' onClick={() => nextActionHandler(secondaryActionKey)}></GenericButton>
                            }
                            {
                                primaryButtonText && <GenericButton
                                    text={primaryButtonText} type='button'
                                    variant='primary' onClick={() => nextActionHandler(primaryActionKey)}></GenericButton>
                            }
                        </Row>
                    </Container>
                </Col>
                <Col className="text-center col-12 col-md-6 col-xl-5 offset-0 offset-xl-2 mw-100">
                    <img src={isActionSuccessful ? SuccessAction : ErrorAction} alt={'action status image'}/>
                </Col>
            </Row>
        </Container>
    )
}

export default ActionInfoComponent;
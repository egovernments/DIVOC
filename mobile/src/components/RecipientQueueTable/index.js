import React, {useEffect, useState} from "react";
import {Table} from "react-bootstrap";
import VaccinationActiveImg from "../../assets/img/vaccination-active-status.svg";
import VaccinationInActiveImg from "../../assets/img/vacconation-inactive-status.svg";
import {useHistory} from "react-router";
import {BaseFormCard} from "../BaseFormCard";
import {CONSTANT} from "../../utils/constants";
import {appIndexDb, QUEUE_STATUS} from "../../AppDatabase";
import Col from "react-bootstrap/Col";
import "./index.scss"
import config from "config.json"
import {formatDate} from "../../utils/date_utils";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";


export const RecipientQueueTable = () => {
    const [queueData, setQueueData] = useState([]);
    useEffect(() => {
        appIndexDb.getQueue(QUEUE_STATUS.IN_QUEUE).then((queue) => setQueueData(queue))
    })
    const history = useHistory();
    return (
        <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.RECIPIENT_QUEUE)} onBack={() => history.push(config.urlPath)}>
            <Table responsive>
                <thead>
                <tr>
                    <th>{getMessageComponent(LANGUAGE_KEYS.RECIPIENT_QUEUE_NUMBER)}</th>
                    <th>{getMessageComponent(LANGUAGE_KEYS.NAME)}</th>
                    <th>{getMessageComponent(LANGUAGE_KEYS.RECIPIENT_QUEUE_STATUS)}</th>
                </tr>
                </thead>
                <tbody>
                {
                    queueData.map((data, index) => (
                        <tr key={index} onClick={() => {
                            history.push(config.urlPath + `/confirm/vaccination/${data.enrollCode}/${CONSTANT.SELECT_VACCINATOR}`)
                        }}>
                            <td>{index + 1}</td>
                            <td>
                                <div className="d-flex flex-column">
                                    <span>{data.name}</span>
                                    <span style={{fontSize: "12px"}}>{`${data.gender}, ${new Date().getFullYear() - data.yob} Years`}</span>
                                </div>
                            </td>
                            <td>
                                <img src={data.vaccinated ? VaccinationActiveImg : VaccinationInActiveImg} alt=""/>
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </Table>
            {queueData && queueData.length === 0 &&
            <Col className={"center"}>{getMessageComponent(LANGUAGE_KEYS.RECIPIENT_QUEUE_MESSAGE)}</Col>}
        </BaseFormCard>
    )
};

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


export const RecipientQueueTable = () => {
    const [queueData, setQueueData] = useState([]);
    useEffect(() => {
        appIndexDb.getQueue(QUEUE_STATUS.IN_QUEUE).then((queue) => setQueueData(queue))
    })
    const history = useHistory();
    return (
        <BaseFormCard title={"Recipient Queue"}>
            <Table responsive>
                <thead>
                <tr>
                    <th>No</th>
                    <th>Name</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                {
                    queueData.map((data, index) => (
                        <tr key={index} onClick={() => {
                            history.push(config.urlPath + `/confirm/vaccination/${data.enrollCode}/${CONSTANT.SELECT_VACCINATOR}`)
                        }}>
                            <td>{index}</td>
                            <td>
                                <div className="d-flex flex-column">
                                    <span>{data.name}</span>
                                    <span style={{fontSize: "12px"}}>{`${data.gender}, ${data.dob}`}</span>
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
            <Col className={"center"}>No Patient in Queue</Col>}
        </BaseFormCard>
    )
};

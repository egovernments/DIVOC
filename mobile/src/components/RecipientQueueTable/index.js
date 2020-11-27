import React from "react";
import {Card, Table} from "react-bootstrap";
import BackBtnImg from "../../assets/img/back-btn.svg";
import VaccinationActiveImg from "../../assets/img/vaccination-active-status.svg";
import VaccinationInActiveImg from "../../assets/img/vacconation-inactive-status.svg";
import {BaseCard} from "../../Base/Base";

export const RecipientQueueTable = () => {
    const queueData = [
        {
            id: 1,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: true
        },
        {
            id: 2,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 3,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 2,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 3,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 2,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 3,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 2,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 3,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 2,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 3,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 2,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 3,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 2,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 3,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 2,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 3,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 2,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 3,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 2,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        },
        {
            id: 3,
            username: "Vivek Sing",
            gender: "Male",
            age: "44",
            vaccinated: false
        }
    ];
    return (
        <BaseCard>
            <Card.Header className="d-flex justify-content-between">
                <img src={BackBtnImg} alt={""}/>
                <span>Recipient Queue</span>
                <span/>
            </Card.Header>
            <Card.Body>
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
                            <tr key={index}>
                                <td>{data.id}</td>
                                <td>
                                    <div className="d-flex flex-column">
                                        <span>{data.username}</span>
                                        <span style={{fontSize: "12px"}}>{`${data.gender}, ${data.age}`}</span>
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
            </Card.Body>
        </BaseCard>
    )
};
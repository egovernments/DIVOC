import React from "react";
import {Table} from "react-bootstrap";
import VaccinationActiveImg from "../../assets/img/vaccination-active-status.svg";
import VaccinationInActiveImg from "../../assets/img/vacconation-inactive-status.svg";
import {useHistory} from "react-router";
import {BaseRecipientQueueCard} from "../BaseRecipientQueueCard";
import {CONSTANT} from "../../utils/constants";


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
    const history = useHistory();
    return (
        <BaseRecipientQueueCard title={"Recipient Queue"}>
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
                            history.push(`/confirm/vaccination/${data.id}/${CONSTANT.SELECT_VACCINATOR}`)
                        }}>
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
        </BaseRecipientQueueCard>
    )
};
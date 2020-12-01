import React, {useEffect, useState} from "react";
import "./index.scss";
import {Table} from "react-bootstrap";
import SampleSignatureImg from "../../assets/img/sample-signature.png";
import {appIndexDb} from "../../AppDatabase";
import Button from "react-bootstrap/Button";
import {CONSTANT} from "../../utils/constants";
import {BaseRecipientQueueCard} from "../BaseRecipientQueueCard";
import {Redirect} from "react-router";
import {ACTION_SELECT_BATCH, useConfirmVaccine} from "../../ConfirmVaccination";

export const SelectVaccinator = (props) => {
    const {goNext} = useConfirmVaccine();
    const [vaccinatorIdx, setVaccinatorIdx] = useState(-1);
    const [vaccinators, setVaccinators] = useState([])

    function onActionBtnClick() {
        return goNext(ACTION_SELECT_BATCH,
            `/confirm/vaccination/${props.enrollCode}/${CONSTANT.BATCH_CODE}`,
            {enrollCode: props.enrollCode, vaccinatorId: vaccinatorIdx});
    }


    useEffect(() => {
        appIndexDb
            .getVaccinators()
            .then((result) => setVaccinators(result))
    }, [])
    return (
        <div className="select-vaccinator-wrapper">
            <span className="select-title">SELECT VACCINATOR</span>
            <Table responsive>
                <tbody>
                {
                    vaccinators.map((data, index) => (
                        <tr className={vaccinatorIdx === index && "selected-vaccinator"} key={index} onClick={() => {
                            setVaccinatorIdx(index)
                        }}>
                            <td>
                                <span>{data.vaccinator}</span>
                            </td>
                            <td>
                                <img src={data.signatureImg || SampleSignatureImg} alt=""/>
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </Table>
            <Button variant="outline-primary" className="action-btn" onClick={(onActionBtnClick)}>{"NEXT"}</Button>
        </div>
    );
}

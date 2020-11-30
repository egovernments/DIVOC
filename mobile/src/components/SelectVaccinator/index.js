import React, {useState} from "react";
import "./index.scss";
import {Table} from "react-bootstrap";
import SampleSignatureImg from "../../assets/img/sample-signature.png";

export const SelectVaccinator = () => {
    const [vaccinatorIdx, setVaccinatorIdx] = useState(-1);
    return(
        <div className="select-vaccinator-wrapper">
            <span className="select-title">SELECT VACCINATOR</span>
            <Table responsive>
                <tbody>
                {
                    [
                        {vaccinator: "Dr. AR Rahman", signatureImg: ""},
                        {vaccinator: "Dr. AR Rahman", signatureImg: ""},
                        {vaccinator: "Dr. AR Rahman", signatureImg: ""},
                        {vaccinator: "Dr. AR Rahman", signatureImg: ""},
                        {vaccinator: "Dr. AR Rahman", signatureImg: ""},
                        {vaccinator: "Dr. AR Rahman", signatureImg: ""},
                        {vaccinator: "Dr. AR Rahman", signatureImg: ""},
                        {vaccinator: "Dr. AR Rahman", signatureImg: ""},
                        {vaccinator: "Dr. AR Rahman", signatureImg: ""},
                        {vaccinator: "Dr. AR Rahman", signatureImg: ""},
                        {vaccinator: "Dr. AR Rahman", signatureImg: ""},
                        {vaccinator: "Dr. AR Rahman", signatureImg: ""},

                    ].map((data, index) => (
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
        </div>
    );
}
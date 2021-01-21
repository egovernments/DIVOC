import React, {useEffect, useState} from "react";
import "./VaccinatorList.css"
import check from "../../../assets/img/check.png";
import info from "../../../assets/img/info.png";


export default function VaccinatorList({vaccinators, onSelectVaccinator}) {
    useEffect(() => {
    }, []);

    function onEditVaccinator(vaccinator) {
        onSelectVaccinator(vaccinator)
    }

    const getVaccinatorList = () => {
        return vaccinators.map((vaccinator, index) => (
            <tr>
                <td>{vaccinator.name}</td>
                <td>{vaccinator.programs}</td>
                <td>{vaccinator.trainingCertificate ? <img src={check}/> : <img src={info}/>}</td>
                <td>{vaccinator.signatureString ? <img src={check}/> : <img src={info}/>}</td>
                <td className={vaccinator.status === "Active" ? "active status" : "inactive status"}>{vaccinator.status}</td>
                <td className={"action-row"}>
                    <button className={"action-button"}>{vaccinator.status === "Active" ? "Make Inactive" : "Make Active"}</button>
                    <button className={"action-button"} onClick={() => onEditVaccinator(vaccinator)}>"Edit Profile"</button>
                </td>
            </tr>
        ));

    };

    return (
        <table className={"table table-hover v-table-data"}>
            <thead>
            <tr>
                <th>OPERATOR NAME</th>
                <th>PROGRAM TRAINED FOR</th>
                <th>CERTIFIED</th>
                <th>SIGNATURE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
            </tr>
            </thead>
            <tbody>{getVaccinatorList()}</tbody>
        </table>
    );
}

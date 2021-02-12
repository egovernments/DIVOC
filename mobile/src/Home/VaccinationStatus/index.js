import React, {useEffect, useState} from "react";
import {BaseCard} from "../../Base/Base";
import "./index.scss"
import {appIndexDb} from "../../AppDatabase";
import {programDb} from "../../Services/ProgramDB";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";


export function VaccinationStatus() {
    const [vaccinationStatus, setVaccinationStatus] = useState()
    useEffect(() => {
        getVaccinationStatus()
            .then((result) => setVaccinationStatus(result))
            .catch(e => {
            });
    }, [])

    if (!vaccinationStatus) {
        return <div/>
    }

    function renderProgressStatus() {
        return <h4><span className={vaccinationStatus.isExceed ? "exceed" : "normal"}>
        {vaccinationStatus.vaccinationDone}</span> / {vaccinationStatus.allowVaccination}
        </h4>;
    }

    function renderStatusMessage() {
        const message = vaccinationStatus.message
        const exceedCount = vaccinationStatus.isExceed ? vaccinationStatus.exceedVaccinations : ""
        return (
            <h5 className="status-message pl-4 pt-1 text-center">{message} {exceedCount ? (
                <span>(<span className="exceed">{exceedCount}</span>)</span>) : ""}
            </h5>
        );
    }

    return (
        <div className="vaccination-status mt-2 text-center">
            <BaseCard>
                <div className="d-flex justify-content-start pt-3 pb-3 pl-4 pr-4">
                    {renderProgressStatus()}
                    {renderStatusMessage()}
                </div>
            </BaseCard>
            {vaccinationStatus.isLimitToReach &&
            <p className="limit-message mt-2">{getMessageComponent(LANGUAGE_KEYS.LIMIT_REACH_MESSAGE)}</p>}
        </div>
    )
}

async function getVaccinationStatus() {
    const userDetails = await appIndexDb.getUserDetails()
    const programName = localStorage.getItem("program")
    const currentProgram = await programDb.getPrograms().find((value => {
        return value["name"] === programName
    }))
    const programRate = userDetails[currentProgram["id"] + "_rate"] ?? 0
    const recipientDetails = await appIndexDb.recipientDetails()
    const certificateIssue = recipientDetails[1].value
    const isExceed = certificateIssue > programRate
    const remainingCertificate = programRate - certificateIssue
    const isLimitToReach = remainingCertificate >= 0 && remainingCertificate <= 10;
    return new VaccinationDetails(
        certificateIssue,
        programRate,
        isExceed ? (certificateIssue - programRate) : 0,
        isExceed,
        isExceed ? "Exceed Limits" : "Recipients Enrolled",
        isLimitToReach
    );
}


class VaccinationDetails {

    get isLimitToReach() {
        return this._isLimitToReach;
    }

    get vaccinationDone() {
        return this._vaccinationDone;
    }

    get allowVaccination() {
        return this._allowVaccination;
    }

    get exceedVaccinations() {
        return this._exceedVaccinations;
    }

    get isExceed() {
        return this._isExceed;
    }

    get message() {
        return this._message;
    }

    constructor(vaccinationDone, allowVaccination, exceedVaccinations, isExceed, message, isLimitToReach) {
        this._vaccinationDone = vaccinationDone;
        this._allowVaccination = allowVaccination;
        this._exceedVaccinations = exceedVaccinations;
        this._isExceed = isExceed;
        this._message = message;
        this._isLimitToReach = isLimitToReach;
    }
}

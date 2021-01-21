import React, {useEffect, useState} from "react";
import {BaseCard} from "../../Base/Base";
import "./index.scss"


export function VaccinationStatus() {
    const [vaccinationStatus, setVaccinationStatus] = useState()
    useEffect(() => {
        getVaccinationStatus()
            .then((result) => setVaccinationStatus(result))
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
        return <h5>{message} {exceedCount ? (<span className="exceed">{exceedCount}</span>) : ""}</h5>;
    }

    return (
        <div className="vaccination-status mt-2 text-center">
            <BaseCard>
                <div className="d-flex justify-content-between pt-3 pb-3 pl-4 pr-4">
                    {renderProgressStatus()}
                    {renderStatusMessage()}
                </div>
            </BaseCard>
        </div>
    )
}

async function getVaccinationStatus() {
    const dummyVaccination = new VaccinationDetails(
        225,
        200,
        25,
        true,
        "Exceed Limits"
    )
    return dummyVaccination
}


class VaccinationDetails {

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

    constructor(vaccinationDone, allowVaccination, exceedVaccinations, isExceed, message) {
        this._vaccinationDone = vaccinationDone;
        this._allowVaccination = allowVaccination;
        this._exceedVaccinations = exceedVaccinations;
        this._isExceed = isExceed;
        this._message = message;
    }
}

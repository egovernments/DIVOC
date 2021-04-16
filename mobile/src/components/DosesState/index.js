import {getSelectedProgram, getSelectedProgramId} from "../ProgramSelection";
import React, {useEffect, useState} from "react";
import {programDb} from "../../Services/ProgramDB";
import doseCompletedImg from "../../assets/img/dose-completed.svg";
import currentDoseImg from "../../assets/img/dose-currentdose.svg";
import nextDoseImg from "../../assets/img/dose-nextdose.svg";

export const DosesState = ({appointments}) => {
    const reqAppointments = appointments ?
        appointments
            .filter(a => a["programId"] === getSelectedProgramId())
            .sort((a, b) => {
                if (parseInt(a.dose) > parseInt(b.dose)) return 1;
                if (parseInt(a.dose) < parseInt(b.dose)) return -1;
                return 0;
            }) : [];
    const [vaccine, setVaccine] = useState({});

    useEffect(() => {
        programDb.getProgramByName(getSelectedProgram()).then((program) => {
            reqAppointments
                .filter(a => a["programId"] === getSelectedProgramId() && a.vaccine)
                .map(a => program.medicines.filter(m => m.name === a.vaccine).map(v => setVaccine(v)))
        });

    }, []);

    if (!vaccine) {
        return
    }

    function getDoses() {
        let result = [];
        if (!vaccine.doseIntervals) {
            return result
        }
        for (let i = 1; i <= vaccine.doseIntervals.length+1; i++) {
            if (reqAppointments.filter(a => parseInt(a.dose) === i).length > 0) {
                let app = reqAppointments.filter(a => parseInt(a.dose) === i)[0];
                if (app.certified) {
                    result.push(<img className="ml-1" src={doseCompletedImg} />)
                }
                else if (app.certified === false) {
                    result.push(<img className="ml-1"  src={currentDoseImg} />)
                }
            }
            else {
                result.push(<img className="ml-1" src={nextDoseImg} />)
            }
        }
        return result
    }

    return (
        <span>
            { getDoses() }
        </span>
    )

}

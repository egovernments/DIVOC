import {Card} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import "./index.scss"
import {BaseFormCard} from "../BaseFormCard";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";
import {programDb} from "../../Services/ProgramDB";
import Col from "react-bootstrap/Col";
import ImgPlaceholder from "assets/img/no_image.svg"
import ImgTick from "assets/img/tick.svg"
import Button from "react-bootstrap/Button";
import {ApiServices} from "../../Services/ApiServices";
import {AuthSafeComponent} from "../../utils/keycloak";
import {SyncFacade} from "../../SyncFacade";
import {appIndexDb} from "../../AppDatabase";
import {Messages} from "../../Base/Constants";
import {BaseCard} from "../../Base/Base";

export function ProgramSelection() {
    const [programs, setPrograms] = useState([])

    useEffect(() => {
        programDb
            .getPrograms()
            .then((result) => {
                setPrograms(result)
            })
            .catch(e => console.log(e.message))
    }, [])

    const onProgramSelected = (program) => {
        saveSelectedProgram(program)
    }

    return (
        <div className="program-container">
            <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.SELECT_PROGRAM)}>
                <ProgramSelectionGrid programs={programs} onProgramSelectedCallback={onProgramSelected}/>
            </BaseFormCard>
        </div>)
}

export function ProgramSelectionGrid({programs, onProgramSelectedCallback}) {
    const [selectedProgram, setSelectedProgram] = useState(getSelectedProgram())

    const onProgramSelected = (program) => {
        setSelectedProgram(program)
        if (onProgramSelectedCallback) {
            onProgramSelectedCallback(program)
        }
    }
    return (
        <div className="program-grid">
            {programs.map((item, index) => {
                return <ProgramItem
                    key={item.id}
                    program={item}
                    selected={item.name === selectedProgram}
                    onClick={() => onProgramSelected(item.name)}/>
            })}
        </div>
    )
}


function ProgramItem({program, selected, onClick}) {
    const [bannerImage, setBannerImage] = useState(program.logoURL)
    return (
        <div className={`program-item ${selected ? 'active' : ''}`} onClick={onClick}>
            {selected && <img className="tick" src={ImgTick} alt={""}/>}
            <div className="selection">
                <div className="d-flex flex-column justify-content-center">
                    <img className={"banner-image"} src={bannerImage ? bannerImage : ImgPlaceholder}
                         alt={program.name}
                         onError={() => setBannerImage(null)}/>
                    <div className='title'>{program.name}</div>
                </div>
            </div>
        </div>
    );
}


export function SelectProgram({onDone}) {
    const [programs, setPrograms] = useState([])
    const [selectedProgram, setSelectedProgram] = useState()
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        ApiServices
            .fetchPrograms()
            .then((result) => {
                setLoading(false);
                setPrograms(result);
            })
            .catch(e => {
                setLoading(false);
                console.log(e.message)
            })
    }, [])

    const onProgramSelected = (programName) => {
        setSelectedProgram(programName)
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (programs && programs.length === 0) {
        return <NoProgramFoundAuthSafe/>
    }

    return (
        <div className="selection-program-container">
            <h5>Please select a Vaccination Program</h5>
            <div className="program-selection-grid">
                <ProgramSelectionGrid programs={programs} onProgramSelectedCallback={onProgramSelected}/>
            </div>
            <div>
                <Button
                    variant="outline-primary" className="action-btn mt-4"
                    onClick={() => {
                        if (selectedProgram && onDone) {
                            saveSelectedProgram(selectedProgram)
                            onDone(selectedProgram)
                        }
                    }}>Done</Button>
            </div>
        </div>
    );
}

function NoProgramFoundAuthSafe() {
    return (
        <AuthSafeComponent>
            <NoProgramFound/>
        </AuthSafeComponent>
    )
}

function NoProgramFound({keycloak}) {
    return (
        <div className="no-program-container">
            <BaseCard>
                <div className="no-program-container d-flex flex-column justify-content-center">
                    <h6 className="mb-4">There is no vaccination program associated with your facility. Please contact your facility
                        admin.</h6>
                    <Button variant="outline-danger" onClick={() => {
                        keycloak.logout()
                    }}>Logout</Button>{" "}
                </div>
            </BaseCard>
        </div>
    )
}


export function getSelectedProgram() {
    return localStorage.getItem("program")
}

export function saveSelectedProgram(programName) {
    localStorage.setItem("program", programName)
}

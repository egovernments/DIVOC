import {Card} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import "./index.scss"
import {BaseFormCard} from "../BaseFormCard";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";
import {appIndexDb} from "../../AppDatabase";

export function ProgramSelection() {
    const [programs, setPrograms] = useState([])
    const [selectedProgram, setSelectedProgram] = useState(getSelectedProgram())

    useEffect(() => {
        appIndexDb
            .getPrograms()
            .then((result) => {
                setPrograms(result)
            })
            .catch(e => console.log(e.message))
    }, [])

    const onProgramSelected = (program) => {
        setSelectedProgram(program)
        saveSelectedProgram(program)
    }

    return (
        <div className="program-container">
            <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.SELECT_PROGRAM)}>
                {programs.map((item, index) => {
                    return <ProgramItem
                        key={item.id}
                        name={item.name}
                        selected={item.name === selectedProgram}
                        onClick={() => onProgramSelected(item.name)}>
                        {item.name}
                    </ProgramItem>
                })}
            </BaseFormCard>
        </div>)
}


function ProgramItem(props) {
    return (
        <div className={`program-item ${props.selected ? 'active' : ''}`} onClick={props.onClick}>
            <Card.Header className="d-flex justify-content-between">
                <div className='title'>{props.name}</div>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M0 0h24v24H0z" fill='none'/>
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
                          fill={`${props.selected ? '#5C9EF8' : ''}`}/>
                </svg>
            </Card.Header>
        </div>
    );
}


export function getSelectedProgram() {
    return localStorage.getItem("program")
}

export function saveSelectedProgram(programName) {
    localStorage.setItem("program", programName)
}

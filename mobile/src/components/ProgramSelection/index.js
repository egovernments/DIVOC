import {Card} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import "./index.scss"
import {BaseFormCard} from "../BaseFormCard";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";
import {programDb} from "../../Services/ProgramDB";
import Col from "react-bootstrap/Col";
import ImgPlaceholder from "assets/img/no_image.svg"
import Button from "react-bootstrap/Button";
import {ApiServices} from "../../Services/ApiServices";

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
    //   const [bannerImage, setBannerImage] = useState("https://www.nsmedicaldevices.com/wp-content/uploads/sites/2/2020/05/Bioradcovid-740x520.jpg")
    return (
        <div className={`program-item ${selected ? 'active' : ''}`} onClick={onClick}>
            <Card className="d-flex justify-content-between">
                <Col>
                    <img className={"banner-image"} src={bannerImage ? bannerImage : ImgPlaceholder} alt={program.name}
                         onError={() => setBannerImage(null)}/>
                    <div className='title'>{program.name}</div>
                </Col>
            </Card>
        </div>
    );
}


export function SelectProgram({onDone}) {
    const [programs, setPrograms] = useState([])
    const [selectedProgram, setSelectedProgram] = useState()
    useEffect(() => {
        ApiServices
            .fetchPrograms()
            .then((result) => {
                setPrograms(result)
            })
            .catch(e => console.log(e.message))
    }, [])

    const onProgramSelected = (programName) => {
        setSelectedProgram(programName)
    }
    return (
        <div>
            <h3>Please selected the Program</h3>
            <ProgramSelectionGrid programs={programs} onProgramSelectedCallback={onProgramSelected}/>
            <Button onClick={() => {
                if (selectedProgram && onDone) {
                    saveSelectedProgram(selectedProgram)
                    onDone(selectedProgram)
                }
            }}>Done</Button>
        </div>
    );
}


export function getSelectedProgram() {
    return localStorage.getItem("program")
}

export function saveSelectedProgram(programName) {
    localStorage.setItem("program", programName)
}

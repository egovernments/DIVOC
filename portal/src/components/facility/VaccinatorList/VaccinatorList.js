import React, {useEffect, useState} from "react";
import "./VaccinatorList.css"
import check from "../../../assets/img/check.png";
import info from "../../../assets/img/info.png";
import filter from "../../../assets/img/filter.svg";
import Popover from "@material-ui/core/Popover";
import {CheckboxItem} from "../../FacilityFilterTab";


export default function VaccinatorList({vaccinators, onSelectVaccinator}) {

    const [programs, setPrograms] = useState([]);
    const [selectedPrograms, setSelectedPrograms] = useState([]);


    function getAllPrograms(vaccinators) {
        let programList = [];
        vaccinators.map(vaccinator => {
            vaccinator.programs.map(program => {
                programList.push(program.id)
            })
        });
        return Array.from(new Set(programList));
    }

    useEffect(() => {
        setPrograms(getAllPrograms(vaccinators));
        setSelectedPrograms(getAllPrograms(vaccinators))
    }, [vaccinators]);

    function onEditVaccinator(vaccinator) {
        onSelectVaccinator(vaccinator)
    }

    const getVaccinatorList = () => {
        return vaccinators.map((vaccinator, index) => {
            if (vaccinator.programs && vaccinator.programs.length > 0) {
                return vaccinator.programs.filter(p => selectedPrograms.includes(p.id)).map(program => (
                    <tr>
                        <td>{vaccinator.name}</td>
                        <td>{program.id}</td>
                        <td>{program.certified ? <img src={check}/> : <img src={info}/>}</td>
                        <td>{vaccinator.signatureString ? <img src={check}/> : <img src={info}/>}</td>
                        <td className={vaccinator.status === "Active" ? "active status" : "inactive status"}>{vaccinator.status}</td>
                        <td className={"action-row"}>
                            <button className={"action-button"}>{vaccinator.status === "Active" ? "Make Inactive" : "Make Active"}</button>
                            <button className={"action-button"} onClick={() => onEditVaccinator(vaccinator)}>"Edit Profile"</button>
                        </td>
                    </tr>
                ))
            } else {
                return (
                    <tr>
                        <td>{vaccinator.name}</td>
                        <td>-</td>
                        <td><img src={info}/></td>
                        <td>{vaccinator.signatureString ? <img src={check}/> : <img src={info}/>}</td>
                        <td className={vaccinator.status === "Active" ? "active status" : "inactive status"}>{vaccinator.status}</td>
                        <td className={"action-row"}>
                            <button className={"action-button"}>{vaccinator.status === "Active" ? "Make Inactive" : "Make Active"}</button>
                            <button className={"action-button"} onClick={() => onEditVaccinator(vaccinator)}>"Edit Profile"</button>
                        </td>
                    </tr>
                )
            }
        });

    };

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const FilterPopup = () => {
        function handleProgramChange(name) {
            if (selectedPrograms.includes(name)) {
                setSelectedPrograms(selectedPrograms.filter(p => name !== p));
            } else {
                setSelectedPrograms([...selectedPrograms, name])
            }
        }

        return (
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
            <div className="custom-popup">
                <p>FILTER BY</p>
                <hr/>
                {
                    programs.map(program => (
                        <CheckboxItem
                            text={program}
                            checked={selectedPrograms.includes(program)}
                            onSelect={(event) =>
                                handleProgramChange(event.target.name)
                            }
                        />
                    ))
                }
            </div>

            </Popover>
        )
    };

    return (
        <table className={"table table-hover v-table-data"}>
            <thead>
            <tr>
                <th>OPERATOR NAME</th>
                <th>PROGRAM TRAINED FOR <img onClick={handleClick} src={filter}/>{<FilterPopup/>}</th>
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

import React, {useEffect, useState} from "react";
import "./VaccinatorList.css"
import check from "../../../assets/img/ic_check_circle_24px.svg";
import info from "../../../assets/img/ic_info_24px.svg";
import filter from "../../../assets/img/filter.svg";
import Popover from "@material-ui/core/Popover";
import {CheckboxItem} from "../../FacilityFilterTab";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {API_URL} from "../../../utils/constants";
import {useAxios} from "../../../utils/useAxios";
import Tooltip from "@material-ui/core/Tooltip";
import {FormControlLabel, Switch} from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";


export default function VaccinatorList({vaccinators, onSelectVaccinator, fetchVaccinators}) {

    const [programs, setPrograms] = useState([]);
    const [selectedPrograms, setSelectedPrograms] = useState([]);
    const axiosInstance = useAxios('');
    const useStyles = makeStyles((theme) => ({
        root: {
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            '& > *': {
                margin: theme.spacing(0.5),
            },
        },
    }));
    const classes = useStyles();

    useEffect(() => {
        setPrograms(getAllPrograms(vaccinators));
        setSelectedPrograms(getAllPrograms(vaccinators))
    }, [vaccinators]);

    function getAllPrograms(vaccinators) {
        let programList = [];
        vaccinators.map(vaccinator => {
            vaccinator.programs.map(program => {
                programList.push(program.programId)
            })
        });
        return Array.from(new Set(programList));
    }

    function onEditVaccinator(vaccinator) {
        onSelectVaccinator(vaccinator)
    }

    function onProgramStatusChange(vaccinator, program) {
        const editData = {
            osid: vaccinator.osid,
            programs: vaccinator.programs.map(p => {
                if (p.programId === program.programId) {
                    p.status = p.status === "Active" ? "Inactive" : "Active"
                }
                return p
            }),
        };
        axiosInstance.current.put(API_URL.VACCINATORS_API, [editData])
            .then(res => {
                if (res.status === 200) {
                    setTimeout(() => fetchVaccinators(), 2000);
                } else {
                    alert("Something went wrong while saving!");
                }
            }, (error) => {
                console.log(error);
                alert("Something went wrong while adding vaccinator!");
            });
    }

    const getVaccinatorList = () => {
        return vaccinators.map((vaccinator, index) => {
            if (vaccinator.programs && vaccinator.programs.length > 0) {
                return vaccinator.programs.filter(p => selectedPrograms.includes(p.programId)).map(program => (
                    <tr key={vaccinator.name + program.programId}>
                        <td className="vaccinator-name" onClick={() => {
                            onEditVaccinator(vaccinator)
                        }}>{vaccinator.name}</td>
                        <td>{program.programId}</td>
                        <td>
                            {program.certified ?
                                <img src={check}/> :
                                <Tooltip title="Certificate Not Uploaded"><img src={info}/></Tooltip>}
                        </td>
                        <td>
                            {vaccinator.signatureString ?
                                <img src={check}/> :
                                <Tooltip title="Signature Not Uploaded"><img src={info}/></Tooltip>}
                        </td>
                        <td>
                            <ToggleStatus
                                vaccinator={vaccinator}
                                program={program}
                                onUpdate={() => {
                                    setTimeout(() => fetchVaccinators(), 2000);
                                }}
                            />
                        </td>
                        {/*<td className={program.status === "Active" ? "active status" : "inactive status"}>{program.status}</td>*/}
                        {/*<td className={classes.root}>
                            <Chip variant="outlined"
                                  label={program.status === "Active" ? "Make Inactive" : "Make Active"}
                                  onClick={() => onProgramStatusChange(vaccinator, program)}/>
                            <Chip variant="outlined" label="Edit Profile" onClick={() => onEditVaccinator(vaccinator)}/>
                        </td>*/}
                    </tr>
                ))
            } else {
                return (
                    <tr key={vaccinator.name}>
                        <td>
                            <div className="vaccinator-name" onClick={() => {
                                onEditVaccinator(vaccinator)
                            }}>{vaccinator.name}</div>
                        </td>
                        <td>
                            <div className="assign-button" onClick={() => {
                                onEditVaccinator(vaccinator)
                            }}>Assign
                            </div>
                        </td>
                        <td>-</td>
                        <td>{vaccinator.signatureString ?
                            <img src={check}/> :
                            <Tooltip title="Signature Not Uploaded"><img src={info}/></Tooltip>}
                        </td>
                        <td>
                            <div className="mt-2 mb-2">-</div>
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
        <table className={"mt-4 table table-hover v-table-data"}>
            <thead>
            <tr>
                <th>OPERATOR NAME</th>
                <th>ALL PROGRAMS <img onClick={handleClick} src={filter}/>{<FilterPopup/>}</th>
                <th>CERTIFIED</th>
                <th>SIGNATURE</th>
                <th>STATUS</th>
            </tr>
            </thead>
            <tbody>{getVaccinatorList()}</tbody>
        </table>
    );
}

const CustomSwitch = withStyles({
    switchBase: {
        '&$checked': {
            color: "#88C6A9",
        },
        '&$checked + $track': {
            backgroundColor: "#88C6A9",
        },
    },
    checked: {},
    track: {},
})(Switch);

function ToggleStatus({vaccinator, program, onUpdate}) {

    const axiosInstance = useAxios('');
    const [isActive, setActive] = useState(program.status === "Active")

    const onToggle = (value) => {
        setActive(value.target.checked);
        const editData = {
            osid: vaccinator.osid,
            programs: vaccinator.programs.map(p => {
                if (p.programId === program.programId) {
                    p.status = p.status === "Active" ? "Inactive" : "Active"
                }
                return p
            }),
        };
        axiosInstance.current.put(API_URL.VACCINATORS_API, [editData])
            .then(res => {
                if (res.status === 200) {
                    if (onUpdate) {
                        onUpdate()
                    }
                } else {
                    setActive(!value.target.checked)
                    alert("Something went wrong while saving!");
                }
            }, (error) => {
                console.log(error);
                setActive(!value.target.checked)
                alert("Something went wrong while adding vaccinator!");
            });
    }
    return <FormControlLabel
        control={
            <CustomSwitch
                checked={isActive}
                onChange={onToggle}
                name="checkedB"
                color="primary"
            />
        }
        label={isActive ? "Active" : "Inactive"}
    />
}

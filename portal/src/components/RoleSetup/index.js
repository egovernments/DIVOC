import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import withStyles from "@material-ui/core/styles/withStyles";
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from "@material-ui/core/Button";
import {useAxios} from "../../utils/useAxios";
import AddUserImg from "../../assets/img/add-user.svg";
import AddProgramImg from "../../assets/img/add-program.svg";
import "./index.css"
import Switch from "@material-ui/core/Switch/Switch";
import {Modal} from "react-bootstrap";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import FormHelperText from "@material-ui/core/FormHelperText";
import {CONSTANTS} from "../../utils/constants";

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});
const CustomPaper = withStyles({
    root: {
        boxShadow: "0px 6px 20px #C1CFD933",
        borderRadius: "10px",
        width: "100%"
    }
})(Paper);

const BorderLessTableCell = withStyles({
    root: {
        borderBottom: "none",
        width: "200px"
    }
})(TableCell);


const OLD_USER = "old";
const OLD_PROGRAM = "old_program";
const NEW_USER = "new";
const NEW_PROGRAM = "new_program";
export const RoleSetup = () => {
    const [staffs, setStaffs] = useState([]);
    const [facility, setFacility] = useState({});
    const [groups, setGroups] = useState([]);
    const [showRateModal, setShowRateModal] = useState(false);
    const [selectedStaffIndex, setSelectedStaffIndex] = useState(-1);
    const classes = useStyles();
    const axiosInstance = useAxios('');

    function fetchUsers() {
        return axiosInstance.current.get('/divoc/admin/api/v1/facility/users')
            .then(res => {
                setStaffs(res.data.map(d => {
                    const rateLimits = d.vaccinationRateLimits.map(v => ({...v, programType: OLD_PROGRAM}));
                    return {...d, type: OLD_USER, edited: false, vaccinationRateLimits: rateLimits}
                }))
            });
    }

    function fetchFacilityDetails() {
        return axiosInstance.current.get('/divoc/admin/api/v1/facility')
            .then(res => {
                setFacility(res.data.length > 0 ? res.data[0] : [])
            });
    }

    function fetchFacilityGroups() {
        return axiosInstance.current.get('/divoc/admin/api/v1/facility/groups')
            .then(res => {
                setGroups(res.data)
            });
    }

    useEffect(() => {
        if (axiosInstance.current) {
            (async function () {
                await fetchUsers();
                await fetchFacilityGroups();
                await fetchFacilityDetails();
            })()

        }


    }, [axiosInstance]);

    function addNewUser() {
        setStaffs(staffs.concat({
            groups: [],
            name: "",
            mobileNumber: "",
            employeeId: "",
            type: NEW_USER,
            vaccinationRateLimits: []
        }))
    }

    function addNewProgram() {
        let updatedStaffs = staffs.slice(0);
        updatedStaffs[selectedStaffIndex].vaccinationRateLimits.push({
            "programName": "",
            "rateLimit": "",
            "programType": NEW_PROGRAM
        });
        setStaffs(updatedStaffs)
    }

    function updateProgram(programIndex, key, value) {
        let updatedStaffs = staffs.slice(0);
        updatedStaffs[selectedStaffIndex].vaccinationRateLimits[programIndex][key] = value;
        setStaffs(updatedStaffs)
    }

    function deleteProgram(programIndex) {
        let updatedStaffs = staffs.slice(0);
        updatedStaffs[selectedStaffIndex].vaccinationRateLimits.splice(programIndex, 1);
        setStaffs(updatedStaffs)
    }

    function updateStaff(index, staff) {
        const data = [...staffs];
        data[index] = staff;
        setStaffs(data);
    }

    function isStaffValid(staff) {
        return staff.groups.length > 0 && staff.name.length > 0 && staff.mobileNumber.length > 0 && staff.employeeId.length > 0
    }

    function saveStaff(index) {
        const staff = staffs[index];
        staff.vaccinationRateLimits = staff.vaccinationRateLimits.filter(rl => rl.programName !== "" || rl.rateLimit !== "");
        if (isStaffValid(staff)) {
            if (staff.type === OLD_USER) {
                axiosInstance.current.put('/divoc/admin/api/v1/facility/users', staff)
                    .then(res => {
                        fetchUsers()
                    });
            } else {
                axiosInstance.current.post('/divoc/admin/api/v1/facility/users', staff)
                    .then(res => {
                        fetchUsers()
                    }).catch((err) => {
                    console.log(err)
                    alert("User already exisits")
                });
            }
        } else {
            alert("Please fill all the values!")
        }
    }

    function deleteStaff(index) {
        if (window.confirm('Are you sure to delete this record?')) {
            const staff = staffs[index];
            axiosInstance.current.delete('/divoc/admin/api/v1/facility/users/' + staff.id)
                .then(res => {
                    fetchUsers()
                });
        }
    }

    function getValidPrograms() {
        const staff = staffs[selectedStaffIndex];
        if (staff && staff.vaccinationRateLimits.length === 0) {
            if (facility.programs) {
                return facility.programs.filter(program => program.status === CONSTANTS.ACTIVE);
            }
        } else if (staff && staff.vaccinationRateLimits.length > 0) {
            if (facility.programs) {
                const associatedProgramIds = staff.vaccinationRateLimits.map(prgm => prgm.programName);
                return facility.programs.filter(program => associatedProgramIds.includes(program.programId) || program.status === CONSTANTS.ACTIVE);
            }
        }
        return []
    }

    return (
        <div>
            <TableContainer component={CustomPaper}>
                <Table className={classes.table}
                       aria-label="facility staffs">
                    <TableBody>
                        {staffs.map((staff, index) => (
                            <StaffRow
                                index={index}
                                staff={staff}
                                groups={groups}
                                updateStaff={(staff) => updateStaff(index, staff)}
                                saveStaff={() => saveStaff(index)}
                                deleteStaff={() => deleteStaff(index)}
                                setSelectedStaffIndex={setSelectedStaffIndex}
                                setShowRateModal={setShowRateModal}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <StaffProgramRate programs={getValidPrograms()}
                              showModal={showRateModal}
                              addNewProgram={addNewProgram}
                              vaccinationRateLimits={selectedStaffIndex >= 0 ? staffs[selectedStaffIndex].vaccinationRateLimits : []}
                              updateProgram={(programIndex, key, value) => updateProgram(programIndex, key, value)}
                              deleteProgram={(programIndex) => deleteProgram(programIndex)}
                              saveStaff={() => saveStaff(selectedStaffIndex)}
                              onHide={() => setShowRateModal(false)}/>
            <img src={AddUserImg} alt={""} className="add-user-btn mt-3" onClick={addNewUser}/>
        </div>
    );
};

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

const StaffRow = ({index, staff, groups, updateStaff, saveStaff, deleteStaff, setShowRateModal, setSelectedStaffIndex}) => {
    function onRoleChange(evt) {
        if (staff.groups.length > 0) {
            staff.groups[0].id = evt.target.value
        } else {
            staff.groups = [{id: evt.target.value}]
        }
        staff.edited = true;
        updateStaff(staff)
    }

    function onValueChange(evt, field) {
        staff.edited = true;
        staff[field] = evt.target.value;
        updateStaff(staff)
    }

    function onEnabledChange(value) {
        staff.edited = true;
        staff.enabled = value;
        updateStaff(staff)
    }

    const staffGroup = groups.find(group => group.name === "facility staff") || {id: "staff"};
    return (
        <TableRow key={index}>
            <BorderLessTableCell>
                <FormControl variant="outlined" className="selectorHeight" fullWidth>
                    <label htmlFor="demo-simple-select-outlined">
                        Role Type *
                    </label>
                    <Select
                        className="roleTypeMenu"
                        labelId="demo-simple-select-outlined-label"
                        id="demo-simple-select-outlined"
                        value={staff.groups.length > 0 ? staff.groups[0].id : ""}
                        onChange={onRoleChange}
                    >
                        <MenuItem value="" disabled>
                            <em>Please select</em>
                        </MenuItem>
                        {
                            groups.map((group, index) => (
                                <MenuItem value={group.id} name={group.name}>{group.name}</MenuItem>

                            ))
                        }
                    </Select>
                </FormControl>
            </BorderLessTableCell>
            <BorderLessTableCell>
                <>
                    <label htmlFor="name">
                        Name *
                    </label>
                    <input
                        className="form-control"
                        value={staff.name}
                        type="text"
                        id="name"
                        onChange={(evt) => onValueChange(evt, "name")}
                        required/>
                </>
            </BorderLessTableCell>
            <BorderLessTableCell>
                <>
                    <label htmlFor="mobileNumber">
                        Mobile Number *
                    </label>
                    <input
                        className="form-control"
                        value={staff.mobileNumber}
                        type="text"
                        id="mobileNumber"
                        onChange={(evt) => onValueChange(evt, "mobileNumber")}
                        required/>
                </>
            </BorderLessTableCell>
            <BorderLessTableCell>
                <>
                    <label htmlFor="employeeId">
                        Employee Id *
                    </label>
                    <input
                        className="form-control"
                        value={staff.employeeId}
                        type="text"
                        id="employeeId"
                        onChange={(evt) => onValueChange(evt, "employeeId")}
                        required/>
                </>
            </BorderLessTableCell>
            <BorderLessTableCell>
                <FormControl className="switchInput" component="fieldset">
                    <label>
                        Status
                    </label>
                    <FormGroup>
                        <FormControlLabel
                            control={<CustomSwitch
                                checked={staff.enabled || false}
                                onChange={() => onEnabledChange(!staff.enabled)}
                                color="primary"
                            />}
                            label="Enabled"
                        />
                    </FormGroup>
                    <FormHelperText style={{fontSize: "0.7em"}}>Disabled users cannot login</FormHelperText>
                </FormControl>

            </BorderLessTableCell>
            <BorderLessTableCell>
                {staff.type === NEW_USER &&
                <Button variant="outlined" color="primary" onClick={saveStaff}>
                    SAVE
                </Button>
                }
                {staff.type === OLD_USER &&
                <div className="d-flex">
                    <Button className="mr-2" variant="outlinedPrimary" onClick={saveStaff} disabled={!staff.edited}>
                        SAVE
                    </Button>
                    <Button className="mr-2" variant="outlinedPrimary"
                            onClick={() => {
                                setShowRateModal(true);
                                setSelectedStaffIndex(index)
                            }}
                            disabled={staff.groups.length > 0 && staff.groups[0].id !== staffGroup.id}>
                        SET RATE
                    </Button>
                    <Button className="mr-2" variant="outlinedPrimary" onClick={deleteStaff}>
                        DELETE
                    </Button>
                </div>
                }
            </BorderLessTableCell>
        </TableRow>
    )
};


const StaffProgramRate = (props) => {
    const classes = useStyles();
    const allocatedPrograms = props.vaccinationRateLimits.map(v => v.programName);
    const newPrograms = props.programs.filter(program => !allocatedPrograms.includes(program.programId));
    return (
        <Modal
            show={props.showModal}
            onHide={props.onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Select Program and Set Rate
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Table className={classes.table}
                       aria-label="facility staffs">
                    <TableBody>
                        {props.vaccinationRateLimits.map((limit, index) => (
                            <TableRow>
                                <BorderLessTableCell>
                                    <FormControl variant="outlined" fullWidth>
                                        <label htmlFor="demo-simple-select-outlined">
                                            Program
                                        </label>
                                        <Select
                                            className="roleTypeMenu rateSelector"
                                            labelId="demo-simple-select-outlined-label"
                                            id="demo-simple-select-outlined"
                                            disabled={limit.programName !== ""}
                                            value={limit.programName}
                                            onChange={(evt) => {
                                                props.updateProgram(index, "programName", evt.target.value)
                                            }}
                                        >
                                            {
                                                (limit.programName === "" ? newPrograms : props.programs).map((program, index) => (
                                                    <MenuItem value={program.programId}
                                                              name={program.name}>{program.name}</MenuItem>

                                                ))
                                            }

                                        </Select>
                                    </FormControl>
                                </BorderLessTableCell>
                                <BorderLessTableCell>
                                    <>
                                        <label htmlFor="rate">
                                            Rate
                                        </label>
                                        <input
                                            className="form-control"
                                            value={limit.rateLimit}
                                            type="number"
                                            id="rate"
                                            onChange={(evt) => {
                                                props.updateProgram(index, "rateLimit", parseInt(evt.target.value))
                                            }}
                                            min="0"
                                        />
                                    </>
                                </BorderLessTableCell>
                                <BorderLessTableCell>
                                    <Button className="mr-2 rateDeleteButton" variant="outlinedPrimary" onClick={() => {
                                        props.deleteProgram(index)
                                    }}>
                                        DELETE
                                    </Button>
                                </BorderLessTableCell>
                            </TableRow>))}
                    </TableBody>
                </Table>
                {newPrograms.length > 0 && <img src={AddProgramImg} alt={""} className="ml-3 add-user-btn" style={{width: "4%"}}
                     onClick={props.addNewProgram}/>}
            </Modal.Body>
            <Modal.Footer className="justify-content-start">
                <Button className="ml-3" variant="outlinedPrimary"
                        onClick={() => {
                            props.saveStaff();
                            props.onHide()
                        }}>
                    SAVE
                </Button>
            </Modal.Footer>
        </Modal>
    )
};

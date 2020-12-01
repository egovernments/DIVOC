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
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import {useAxios} from "../../utils/useAxios";
import AddUserImg from "../../assets/img/add-user.svg";
import "./index.css"

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
const NEW_USER = "new";
export const RoleSetup = () => {
    const [staffs, setStaffs] = useState([]);
    const [groups, setGroups] = useState([]);
    const classes = useStyles();
    const axiosInstance = useAxios('');

    function fetchUsers() {
        axiosInstance.current.get('/divoc/admin/api/v1/facility/users')
            .then(res => {
                setStaffs(res.data.map(d => ({...d, type: OLD_USER})))
            });
    }

    useEffect(() => {
        if (axiosInstance.current) {
            fetchUsers();

            axiosInstance.current.get('/divoc/admin/api/v1/facility/groups')
                .then(res => {
                    setGroups(res.data)
                });
        }


    }, [axiosInstance]);

    function addNewUser() {
        setStaffs(staffs.concat({
            groups: [],
            name: "",
            mobileNumber: "",
            employeeId: "",
            type: NEW_USER
        }))
    }

    function updateStaff(index, staff) {
        const data = [...staffs];
        data[index] = staff;
        setStaffs(data);
    }

    function saveStaff(index) {
        axiosInstance.current.post('/divoc/admin/api/v1/facility/users', staffs[index])
            .then(res => {
                fetchUsers()
            });
    }

    return (
        <div>
            <TableContainer component={CustomPaper}>
                <Table className={classes.table}
                       aria-label="facility staffs">
                    <TableBody>
                        {staffs.map((staff, index) => (
                            <StaffRow
                                key={index}
                                staff={staff}
                                groups={groups}
                                updateStaff={(staff) => updateStaff(index, staff)}
                                saveStaff={() => saveStaff(index)}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <img src={AddUserImg} alt={""} className="add-user-btn mt-3" onClick={addNewUser}/>
        </div>
    );
};

const StaffRow = ({key, staff, groups, updateStaff, saveStaff}) => {
    function onRoleChange(evt) {
        if (staff.groups.length > 0) {
            staff.groups[0].id = evt.target.value
        } else {
            staff.groups = [{id: evt.target.value}]
        }
        updateStaff(staff)
    }

    function onValueChange(evt, field) {
        staff[field] = evt.target.value;
        updateStaff(staff)
    }

    return (
        <TableRow key={key}>
            <BorderLessTableCell>
                <FormControl variant="outlined" fullWidth>
                    <InputLabel id="demo-simple-select-outlined-label">Role Type</InputLabel>
                    <Select
                        labelId="demo-simple-select-outlined-label"
                        id="demo-simple-select-outlined"
                        value={staff.groups.length > 0 ? staff.groups[0].id : ""}
                        onChange={onRoleChange}
                        label="Role Type"
                    >
                        <MenuItem value="">
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
                <TextField value={staff.name} onChange={(evt) => onValueChange(evt, "name")} label="Name"
                           variant="outlined"/>
            </BorderLessTableCell>
            <BorderLessTableCell>
                <TextField value={staff.mobileNumber} onChange={(evt) => onValueChange(evt, "mobileNumber")} type="tel"
                           label="Mobile Number" variant="outlined"/>
            </BorderLessTableCell>
            <BorderLessTableCell>
                <TextField value={staff.employeeId} onChange={(evt) => onValueChange(evt, "employeeId")}
                           label="Employee ID" variant="outlined"/>
            </BorderLessTableCell>
            <BorderLessTableCell>
                {staff.type === NEW_USER &&
                <Button variant="outlined" color="primary" onClick={saveStaff}>
                    SAVE
                </Button>
                }
                {staff.type === OLD_USER &&
                <>
                    <Button variant="outlined" disabled>
                        EDIT
                    </Button>
                    <Button variant="outlined" disabled>
                        DELETE
                    </Button>
                </>
                }
            </BorderLessTableCell>
        </TableRow>
    )
};

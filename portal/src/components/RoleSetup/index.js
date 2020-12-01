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


export const RoleSetup = () => {
    const [staffs, setStaffs] = useState([]);
    const [groups, setGroups] = useState([]);
    const classes = useStyles();
    const axiosInstance = useAxios('');
    useEffect(() => {
        if (axiosInstance.current) {
            axiosInstance.current.get('/divoc/admin/api/v1/facility/users')
                .then(res => {
                    setStaffs(res.data)
                });

            axiosInstance.current.get('/divoc/admin/api/v1/facility/groups')
                .then(res => {
                    setGroups(res.data)
                });
        }


    }, [axiosInstance]);
    return (
        <div>
            <TableContainer component={CustomPaper}>
                <Table className={classes.table}
                       aria-label="facility staffs">
                    <TableBody>
                        {staffs.map((staff, index) => (
                            <StaffRow key={index} staff={staff} groups={groups}/>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

const StaffRow = ({key, staff, groups}) => {

    return (
        <TableRow key={key}>
            <BorderLessTableCell>
                <FormControl variant="outlined" fullWidth>
                    <InputLabel id="demo-simple-select-outlined-label">Role Type</InputLabel>
                    <Select
                        labelId="demo-simple-select-outlined-label"
                        id="demo-simple-select-outlined"
                        value={staff.groups.length > 0 ? staff.groups[0].id : ""}
                        onChange={() => {
                        }}
                        label="Role Type"
                    >
                        {/*<MenuItem value="">*/}
                        {/*    <em>None</em>*/}
                        {/*</MenuItem>*/}
                        {
                            groups.map((group, index) => (
                                <MenuItem value={group.id}>{group.name}</MenuItem>

                            ))
                        }

                    </Select>
                </FormControl>
            </BorderLessTableCell>
            <BorderLessTableCell>
                <TextField value={staff.name} label="Name" variant="outlined"/>
            </BorderLessTableCell>
            <BorderLessTableCell>
                <TextField value={staff.mobileNumber} type="tel" label="Mobile Number" variant="outlined"/>
            </BorderLessTableCell>
            <BorderLessTableCell>
                <TextField value={staff.employeeId} label="Employee ID" variant="outlined"/>
            </BorderLessTableCell>
            <BorderLessTableCell>
                <Button variant="outlined" color="primary">
                    SAVE
                </Button>
                <Button variant="outlined" disabled>
                    EDIT
                </Button>
                <Button variant="outlined" disabled>
                    DELETE
                </Button>
            </BorderLessTableCell>
        </TableRow>
    )
};

import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import withStyles from "@material-ui/core/styles/withStyles";
import TableHead from "@material-ui/core/TableHead";
import Select from "@material-ui/core/Select";

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

function createData(name, calories, fat, carbs, protein) {
    return {name, calories, fat, carbs, protein};
}

const rows = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
];

export const CustomTable = ({data, fields}) => {
    const [columns, setColumns] = useState([]);
    const classes = useStyles();
    const handleChangeMultiple = (event) => {
        const {options} = event.target;
        const value = [];
        for (let i = 0, l = options.length; i < l; i += 1) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        setColumns(value);
    };
    return (
        <div>

            {
                data.length > 0 &&
                <><span>Select the columns to be displayed (use CMD/CTRL to select multiple)</span>
                    <br/>
                <Select
                    value={columns}
                    onChange={handleChangeMultiple}
                    multiple
                    native
                    inputProps={{
                        id: 'select-multiple-native',
                    }}
                >
                    {Object.keys(data[0]).filter((name) => !fields.includes(name)).map((name) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </Select></>
            }

            <TableContainer component={CustomPaper}>
                <Table className={classes.table}
                       aria-label="facility staffs">
                    <TableHead>
                        <TableRow>
                            {
                                fields.concat(columns).map((field, index) => (
                                    <TableCell key={index}>{field}</TableCell>
                                ))
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            data.map((row) => (
                                <TableRow>
                                    {
                                        fields.concat(columns).map((field, index) => (
                                            <TableCell key={index}>{JSON.stringify(row[field])}</TableCell>
                                        ))
                                    }
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};
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
        width: "100%",
        height: '60vh'
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

export const CustomTable = ({data, fields, canSelectColumn = true}) => {


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
        <div className="mt-3">
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
                            data && data.map && data.map((row) => (
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

            {
                data.length > 0 && canSelectColumn &&
                <div className="d-flex flex-column align-items-end"><span>Select the columns to be displayed</span>
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
                    </Select></div>
            }
        </div>
    );
};
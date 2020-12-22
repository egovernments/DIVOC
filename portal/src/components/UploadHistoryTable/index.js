import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import withStyles from "@material-ui/core/styles/withStyles";
import TableHead from "@material-ui/core/TableHead";
import PropTypes from 'prop-types';

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

export class HistoryData {
    constructor(fileName, date, time, records, errors) {
        this.fileName = fileName;
        this.date = date;
        this.time = time;
        this.records = records;
        this.errors = errors;
    }
}

export class HeaderData {
    constructor(title, key) {
        this.title = title;
        this.key = key;
    }
}


export const UploadHistoryTable = ({data, headerData, onCellClicked}) => {

    const classes = useStyles();

    return (
        <TableContainer component={CustomPaper}>
            <Table className={classes.table}
                   aria-label="facility staffs">
                <TableHead>
                    <TableRow>
                        {
                            headerData.map((field, index) => (
                                <TableCell key={index}>{field.title}</TableCell>
                            ))
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        data.map((row) => (
                            <TableRow onClick={() => {
                                if (onCellClicked) {
                                    onCellClicked(row)
                                }
                            }}>
                                {
                                    headerData.map((field, index) => (
                                        <TableCell key={index}>{row[field.key]}</TableCell>
                                    ))
                                }
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </TableContainer>
    );
};

UploadHistoryTable.propTypes = {
    data: PropTypes.array,
    headerData: PropTypes.instanceOf(HeaderData)
};

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
        }
    })
;

const CustomPaper = withStyles({
    root: {
        boxShadow: "0px 6px 20px #C1CFD933",
        borderRadius: "10px",
        width: "100%",
        height: '60vh',
        padding: "16px",
        borderBottom: "1px solid #CEE5FF"
    }
})(Paper);

const RowTableCell = withStyles({
    root: {
        fontSize: "0.75rem",
        padding: "8px",
        color: "#646D82",
        borderBottom: "1px solid #CEE5FF",
        font: "Proxima Nova"
    }
})(TableCell);

const HeaderTableCell = withStyles({
    root: {
        fontSize: "0.75rem",
        fontWeight: "bold",
        color: "#646D82",
        borderBottom: "1px solid #CEE5FF"
    }
})(TableCell);

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
        <div>
            <TableContainer component={CustomPaper}>
                <h5 className="m-2">Uploads History</h5>
                <hr color="#CEE5FF" style={{
                    border: 0,
                    borderBottom: "1px solid #CEE5FF"

                }}/>
                <Table className={classes.table}
                       aria-label="facility staffs">
                    <TableHead>
                        <TableRow>
                            {
                                headerData.map((field, index) => (
                                    <TableCell component={HeaderTableCell} size="small"
                                               key={index}>{field.title}</TableCell>
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
                                            <TableCell component={RowTableCell} size="small"
                                                       key={index}>{row[field.key]}</TableCell>
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

UploadHistoryTable.propTypes = {
    data: PropTypes.array,
    headerData: PropTypes.instanceOf(HeaderData)
};

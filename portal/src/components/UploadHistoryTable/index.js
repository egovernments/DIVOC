import React, {useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import withStyles from "@material-ui/core/styles/withStyles";
import TableHead from "@material-ui/core/TableHead";
import PropTypes from "prop-types";
import TablePagination from "@material-ui/core/TablePagination";
import {maskPersonalDetails} from  "../../utils/maskPersonalDetails";

const useStyles = makeStyles({
        table: {
            minWidth: 650,
        }
    })
;

const CustomPaper = withStyles({
    root: {
        width: "100%",
        padding: "16px",
    },
})(Paper);

const RowTableCell = withStyles({
    root: {
        fontSize: "0.85rem",
        color: "#646D82",
        borderBottom: "1px solid #E6E6E6",
        font: "Proxima Nova",
        textAlign: "left",
    },
})(TableCell);

const HeaderTableCell = withStyles({
    root: {
        fontSize: "0.75rem",
        fontWeight: "bold",
        color: "#646D82",
        borderBottom: "none",
        textAlign: "left",
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

export const UploadHistoryTable = ({
                                       data,
                                       headerData,
                                       onCellClicked,
                                       title,
                                       emptyListMessage
                                   }) => {
    const [selectedHistory, setSelectedHistory] = useState();
    const classes = useStyles();
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [page, setPage] = React.useState(0);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const styles = theme => ({
        hover: {
            '&$hover:hover': {
                backgroundColor: "#888888 !important"
            }
        }
    });
    return (
        <div className="conatiner">
            <TableContainer component={CustomPaper}>
                { title && <><h5 className="m-2">{title}</h5>
                <hr
                    color="#CEE5FF"
                    style={{
                        border: 0,
                        borderBottom: "1px solid #CEE5FF",
                    }}
                /></>}
                {data.length === 0 ? (
                    <div className="centered-and-flexed">
                        {emptyListMessage ?? "No Upload history found"}
                    </div>
                ) : (
                    <Table
                        className={classes.table}
                        aria-label="facility staffs"
                    >
                        <TableHead>
                            <TableRow>
                                {headerData.map((field, index) => (
                                    <TableCell
                                        component={HeaderTableCell}
                                        size="small"
                                        align="center"
                                        key={index}
                                    >
                                        {field.title}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data
                                .slice(
                                    page * rowsPerPage,
                                    page * rowsPerPage + rowsPerPage
                                )
                                .map((row) => (
                                    <TableRow hover
                                              className={styles.hover}
                                        selected={
                                            selectedHistory &&
                                            selectedHistory.id === row["id"]
                                        }
                                        style={{
                                            cursor: onCellClicked ? "pointer" : "",
                                        }}
                                        onClick={() => {
                                            setSelectedHistory(row);
                                            if (onCellClicked) {
                                                onCellClicked(row);
                                            }
                                        }}
                                    >
                                        {headerData.map((field, index) => {
                                           return( <TableCell
                                                component={RowTableCell}
                                                size="small"
                                                align="center"
                                                key={index}
                                            >
                                                {row[field.key]}
                                            </TableCell>)
                            })}
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                )}

            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 20, 25]}
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
            />
        </div>
    );
};

UploadHistoryTable.propTypes = {
    data: PropTypes.array,
    headerData: PropTypes.array,
    emptyListMessage: PropTypes.string
};

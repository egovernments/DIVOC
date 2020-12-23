import React from "react";
import TableRow from "@material-ui/core/TableRow";
import Table from "@material-ui/core/Table";
import withStyles from "@material-ui/core/styles/withStyles";
import TableCell from "@material-ui/core/TableCell";
import {Button} from "react-bootstrap";
import TableBody from "@material-ui/core/TableBody";
import Paper from "@material-ui/core/Paper";


const CustomPaper = withStyles({
    root: {
        boxShadow: "0px 6px 20px #C1CFD933",
        border: "1px solid red",
        borderRadius: "16px",
        width: "100%",
        padding: "16px"
    }
})(Paper);

const RowTableCell = withStyles({
    root: {
        fontSize: "1rem",
        color: "#646D82",
        padding: "12px",
        borderBottom: "1px solid #CEE5FF",
    }
})(TableCell);

export function UploadErrorList({uploadHistoryDetails}) {
    return (

        <div className="error-list">
            <Table component={CustomPaper}>
                <TableBody>
                    {
                        uploadHistoryDetails.map((item, index) =>
                            <TableRow>
                                <TableCell
                                    component={RowTableCell}>{item.errorMessage}</TableCell>
                            </TableRow>)
                    }
                </TableBody>
            </Table>
            <Button variant="danger" className="mt-4">Download Error CSV</Button>
        </div>
    );
}

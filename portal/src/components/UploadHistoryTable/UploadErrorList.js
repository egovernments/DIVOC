import React from "react";
import TableRow from "@material-ui/core/TableRow";
import Table from "@material-ui/core/Table";
import withStyles from "@material-ui/core/styles/withStyles";
import TableCell from "@material-ui/core/TableCell";
import {Button} from "react-bootstrap";
import TableBody from "@material-ui/core/TableBody";
import Paper from "@material-ui/core/Paper";
import UploadErrorIcon from "../../assets/img/upload_error.svg"

var Papa = require("papaparse/papaparse");


const CustomPaper = withStyles({
    root: {
        boxShadow: "none",
        width: "100%",
        padding: "32px"
    }
})(Paper);

const RowTableCell = withStyles({
    root: {
        fontSize: "1rem",
        color: "#646D82",
        padding: "12px",
    }
})(TableCell);

export function UploadErrorList({uploadHistoryDetails, fileName}) {
    return (

        <div className="error-list d-flex flex-column justify-content-between">
            <div>
                <div className="d-flex flex-row justify-content-sm-between m-2">
                    <h6>Errors</h6>
                    <img src={UploadErrorIcon}/>
                </div>
                <hr style={{
                    border: 0,
                    borderBottom: "1px solid #FC573B"

                }}/>
                <Table component={CustomPaper}>
                    <TableBody>
                        {
                            uploadHistoryDetails.map((item, index) =>
                                <TableRow>
                                    <TableCell
                                        component={RowTableCell}>Row {index + 1} :
                                        Errors {item["ERRORS"].length}
                                    </TableCell>
                                </TableRow>)
                        }
                    </TableBody>
                </Table>
            </div>
            <Button variant="danger" className="m-4" onClick={() => {
                // const rawCSV = uploadHistoryDetails.map((item, index) => item.rawData);
                const csv = Papa.unparse(uploadHistoryDetails)
                console.log(JSON.stringify(csv))
                // Dummy implementation for Desktop download purpose
                const blob = new Blob([csv]);
                const a = window.document.createElement('a');
                a.href = window.URL.createObjectURL(blob);
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }}>Download Error CSV</Button>
        </div>
    );
}

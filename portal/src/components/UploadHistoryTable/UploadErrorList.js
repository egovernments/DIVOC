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
        fontSize: "0.90rem",
        color: "#646D82",
        padding: "10px",
    }
})(TableCell);

export function UploadErrorList({uploadHistoryDetails, columns, fileName}) {
    console.log(uploadHistoryDetails);
    if (!uploadHistoryDetails) {
        return <div>Something went wrong</div>
    }

    const isErrorFound = uploadHistoryDetails.length > 0;

    function mapToHeaderInGiveColumnOrder() {
        return uploadHistoryDetails.map((item, index) => {
            const newObject = {}
            for (let i = 0; i < columns.length; i++) {
                const columnName = columns[i];
                newObject[columnName] = item[columnName];
            }
            return newObject;
        });
    }

    function downloadFile(csv) {
        const blob = new Blob([csv]);
        const a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

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
                {isErrorFound ? <Table component={CustomPaper}>
                    <TableBody>
                        {
                            uploadHistoryDetails.map((item, index) => {
                                const errorsItem = item.hasOwnProperty("errors") ? item["errors"] : ""
                                return <TableRow>
                                    <TableCell
                                        component={RowTableCell}>Row {index + 1} :
                                        Errors {errorsItem.split(",").length}
                                    </TableCell>
                                </TableRow>
                            })
                        }
                    </TableBody>
                </Table> : <p>No Error Found</p>}
            </div>
            {isErrorFound && <Button variant="danger" className="m-4" onClick={() => {
                const orderColumns = mapToHeaderInGiveColumnOrder()
                const csv = Papa.unparse(orderColumns)
                downloadFile(csv);
            }}>Download Error CSV</Button>}
        </div>
    );
}

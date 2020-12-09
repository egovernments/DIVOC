import React from "react";
import styles from "./PrintCertificate.module.css";
function PrintCertificate() {
    const [selectedReceipt, setSelectedReceipt] = React.useState();
    const [selectedCertificate, setSelectedCertificate] = React.useState();

    const tableData = [
        { enrollmentId: 1, name: "ABC", gender: "female" },
        { enrollmentId: 2, name: "ABC", gender: "male" },
        { enrollmentId: 3, name: "ABC", gender: "female" },
    ];
    const getTableBody = () => {
        let tableRow = [];
        let tableCells;

        tableData.forEach( data => {
            tableCells = []
            tableCells.push(<tr>
                <td>{data.enrollmentId}</td>
                <td>{data.name}</td>
                <td>{data.gender}</td>
                <td>
                    <div className="form-check">
                        <label
                            className="form-check-label"
                            htmlFor={data.enrollmentId + "receipt"}
                        >
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id={data.enrollmentId + "receipt"}
                                onChange={(event) => setSelectedReceipt(data) }
                                checked={selectedReceipt && selectedReceipt.enrollmentId === data.enrollmentId}
                            />
                            <div
                                className={styles["wrapper"]}
                                style={{
                                    backgroundColor:
                                    selectedReceipt && selectedReceipt.enrollmentId === data.enrollmentId
                                            ? "#DE9D00"
                                            : "",
                                }}
                            >
                                &nbsp;
                            </div>
                        
                        </label>
                    </div>
                </td>
                <td>
                <div className="form-check">
                        <label
                            className="form-check-label"
                            htmlFor={data.enrollmentId + "cert"}
                        >
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id={data.enrollmentId + "cert"}
                                onChange={(event) => setSelectedCertificate(data) }
                                checked={selectedCertificate && selectedCertificate.enrollmentId === data.enrollmentId}
                            />
                            <div
                                className={styles["wrapper"]}
                                style={{
                                    backgroundColor:
                                    selectedCertificate && selectedCertificate.enrollmentId === data.enrollmentId
                                            ? "#DE9D00"
                                            : "",
                                }}
                            >
                                &nbsp;
                            </div>
                        
                        </label>
                    </div>
                </td>
            </tr>)
           tableRow.push(tableCells)
       })
       return tableRow;
    }

    return (
        <div className="row">
            <div className="col-sm-6">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Enrolment ID</th>
                            <th>Name</th>
                            <th>Gender</th>
                            <th>Print receipt</th>
                            <th>Print certificate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getTableBody()}
                    </tbody>
                </table>
            </div>
            <div className="col-sm-6">
                <div></div>
                {selectedReceipt ? <button>PRINT RECEIPT</button> : ''}
                {selectedCertificate ? <button>PRINT CERTIFICATE</button> : ''}
            </div>
        </div>
    );
}

export default PrintCertificate;

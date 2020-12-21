import React from 'react';
import './DataTable.css';


function DataTable({title,selectedData,setSelectedData,data,stateWiseCertificateData,total}) {

    const handleRowClick = (data) => {
        setSelectedData({name : data,count: 0});
    };

    const getTableData = () => {
        return data.map((state) => {
            return (
                <tr
                    style={
                        selectedData.name === state
                            ? { background: "#CEE5FF" }
                            : { background: "white" }
                    }
                    onClick={() => handleRowClick(state)}
                >
                    <td>{state}</td>
                    <td>{stateWiseCertificateData[state]? stateWiseCertificateData[state] : 0}</td>
                </tr>
            );
        });
    };

    return (
        <div className="table-container">
            <table
            className="table table-borderless table-hover"
        >
            <thead>
                <tr>
                    <td >{title}</td>
                    <td>{total}</td>
                </tr>
            </thead>
            <tbody>{getTableData()}</tbody>
        </table>
        </div>
    );
}

export default DataTable;
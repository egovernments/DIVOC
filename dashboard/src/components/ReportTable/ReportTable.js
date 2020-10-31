import React from 'react';
import styles from './ReportTable.module.css';

const tableHeading = ['TESTED','ACTIVE','GOVT','PRIVATE','CAPACITY /WEEK','GOVT','VOUCHERS','DIRECT']
function ReportTable( {data}) {

    return(
        <div >
            <table>
                <thead>
                    <tr>
                        {tableHeading.map( data => <td>{data}</td> )}
                    </tr>
                </thead>
                <tbody>
                    
                </tbody>
            </table>
        </div>
    );
}

export default ReportTable;
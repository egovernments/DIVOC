import React, { useState } from 'react';
import {STATE_NAMES} from '../../constants';
import styles from './ReportTable.module.css';

const tableHeading = ['TESTED','ACTIVE','GOVT','PRIVATE','CAPACITY /WEEK','GOVT','VOUCHERS','DIRECT']
const tableStatistics = [
    'confirmed',
    'tested',
  ];
  
function ReportTable( {data}) {

    return(
        <div className={styles['table-container']}>
            <table>
                <thead>
                    <td className={styles['td-start']}>State</td>
                    {tableStatistics.map((statistic) => (
                            <td className={styles['td-header']}>{statistic}</td>
                    ))}
                </thead>
                <tbody>
                    {Object.keys(data).map((stateCode) => {
                        return(
                            <tr>
                            <td className={styles['td-state']}>{STATE_NAMES[stateCode]}</td>
                            {   
                                tableStatistics.map((statistic) => (
                                    <td className={styles['td-body']}>{data[stateCode].total[statistic]}</td>
                                ))
                            }
                        </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default ReportTable;
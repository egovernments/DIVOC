import React, { useState } from 'react';
import {STATE_NAMES} from '../../constants';
import styles from './ReportTable.module.css';
import direct_certificates from '../../DummyData/certificate_direct.json';
import certificate_via_govt from '../../DummyData/certificate_via_govt.json';
import certificate_via_vouchers from '../../DummyData/certificate_via_vouchers.json';
import govt_authorized_centres from '../../DummyData/govt_authorized_centres.json';
import private_authorized_centres from '../../DummyData/private_authorized_centres.json';

const tableStatistics = [
    'TESTED',
    'ACTIVE',
    'GOVT',
    'PRIVATE',
    'GOVT',
    'VOUCHERS',
    'DIRECT'
  ];
  
function ReportTable( {
        data,
        rowName,
        selectedState
    }) {

    function showStateRelatedData() {
        return( 
            Object.keys(data).map((stateCode) => {
                return(
                    <tr>
                        <td className={`${styles['td-state']} ${styles['td']}`}>{STATE_NAMES[stateCode]}</td>
                        <td className={`${styles['td-cell']} ${styles['cell1']}`}>{data[stateCode].total['confirmed']}</td>
                        <td className={`${styles['td-cell']} ${styles['cell1']}`}>{data[stateCode].total['tested']}</td>
                        <td className={`${styles['td-cell']} ${styles['cell2']}`} >{govt_authorized_centres[stateCode]}</td>
                        <td className={`${styles['td-cell']} ${styles['cell2']}`}>{private_authorized_centres[stateCode]}</td>
                        <td className={`${styles['td-cell']} ${styles['cell3']}`}>{certificate_via_govt[stateCode]}</td>
                        <td className={`${styles['td-cell']} ${styles['cell3']}`}>{certificate_via_vouchers[stateCode]}</td>
                        <td className={`${styles['td-cell']} ${styles['cell3']}`}>{direct_certificates[stateCode]}</td>
                    </tr>
                )
            })
        )
    }

    function showDistrictRelatedData() {
        const districtList = data[selectedState].districts
        return(
            Object.keys(districtList).map( district => {
                return(
                    <tr>
                        <td className={`${styles['td-state']} ${styles['td']}`}>{district}</td>
                        <td className={`${styles['td-cell']} ${styles['cell1']}`}>{districtList[district].total['confirmed']}</td>
                        <td className={`${styles['td-cell']} ${styles['cell1']}`}>{districtList[district].total['tested']}</td>
                    </tr>
                )
            })
        )
    }

    return(
        <div className={styles['table-container']}>
            <table className={styles['table']}>
                <thead>
                    <tr>
                        <th className={`${styles['td-start']} ${styles['td']}`}>State</th>
                        {tableStatistics.map((statistic) => (
                                <th className={`${styles['td-header']}`}>{statistic}</th>
                        ))}
                    </tr>
                    
                </thead>
                <tbody>
                    {rowName === "state" ? showStateRelatedData() : showDistrictRelatedData()}
                </tbody>
            </table>
        </div>
    );
}

export default ReportTable;
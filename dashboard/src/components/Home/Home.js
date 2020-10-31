import React, { useState, useEffect } from 'react';
import styles from './Home.module.css';
import Injection from '../../Images/Injection.svg';
import Checkbox from '../Checkbox/Checkbox';
import DataTable from '../DataTable/DataTable';
import centres_data from '../../DummyData/centres_data.json';
import certificate_data from '../../DummyData/certificate_data.json';

function Home() {
    const [isActiveClicked, setActiveClicked] = useState(false);
    const [isCentresClicked, setCentresClicked] = useState(true);
    const [isCertificatesClicked, setCertificatesClicked] = useState(false);
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        const newTableData  = []
        const item = {}
        item["Centres"] = centres_data
        newTableData.push(item)
        setTableData(newTableData)
    },[])


    const handleActiveCheckboxChange = () => {
        setActiveClicked(!isActiveClicked);
    }

    const handleCentresCheckboxChange = () => {
        var isClicked = !isCentresClicked;
        
        if(isClicked) {
            const item = {}
            const newTableData  = tableData.slice()
            item["Centres"] = centres_data
            newTableData.push(item)
            setTableData(newTableData)
        }
        else {
            const newItemList = tableData.filter( item => !item['Centres'])
            setTableData(newItemList)
        }
        setCentresClicked(isClicked)
    }

    const handleCertificatesCheckboxChange = () => {
        var isClicked = !isCertificatesClicked;

        if(isClicked) {
            const item = {}
            const newTableData  = tableData.slice()
            item["Certificates"] = certificate_data
            newTableData.push(item)
            setTableData(newTableData)
        }
        else {
            const newItemList = tableData.filter( item => !item['Certificates'])
            setTableData(newItemList)
        }

        setCertificatesClicked(isClicked)
    }


    return(
        <div>
            <div className={styles['top-heading']}>
                <img className={styles['image']} src={Injection} alt="Injection"/>
                <p className={styles['heading-content']}>Vaccine Program Overview</p>
                <div className={styles['population']}>
                    <p className={styles['population-field']}>POPULATION</p>
                    <p className={styles['population-figures']}>1,380,004,385</p>
                </div>
            </div>
            <div className={styles['dropdown']}>
                Drop down
            </div>
            <div className={styles['checkbox']}>
                <Checkbox title={"Active"} handleCheckboxChange={handleActiveCheckboxChange} defaultValue={isActiveClicked} />
                <Checkbox title={"Centres"} handleCheckboxChange={handleCentresCheckboxChange} defaultValue={isCentresClicked} />
                <Checkbox title={"Certificates"} handleCheckboxChange={handleCertificatesCheckboxChange} defaultValue={isCertificatesClicked} />
            </div>
            <div>
                <DataTable tableData={tableData}/>
                <p>map</p>
            </div>
           
        </div>
    );
}

export default Home;

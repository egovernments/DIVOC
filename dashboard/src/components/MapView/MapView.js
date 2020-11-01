import React, { useState, useEffect } from 'react';
import styles from './MapView.module.css';
import Injection from '../../Images/Injection.svg';
import Checkbox from '../Checkbox/Checkbox';
import DataTable from '../DataTable/DataTable';
import centres_data from '../../DummyData/centres_data.json';
import certificate_data from '../../DummyData/certificate_data.json';
import Centre from '../../Images/Centre.svg';
import Private from '../../Images/Private.svg';
import TextBox from '../TextBox/TextBox';
import IndiaMap from "../IndiaMap/IndiaMap";

function Home() {
    const [isActiveClicked, setActiveClicked] = useState(false);
    const [isCentresClicked, setCentresClicked] = useState(true);
    const [isCertificatesClicked, setCertificatesClicked] = useState(true);
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        const newTableData  = []
        const item = {}
        item["Centres"] = centres_data
        newTableData.push(item)
        newTableData.push({"Certificates":certificate_data})
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
        <div className={styles['map-container']}>
            <div className={styles['top-heading']}>
                <img className={styles['image']} src={Injection} alt="Injection"/>
                <p className={styles['heading-content']}>Vaccine Program Overview</p>
                <div className={styles['population']}>
                    <p className={styles['population-field']}>POPULATION</p>
                    <p className={styles['population-figures']}>1,380,004,385</p>
                </div>
            </div>
            <div className={styles['dropdown']}>
                Select State <select><option>All Of India</option><option>Karnataka</option></select>
            </div>
            <div className={styles['type-of-bubbles']}>
                <Checkbox title={"Active"} color="#7C8289" handleCheckboxChange={handleActiveCheckboxChange} defaultValue={isActiveClicked} />
                <Checkbox title={"Centres"} color="#479EFF" handleCheckboxChange={handleCentresCheckboxChange} defaultValue={isCentresClicked} />
                <Checkbox title={"Certificates"} color="#74C9A7" handleCheckboxChange={handleCertificatesCheckboxChange} defaultValue={isCertificatesClicked} />
            </div>
            <div className={styles['container']}>
                <DataTable tableData={tableData}/>
                <div className={styles['map-container']}><IndiaMap data={tableData}/></div>
                <div>
                    <div>State details</div>
                    <div style={{textAlign: 'left'}}>
                        <span className={styles['heading']} style={{color: '#479EFF'}}>Centres</span>
                        <div className={styles['centres']}>
                            <div className={styles['centre-box']}>
                                <img src={Centre} alt="Centre"/>
                                <TextBox number={11} text={'Government'} color={'#479EFF'}/>
                            </div>
                            <div className={styles['private-box']}>
                                <img src={Private} alt="Private"/>
                                <TextBox number={2} text={'Private'} color={'#479EFF'}/>
                            </div>
                        </div>
                    </div>
                    <div style={{textAlign: 'left'}}>
                        <span className={styles['heading']} style={{color: '#74C9A7'}}>Certificates issued</span>
                        <div className={styles['centres']}>
                            <div className={styles['centre-box']}>
                                <TextBox number={34987} text={'Till Date'} color={'#74C9A7'}/>
                            </div>
                            <div className={styles['private-box']}>
                                <TextBox number={8987} text={'Last Week'} color={'#74C9A7'}/>
                            </div>
                        </div>
                        <div style={{display: 'flex'}}>
                            <div className={styles['centre-box']}>
                                <TextBox number={34987} text={'Govt Funded'} color={'#74C9A7'}/>
                            </div>
                            <div className={styles['box-shape']}>
                                <TextBox number={8987} text={'Vouchers'} color={'#74C9A7'}/>
                            </div>
                            <div className={styles['private-box']}>
                                <TextBox number={8987} text={'Self-funded'} color={'#74C9A7'}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;

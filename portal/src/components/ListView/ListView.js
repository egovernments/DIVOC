import React, {useState} from 'react';
import './ListView.css';
import ProgramActiveImg from "../../assets/img/program-active.svg";
import ProgramInActiveImg from "../../assets/img/program-inactive.svg";

function ListView({listData, fields}) {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    return (
        <div>
            {
                selectedIndex === -1 && listData.map((data, index) => {
                    return (
                        <div className={'list-view-card-container'}>
                            <div className={'list-view-card-details'}>
                                <div className="d-flex justify-content-between">
                                    <span className={'list-view-name'}>{data.name}</span>
                                    <span className={'list-view-logo-img'}>
                                        LOGO
                                        <img src={data.status === "Active" ? ProgramActiveImg : ProgramInActiveImg}
                                             className={'list-view-program-status-img'} alt={data.status}
                                             title={data.status}/>
                                    </span>
                                </div>
                                <div className={'list-view-details'}
                                     onClick={() => setSelectedIndex(index)}>{"More Details ->"}</div>
                            </div>
                        </div>
                    )
                })
            }
            {
                selectedIndex > -1 &&
                <div>
                    <div className={"list-view-selected-container"}>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className={'list-view-name'}>{listData[selectedIndex].name}</span>
                            <span className={'list-view-logo-img'}>
                                        LOGO
                                        <img
                                            src={listData[selectedIndex].status === "Active" ? ProgramActiveImg : ProgramInActiveImg}
                                            className={'list-view-program-status-img'}
                                            alt={listData[selectedIndex].status}
                                            title={listData[selectedIndex].status}/>
                                    </span>
                        </div>
                        <div className="d-flex flex-wrap">
                            {
                                fields.map((item, index) => (
                                    <div className="w-50 d-flex flex-column p-3 align-items-start">
                                        <span className="list-selected-title">{item}</span>
                                        <span className="list-selected-value">{listData[selectedIndex][item]}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    <button className="mt-3 list-selected-back-btn" onClick={() => setSelectedIndex(-1)}>BACK</button>
                </div>
            }
        </div>

    );
}

export default ListView;
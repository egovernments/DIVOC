import React from 'react';
import './ListView.css';
import AddIconImg from "../../assets/img/add-icon.svg";
import Button from 'react-bootstrap/Button';
import withStyles from "@material-ui/core/styles/withStyles";
import Switch from "@material-ui/core/Switch/Switch";

const CustomSwitch = withStyles({
    switchBase: {
        '&$checked': {
            color: "#88C6A9",
        },
        '&$checked + $track': {
            backgroundColor: "#88C6A9",
        },
    },
    checked: {},
    track: {},
})(Switch);


function ListView({listData, onRegisterBtnClick, title, buttonTitle, showDetails, onActiveSwitchClick, setSelectedData}) {


    return (
        <div>
            <>
                <div className="d-flex">
                    <p className="font-weight-bold p-2 mr-auto ">{title}</p>
                    {buttonTitle &&
                    <Button variant="outline-primary" className="d-flex align-items-center justify-content-between"
                            style={{height: "3rem", textTransform: "uppercase"}} onClick={onRegisterBtnClick}>
                        <img className="mr-1" src={AddIconImg}/> {buttonTitle}</Button>}
                </div>
                <div className="cards-container">
                    {listData.map((data, index) => {
                        return (
                            <div className='list-view-card-container' onClick={(e) => {
                                if (e.target.nodeName !== "INPUT") {
                                    setSelectedData(data)
                                }
                            }}>
                                <div className="d-flex justify-content-between">
                                    <span className={'list-view-name'}>{data.name}</span>
                                    {
                                        showDetails && <span className='list-view-logo-img'>
                                    {"image" in data ? <img alt="" src={data.image} width={"100%"}/> : "LOGO"}

                                </span>
                                    }
                                </div>
                                {!showDetails &&
                                <div className="d-flex justify-content-between">
                                    <span className="">{data.provider}</span>
                                    <div className="custom-switch d-flex flex-column align-items-center"
                                         style={{fontSize: "12px"}}>
                                        <CustomSwitch
                                            checked={data.status === "Active" || false}
                                            onChange={(evt) => {
                                                evt.stopPropagation()
                                                setSelectedData(data);
                                                let editedData = Object.assign({}, data);
                                                editedData.status = editedData.status === "Active" ? "Inactive" : "Active";
                                                onActiveSwitchClick(editedData)
                                            }}
                                            color="primary"
                                        />
                                        <p>{data.status === "Active" ? "Active" : "Inactive"}</p>
                                    </div>
                                </div>
                                }
                                {showDetails &&
                                <>
                                    <div className="additional-details"
                                         title={data.description}>{data.description.length > 200 ? data.description.substr(0, 200) + "..." : data.description}</div>
                                    <div className="additional-details-card">
                                        <div>
                                            <div className="d-inline-flex flex-column">
                                                <span>Start Date</span>
                                                <span><b>{data.startDate}</b></span>
                                            </div>
                                            <div className="d-inline-flex flex-column ml-3">
                                                <span>End Date</span>
                                                <span><b>{data.endDate}</b></span>
                                            </div>
                                        </div>
                                        <div className="custom-switch d-inline-flex flex-column align-items-center">
                                            <CustomSwitch
                                                checked={data.status === "Active" || false}
                                                onChange={(evt) => {
                                                    evt.stopPropagation()
                                                    setSelectedData(data);
                                                    let editedData = Object.assign({}, data);
                                                    editedData.status = editedData.status === "Active" ? "Inactive" : "Active";
                                                    onActiveSwitchClick(editedData)
                                                }}
                                                color="primary"
                                            />
                                            <p>{data.status === "Active" ? "Active" : "Inactive"}</p>
                                        </div>
                                    </div>
                                </>
                                }

                            </div>
                        )
                    })}
                </div>
            </>
        </div>

    );
}

export default ListView;
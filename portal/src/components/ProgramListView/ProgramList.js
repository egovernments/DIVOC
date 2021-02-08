import React, {useState} from 'react';
import './ProgramList.css';
import ProgramActiveImg from "../../assets/img/program-active.svg";
import ProgramInActiveImg from "../../assets/img/program-inactive.svg";
import Button from 'react-bootstrap/Button';
import Form from "@rjsf/core";
import { CustomSwitch } from '../CustomSwitch/CustomSwitch';

function ProgramList({listData,show,setShow,schema,uiSchema,widgets,onEdit,setSelectedData,autoFillForm}) {
    const [selectedIndex, setSelectedIndex] = useState(-1);


    return (
        <div>
            {
                selectedIndex === -1 && <>
                 <div className="d-flex">
                    <p className={" p-2 mr-auto"}><b>List of Registered Vaccine Programs</b></p>
                    <Button variant="outline-primary" onClick={()=> setShow(!show)}>REGISTER NEW VACCINE PROGRAM</Button>
                 </div>
                 <div className="cards-container">
                 {listData.map((data, index) => {
                    return (
                        <div className={'list-view-card-container'} >
                            <div className="d-flex justify-content-between" onClick={() => {setSelectedIndex(index);setSelectedData(data)}}>
                                <span className={'list-view-name'}>{data.name}</span>
                                <span className={'list-view-logo-img'}>
                                    {"image" in data ? <img alt="" src={data.image} width={"100%"}/> : "LOGO"}
                                    <img src={data.status === "Active" ? ProgramActiveImg : ProgramInActiveImg}
                                            className={'list-view-program-status-img'} alt={data.status}
                                            title={data.status}/>
                                </span>
                            </div>
                            
                            <div>{data.description}</div>
                            <div className="additional-details-card">
                                <div className="d-flex">
                                    <span>Start Date</span>&emsp;&emsp;
                                    <span>End Date</span>
                                    <div className="ml-auto">
                                        <CustomSwitch
                                            checked={data.status==="Active" || false}
                                            onChange={() => {
                                                setSelectedData(data);
                                                let editedData =  Object.assign({}, data);
                                                editedData.status = editedData.status==="Active" ? "Inactive" : "Active" ;
                                                onEdit(editedData)
                                            }}
                                            color="primary"
                                            
                                        />
                                    </div>
                                </div>
                                <div className="d-flex">
                                    <span><b>{data.startDate}</b></span>&emsp;
                                    <span><b>{data.endDate}</b></span>
                                    <p className="ml-auto">{data.status === "Active" ? "Active" : "Inactive"}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
                 </div>
                </>
            }
            {
                selectedIndex > -1 &&
                <div>
                    <div className={"list-view-selected-container"}>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className={'list-view-name'}>{listData[selectedIndex].name}</span>
                            <button className="mt-3 list-selected-back-btn" onClick={() => setSelectedIndex(-1)}>BACK</button>
                        </div>
                        <div className="form-container">
                            <Form
                                schema={schema}
                                uiSchema={uiSchema}
                                widgets={widgets}
                                onSubmit={(e) => {
                                    onEdit(e.formData);
                                }}
                                formData={autoFillForm()}
                            >
                                <button type="submit" className="custom-button">SAVE</button>
                            </Form>
                        </div>
                    </div>
                </div>
            }
        </div>

    );
}

export default ProgramList;
import React, {useState} from 'react';
import './ListView.css';
import ProgramActiveImg from "../../assets/img/program-active.svg";
import Program from "../../assets/img/program.svg";
import ProgramInActiveImg from "../../assets/img/program-inactive.svg";
import Button from 'react-bootstrap/Button';
import Form from "@rjsf/core";

function ListView({listData, fields,show,setShow,title,buttonTitle,schema,uiSchema,widgets}) {
    const [selectedIndex, setSelectedIndex] = useState(-1);

    function autoFillForm() {
        return { 
            name : listData[selectedIndex].name, 
            description: listData[selectedIndex].description,
            logoURL: listData[selectedIndex].logoURL,
            startDate: listData[selectedIndex].startDate,
            endDate: listData[selectedIndex].endDate,
            vaccine: listData[selectedIndex].vaccine,
            provider: listData[selectedIndex].provider,
            price: listData[selectedIndex].price,
            effectiveUntil: listData[selectedIndex].effectiveUntil,
        }
    } 
    return (
        <div>
            {
                selectedIndex === -1 && <>
                 <div className="d-flex">
                    <p className={" p-2 mr-auto"}>{title}</p>
                    <Button variant="outline-primary" onClick={()=> setShow(!show)}>{buttonTitle}</Button>
                 </div>
                {listData.map((data, index) => {
                    return (
                        <div className={'list-view-card-container'}>
                            <div className={'list-view-card-details'}>
                                <div className="d-flex justify-content-between">
                                    <span className={'list-view-name'}>{data.name}</span>
                                    <span className={'list-view-logo-img'}>
                                        {"image" in data ? <img alt="" src={data.image} width={"100%"}/> : "LOGO"}
                                        <img src={data.status === "Active" ? ProgramActiveImg : ProgramInActiveImg}
                                             className={'list-view-program-status-img'} alt={data.status}
                                             title={data.status}/>
                                    </span>
                                </div>
                                <div className='list-view-details'
                                     onClick={() => setSelectedIndex(index)}>{"More Details ->"}</div>
                            </div>
                        </div>
                    )
                })}
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
                                    window.alert("helloo")
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

export default ListView;
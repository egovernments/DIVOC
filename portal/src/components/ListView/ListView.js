import React, {useState} from 'react';
import './ListView.css';
import ProgramActiveImg from "../../assets/img/program-active.svg";
import Program from "../../assets/img/program.svg";
import ProgramInActiveImg from "../../assets/img/program-inactive.svg";
import Button from 'react-bootstrap/Button';
import Form from "@rjsf/core";
import withStyles from "@material-ui/core/styles/withStyles";
import Switch from "@material-ui/core/Switch/Switch";

function ListView({listData, fields,show,setShow,title,buttonTitle,schema,uiSchema,widgets,showDetails,onStatusChange,setSelectedProgram}) {
    const [selectedIndex, setSelectedIndex] = useState(-1);

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
                        <div className={'list-view-card-container'} >
                            <div className="d-flex justify-content-between" onClick={() => {setSelectedIndex(index)}}>
                                <span className={'list-view-name'}>{data.name}</span>
                                <span className={'list-view-logo-img'}>
                                    {"image" in data ? <img alt="" src={data.image} width={"100%"}/> : "LOGO"}
                                    <img src={data.status === "Active" ? ProgramActiveImg : ProgramInActiveImg}
                                            className={'list-view-program-status-img'} alt={data.status}
                                            title={data.status}/>
                                </span>
                            </div>
                            {showDetails && 
                                <>
                                <div>{data.description}</div>
                                <div className="additional-details-card">
                                    <div className="d-flex">
                                        <span>Start Date</span>&emsp;&emsp;
                                        <span>End Date</span>
                                        <CustomSwitch
                                            className="ml-auto"
                                            checked={data.status==="Active" || false}
                                            onChange={() => {
                                                console.log("data",data.status)
                                                setSelectedProgram(data);
                                                onStatusChange(data,data.status==="Active" ? "Inactive" : "Active" )
                                            }}
                                            color="primary"
                                        />
                                    </div>
                                    <div className="d-flex">
                                        <span><b>{data.startDate}</b></span>&emsp;
                                        <span><b>{data.endDate}</b></span>
                                        <span className="ml-auto p-2">{data.status === "Active" ? "Active" : "Inactive"}</span>
                                    </div>
                                </div>
                                </>
                            }
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
import React, {useState} from 'react';
import './ListView.css';
import AddIconImg from "../../assets/img/add-icon.svg";
import Button from 'react-bootstrap/Button';
import Form from "@rjsf/core";
import withStyles from "@material-ui/core/styles/withStyles";
import Switch from "@material-ui/core/Switch/Switch";

function ListView({listData, fields, show, setShow, title, buttonTitle, schema, uiSchema, widgets, showDetails, onEdit, setSelectedData, autoFillForm}) {
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

    return (
        <div>
            {
                selectedIndex === -1 && <>
                    <div className="d-flex">
                        <p className="font-weight-bold p-2 mr-auto ">{title}</p>
                        {buttonTitle &&
                        <Button variant="outline-primary" className="d-flex align-items-center justify-content-between"
                                style={{height: "3rem", textTransform: "uppercase"}} onClick={() => setShow(!show)}>
                            <img className="mr-1" src={AddIconImg}/> {buttonTitle}</Button>}
                    </div>
                    <div className="cards-container">
                        {listData.map((data, index) => {
                            return (
                                <div className='list-view-card-container'>
                                    <div className="d-flex justify-content-between" onClick={() => {
                                        setSelectedIndex(index);
                                        setSelectedData(data)
                                    }}>
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
                                                onChange={() => {
                                                    setSelectedData(data);
                                                    let editedData = Object.assign({}, data);
                                                    editedData.status = editedData.status === "Active" ? "Inactive" : "Active";
                                                    onEdit(editedData)
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
                                             title={data.description}>{data.description > 300 ? data.description.substr(0, 300) + "..." : data.description}</div>
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
                                                    onChange={() => {
                                                        setSelectedData(data);
                                                        let editedData = Object.assign({}, data);
                                                        editedData.status = editedData.status === "Active" ? "Inactive" : "Active";
                                                        onEdit(editedData)
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
            }
            {
                selectedIndex > -1 &&
                <div>
                    <div className={"list-view-selected-container"}>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className={'list-view-name'}>{listData[selectedIndex].name}</span>
                            <button className="mt-3 list-selected-back-btn" onClick={() => setSelectedIndex(-1)}>BACK
                            </button>
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

export default ListView;
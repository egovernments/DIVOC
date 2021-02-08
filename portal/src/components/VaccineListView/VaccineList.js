import React, {useState} from 'react';
import "../ProgramListView/ProgramList.css"
import Button from 'react-bootstrap/Button';
import Form from "@rjsf/core";
import { CustomSwitch } from '../CustomSwitch/CustomSwitch';


function VaccineList({listData,show,setShow,schema,uiSchema,widgets,onEdit,setSelectedData,autoFillForm}) {
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const activeVaccines= listData.filter(item => item.status === "Active")
    const inActiveVaccines= listData.filter(item => item.status === "Inactive")


    return (
        <div>
            <Button variant="outline-primary" onClick={()=> setShow(!show)} className="register-button">REGISTER NEW VACCINE</Button>
            {selectedIndex === -1 && Object.keys(activeVaccines).length > 0 && 
                <ShowVaccinesCard 
                    title="Active Vaccines"
                    listData={activeVaccines} 
                    setSelectedIndex={setSelectedIndex}
                    setSelectedData={setSelectedData}
                    onEdit={onEdit}
                />
            }
            {selectedIndex === -1 && Object.keys(inActiveVaccines).length > 0 && 
                <ShowVaccinesCard 
                    title="Inactive Vaccines"
                    listData={inActiveVaccines}
                    setSelectedIndex={setSelectedIndex}
                    setSelectedData={setSelectedData}
                    onEdit={onEdit}
                />
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

function ShowVaccinesCard({title,listData,setSelectedData,setSelectedIndex,onEdit}){
    return(
        <>
        <div className="d-flex">
           <p className={" p-2 mr-auto"}><b>{title}</b></p>
        </div>
        <div className="cards-container">
        {listData.map((data, index) => {
           return (
               <div className={'list-view-card-container'} >
                   <div>
                       <span className={'list-view-name'} onClick={() => {setSelectedIndex(index);setSelectedData(data)}}>{data.name}</span>
                       <div className="d-flex justify-content-between">
                           <span className={"details-text"}>{data.provider}</span>
                           <div className="custom-switch">
                               <CustomSwitch 
                                    checked={data.status==="Active" || false}
                                    onChange={()=>{
                                        setSelectedData(data);
                                        let editedData =  Object.assign({}, data);
                                        editedData.status = editedData.status==="Active" ? "Inactive" : "Active" ;
                                        onEdit(editedData)
                                    }}
                               />
                               <p className={"details-text"}>{data.status === "Active" ? "Active" : "Inactive"}</p>
                           </div>
                       </div>
                   </div>
               </div>
           )
       })}
        </div>
       </>
    )
}

export default VaccineList;
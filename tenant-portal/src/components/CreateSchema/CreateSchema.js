import React from "react";
import axios from 'axios';
import { useKeycloak } from "@react-keycloak/web";
import upload_image from "../../assets/img/upload_image.png";
import "./CreateSchema.css"
function CreateSchema() {
    const { keycloak } = useKeycloak();

    const config = {
        headers: {
            Authorization: `Bearer ${keycloak.token} `,
            "Content-Type": "application/json",
        },
    };

    const createSchema = async () => {
        axios
            .post("/vc-management/v1/schema", {}, config)
            .then(res => res.data)
    }

    return(
        <div  className="d-flex flex-column ">
            <div className="d-flex justify-content-between" style={{padding: "2rem 8rem 1rem 8rem", maxHeight: "100%"}}>
                <div className="col-6 px-5">
                    <p className="title">Create New Schema</p>
                    <form className="d-flex flex-column" id="create-schema">
                        <div className="input-group">
                            <label id="name" className="input-label">Name of the Schema</label>
                            <input type="text" id="name" className="w-75 input-box"></input>
                        </div>
                        <div className="input-group"> 
                            <label id="description" className="input-label">Description<span className="secondary-label">(optional)</span></label>
                            <input type="text" id="description" className="w-75 input-box" style={{height: "100px"}}></input>
                        </div>
                    </form>
                </div>
                <div className="col-4 ">
                    <img className="w-100" src={upload_image} ></img>
                </div>
            </div>
            <div className="custom-footer justify-content-end">
                <button className="btn-primary" type="submit" form="create-schema" >Save</button>
            </div>
        </div>
        
    );
}

export default CreateSchema;
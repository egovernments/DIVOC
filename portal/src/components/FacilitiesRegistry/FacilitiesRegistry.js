import React, { useState } from 'react';
import axios from 'axios'
import {useKeycloak} from "@react-keycloak/web";
import UploadCSV from '../UploadCSV/UploadCSV';

function Facilities(){
    const [uploadPercentage,setUploadPercentage] = useState(0);
    const { keycloak } = useKeycloak();

    const uploadFile = (evt) => {
        const fileData = evt.target.files[0]
        let dataToSend = new FormData();
        dataToSend.append( 'file', fileData )

        const options = {
            onUploadProgress: (progressEvent) => {
              const {loaded, total} = progressEvent;
              let percent = Math.floor( (loaded * 100) / total )
              console.log( `${loaded}kb of ${total}kb | ${percent}%` );
      
              if( percent < 100 ){
                setUploadPercentage(percent )
              }
            }
          }
        
        const config = {
            headers: { "Authorization": `Bearer ${keycloak.token} `, "Content-Type": "application/json"}
        };
        axios.post("divoc/admin/api/v1/facilities", dataToSend, config ,options).then(res => { 
            console.log(res)
            setUploadPercentage( 100)
            setTimeout(() => {
            setUploadPercentage(0)
            }, 500);
        })
    }
    return(
       <UploadCSV uploadFile={uploadFile} uploadPercentage={uploadPercentage}/>
    );
}
export default Facilities;
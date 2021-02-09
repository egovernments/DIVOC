import React from "react";
import "./index.css";


export const CustomTextAreaWidget = (props) => {
  return (
      <div>
          <textarea 
              value={props.value || ''} 
              className={"custom-textarea"} 
              rows="4" 
              cols="50" 
              onChange={(event) => props.onChange(event.target.value)}
          />    
      </div>
  );
};

import React from "react";
import "./index.css";


export const CustomTextWidget = (props) => {
  return (
      <div>
          <input type="text"
              className={`custom-text-box ${props.className}`}
              value={props.value || ''}
              required={props.required}
              onChange={(event) => props.onChange(event.target.value)} />
      </div>
  );
};

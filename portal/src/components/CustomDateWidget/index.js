import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import date from "../../assets/img/date.png";
import "./index.css";


export const CustomDateWidget = (props) => {
  const [startDate, setStartDate] = useState(new Date());

  const updateValue = (newValue) => {
    setStartDate(newValue);
    props.onChange(newValue)
};

  const CustomInput = ({ value, onClick }) => (
    <div className="date-picker-container">
        <label className="custom-input" onClick={onClick}>
        {value}
        </label>
        <img src={date} onClick={onClick} />
    </div>
  );
  return (
        <DatePicker 
            selected={startDate} 
            onChange={updateValue} 
            dateFormat="dd-MM-yyyy"
            id="date-picker"
            customInput={<CustomInput />}
        />
  );
};



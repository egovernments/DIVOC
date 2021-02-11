import {maskPersonalDetails} from "../../utils/maskPersonalDetails";

export default function InputMask ({type,name,defaultValue,disabled,handleChange}) {
    return(
        <input 
            className="form-control"
            type={type} 
            name={name} 
            defaultValue={maskPersonalDetails(defaultValue)}
            disabled={disabled} 
            onBlur={(evt) => evt.target.value = maskPersonalDetails(evt.target.value)}
            onFocus={(evt) => evt.target.value = defaultValue} 
            onChange={handleChange}/>
    )
}
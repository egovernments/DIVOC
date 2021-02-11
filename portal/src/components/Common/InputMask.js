import React, {useEffect, useState} from "react";
import {maskString} from "../../utils/config";

export function InputMask({className, numberOfMaskDigit = 3, value, id, onChange, required}) {
    const [realInput, setRealInput] = useState(value)
    const [maskInput, setMaskInput] = useState(maskString(value, numberOfMaskDigit))

    useEffect(() => {
        setMaskInput(maskString(value, numberOfMaskDigit))
    }, [value])

    console.log(realInput, value)

    const onFocused = (event) => {
        setRealInput(value)
    }

    const onBlur = (event) => {
        setMaskInput(maskString(value, numberOfMaskDigit))
        setRealInput(maskInput)
    }

    const onChangeValue = (event) => {
        const changedValue = event.target.value
        setRealInput(changedValue)
        setMaskInput(maskString(value, numberOfMaskDigit))
        if (onChange) {
            onChange(event)
        }
    }

    if (required) {
        return <input
            className={className}
            value={realInput}
            type="text"
            id={id}
            placeholder={maskInput}
            onFocus={onFocused}
            onBlur={onBlur}
            onChange={onChangeValue}
            required/>
    } else {
        return <input
            className={className}
            value={realInput}
            placeholder={maskInput}
            type="text"
            id={id}
            onFocus={onFocused}
            onBlur={onBlur}
            onChange={onChangeValue}/>
    }
}

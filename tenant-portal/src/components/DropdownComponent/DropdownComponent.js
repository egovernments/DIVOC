import React from 'react';
import {Dropdown, DropdownButton} from 'react-bootstrap';

const DropdownComponent = (props) => {
  return (
    <DropdownButton
    variant = {props.variant}
    align = {props.align}
    title={props.title}>
        {Object.keys(props.obj).map((objKey) => (
            <Dropdown.Item
              key={objKey}
              onClick={() => props.fn(objKey)}
            >
              {props.obj[objKey]}
            </Dropdown.Item>
          ))}
    </DropdownButton>
  )
}

export default DropdownComponent
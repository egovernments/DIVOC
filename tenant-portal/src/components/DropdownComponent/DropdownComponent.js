import React from 'react';
import {Dropdown, DropdownButton} from 'react-bootstrap';

const DropdownComponent = ({
  options,
  handleChange,
  variant,
  title,
  align,
  className
}) => {
  return (
    <DropdownButton className={className}
      variant = {variant}
      align = {align}
      title={title}>
        {Object.keys(options).map((objKey) => (
            <Dropdown.Item
              key={objKey}
              onClick={() => handleChange(objKey)}
            >
              {options[objKey]}
            </Dropdown.Item>
          ))}
    </DropdownButton>
  )
}

export default DropdownComponent
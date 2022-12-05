import React from 'react';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

const GenericButton = (props) => {
  return (
    <Button variant={props.variant} type={props.type} form={props.form}  style={props.styles}>
        <img src={props.img} alt="" className={(props.img ? 'me-3': '')}/><strong>{props.text}</strong>
    </Button>
  )
}

export default GenericButton
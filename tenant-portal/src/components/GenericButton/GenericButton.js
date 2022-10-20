import React from 'react';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

const GenericButton = (props) => {
  return (
        <Button type={props.type} className='m-1' 
        style={{ background: 'linear-gradient(to right, rgba(115,186,244,1), rgba(83,103,202,1))' }}>
            <img src={props.img} alt="" className='me-3'/><strong>{props.text}</strong>
        </Button>
  )
}

export default GenericButton
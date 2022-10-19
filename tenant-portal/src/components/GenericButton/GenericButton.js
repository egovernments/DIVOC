import React from 'react';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

const GenericButton = (props) => {
  return (
        <Button variant='primary' className='m-1'><img src={props.img} alt=""/>{props.text}</Button>
  )
}

export default GenericButton
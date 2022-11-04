import React from 'react'
import { Card } from 'react-bootstrap'

const InfoCard = (props) => {
  return (
    <Card className={props.className} >
        <Card.Body>
            <Card.Title><span><img src={props.icon} /></span> {props.title}</Card.Title>
            <Card.Text>
                <i>{props.text} <br/> <strong>{props.imptext}</strong></i>
            </Card.Text>
        </Card.Body>
    </Card>
    
  )
}

export default InfoCard
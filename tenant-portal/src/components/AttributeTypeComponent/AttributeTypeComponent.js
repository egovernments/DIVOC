import {Container} from "react-bootstrap";
import styles from "./AttributeTypeComponent.module.css"
import {useDrag} from "react-dnd";
import {DRAG_AND_DROP_TYPE} from "../../constants";

function AttributeTypeComponent({label, type, selectAttributeType}) {
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: DRAG_AND_DROP_TYPE,
            item: { label: label, type: type },
            end: (item, monitor) => {
                // const dropResult = monitor.getDropResult()
                selectAttributeType(type,label);
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [label, type],
    )
    return (
        <Container ref={drag} key={type} className={`py-2 rounded-1 shadow-sm mb-2 ${styles['attribute-type']}`}>
            {label}
        </Container>
    )
}

export default AttributeTypeComponent
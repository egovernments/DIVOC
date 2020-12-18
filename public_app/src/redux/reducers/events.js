import axios from "axios";

export const EVENT_ACTION_TYPES = {
    ADD_EVENT: "ADD_EVENT",
    REMOVE_EVENT: "REMOVE_EVENT"
};
export const EVENT_TYPES = {
    "DOWNLOAD_CERTIFICATE": "download",
    "VERIFY_CERTIFICATE": "verify"
};
const initialState = {
    data: [],
};

export function eventsReducer(state = initialState, action) {
    switch (action.type) {
        case EVENT_ACTION_TYPES.ADD_EVENT: {
            return {
                ...state,
                data: [...state.data, {id: state.data.length, ...action.payload}],

            };
        }
        case EVENT_ACTION_TYPES.REMOVE_EVENT: {
            return {
                ...state,
                data: state.data.filter(event => !action.payload.includes(event.id)),

            };
        }
        default:
            return state;
    }
}

export const addEventAction = (event) => {
    return {
        type: EVENT_ACTION_TYPES.ADD_EVENT,
        payload: {...event, date: new Date().getTime()}
    }
};

const removeEventsAction = (eventIds) => {
    return {
        type: EVENT_ACTION_TYPES.REMOVE_EVENT,
        payload: eventIds
    }
};

export const postEvents = ({data}, dispatch) => {
    if(data.length > 0) {
        axios
            .post("/divoc/api/v1/events/", data)
            .then((res) => {
                return dispatch(removeEventsAction(data.map(e => e.id)));
            });
    }
};
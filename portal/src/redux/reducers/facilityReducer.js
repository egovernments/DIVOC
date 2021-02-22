const FACILITY_ACTION_TYPES = {
    "ADD_FACILITY_DETAILS": "ADD_FACILITY_DETAILS"
};
const initialState = {};

export function facilityReducer(state = initialState, action) {
    switch (action.type) {
        case FACILITY_ACTION_TYPES.ADD_FACILITY_DETAILS: {
            if (action.payload) {
                return {
                    ...state,
                    ...action.payload
                }
            }
            return state
        }
        default:
            return state
    }
}

export const addFacilityDetails = (data) => {
    return {
        type: FACILITY_ACTION_TYPES.ADD_FACILITY_DETAILS,
        payload: data
    }
};



import state_and_districts from '../../utils/state_and_districts.json';
import {ApiServices} from "../../Services/ApiServices";

const FLAGR_ACTION_TYPES = {
    "LOAD_APPLICATION_CONFIG": "LOAD_APPLICATION_CONFIG"
};
const initialState = {
    appConfig: {
        "applicationLogo": "",
        "currency": "INR",
        "countryCode": "+91",
        "countryName": "India",
        "stateAndDistricts": state_and_districts
    }
};

export function flagrConfigReducer(state = initialState, action) {
    switch (action.type) {
        case FLAGR_ACTION_TYPES.LOAD_APPLICATION_CONFIG: {
            if (action.payload) {
                return {
                    ...state,
                    appConfig: action.payload
                }
            }
            return state
        }
        default:
            return state
    }
}

export const loadApplicationConfig = (data) => {
    return {
        type: FLAGR_ACTION_TYPES.LOAD_APPLICATION_CONFIG,
        payload: data
    }
};

export const storeApplicationConfigFromFlagr = (dispatch) => {
    try {
        ApiServices.fetchApplicationConfigFromFlagr()
            .then((res) => {
                return dispatch(loadApplicationConfig(res["variantAttachment"]))
            })
            .catch((err) => {
                console.log("Error occurred while fetching application config from flagr");
                console.log(err)
            })
    } catch (e) {
        console.log(e)
    }
};

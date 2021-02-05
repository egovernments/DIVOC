import axios from "axios";
import state_and_districts from '../../utils/state_and_districts.json';
import NavbarLogo from "../../assets/img/nav-logo.png";

const FLAGR_ACTION_TYPES = {
    "LOAD_APPLICATION_CONFIG": "LOAD_APPLICATION_CONFIG"
};
const initialState = {
    appConfig: {
        "applicationLogo": NavbarLogo,
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

export const getApplicationConfigFromFlagr = (dispatch) => {
    const data = {
        "flagKey": "country_specific_features"
    };
    try {
        axios
            .post("https://divoc.xiv.in/config/api/v1/evaluation", data)
            .then((res) => {
                return dispatch(loadApplicationConfig(res.data["variantAttachment"]))
            })
            .catch((err) => {
                console.log("Error occurred while fetching application config from flagr");
                console.log(err)
            })
    } catch (e) {
        console.log(e)
    }
};

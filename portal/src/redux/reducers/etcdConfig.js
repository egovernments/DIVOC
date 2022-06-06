import state_and_districts from '../../utils/state_and_districts.json';
import {CONSTANTS} from "../../utils/constants";
import NavbarLogo from "../../assets/img/nav-logo.png";

const ETCD_ACTION_TYPES = {
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

export function etcdConfigReducer(state = initialState, action) {
    switch (action.type) {
        case ETCD_ACTION_TYPES.LOAD_APPLICATION_CONFIG: {
            if (action.payload && Object.keys(action.payload).length !== 0) {
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
        type: ETCD_ACTION_TYPES.LOAD_APPLICATION_CONFIG,
        payload: data
    }
};

export const getApplicationConfigFromEtcd = (dispatch, axiosInstance) => {
    try {
        let params = {
            key: CONSTANTS.COUNTRY_SPECIFIC_FEATURES_KEY
        };
        axiosInstance.current.get(`/divoc/admin/api/v1/config/${params.key}`)
            .then((res) => {
                return dispatch(loadApplicationConfig(res.data))
            })
            .catch((err) => {
                console.log("Error occurred while fetching application config from etcd");
                console.log(err)
            })
    } catch (e) {
        console.log(e)
    }
};
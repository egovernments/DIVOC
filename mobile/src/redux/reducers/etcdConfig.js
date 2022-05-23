import state_and_districts from '../../utils/state_and_districts.json';
import {applicationConfigsDB} from "../../Services/ApplicationConfigsDB";
import {ApiServices} from "../../Services/ApiServices";

const ETCD_ACTION_TYPES = {
    "LOAD_APPLICATION_CONFIG": "LOAD_APPLICATION_CONFIG"
};
const initialState = {
    appConfig: {
        "applicationLogo": "",
        "currency": "INR",
        "countryCode": "+91",
        "countryName": "India",
        "stateAndDistricts": state_and_districts,
        "nationalities": ["Others"]
    }
};

export function etcdConfigReducer(state = initialState, action) {
    switch (action.type) {
        case ETCD_ACTION_TYPES.LOAD_APPLICATION_CONFIG: {
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
        type: ETCD_ACTION_TYPES.LOAD_APPLICATION_CONFIG,
        payload: data
    }
};

export const storeApplicationConfigFromEtcd = (dispatch) => {
    try {
        ApiServices.fetchApplicationConfigFromEtcd()
            .then((res) => {
                const configs = res;
                return applicationConfigsDB.saveApplicationConfigs(configs)
                    .finally(() => {
                        dispatch(loadApplicationConfig(configs))
                    })
            })
            .catch((err) => {
                console.log("Error occurred while fetching application config from etcd");
                console.log(err)
            })
    } catch (e) {
        console.log(e)
    }
};

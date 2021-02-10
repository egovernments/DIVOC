import { combineReducers } from "redux";
import {flagrConfigReducer} from "./flagrConfig";
import {facilityReducer} from "./facilityReducer";

export default combineReducers({flagr: flagrConfigReducer, facility: facilityReducer})

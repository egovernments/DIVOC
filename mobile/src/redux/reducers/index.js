import { combineReducers } from "redux";
import {flagrConfigReducer} from "./flagrConfig";

export default combineReducers({flagr: flagrConfigReducer})

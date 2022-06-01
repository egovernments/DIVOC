import { combineReducers } from "redux";
import {facilityReducer} from "./facilityReducer";
import {etcdConfigReducer} from "./etcdConfig";

export default combineReducers({etcd: etcdConfigReducer, facility: facilityReducer})

import { combineReducers } from "redux";
import {etcdConfigReducer} from "./etcdConfig";

export default combineReducers({etcd: etcdConfigReducer})

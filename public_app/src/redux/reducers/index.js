import { combineReducers } from "redux";
import {eventsReducer} from "./events";

export default combineReducers({ events: eventsReducer });

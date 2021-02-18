import {getCookie} from "./cookies";
import {CITIZEN_TOKEN_COOKIE_NAME} from "../constants";
import jwt from "jwt-decode";

export function getUserNumberFromRecipientToken() {
    const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
    if (token) {
        let tokenBody = jwt(token);
        return tokenBody.Phone
    } else
        return undefined
}

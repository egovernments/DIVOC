import React, {createContext, useContext, useMemo, useReducer} from "react";
import {useHistory} from "react-router";
import config from "config.json"

export const ACTION_LOGGED_IN = 'login';
export const ACTION_LOGGED_OUT = 'logout';


const initialState = {isLoggedIn: !!localStorage.getItem("user")};

function authReducer(state, action) {
    switch (action.type) {
        case ACTION_LOGGED_IN: {
            localStorage.setItem("user", JSON.stringify(action.payload))
            return {isLoggedIn: true};
        }
        case ACTION_LOGGED_OUT: {
            localStorage.clear()
            return {isLoggedIn: false};
        }
        default:
            throw new Error();
    }
}

const AuthContext = createContext(null);

export function AuthProvider(props) {
    const [state, dispatch] = useReducer(authReducer, initialState)
    const value = useMemo(() => [state, dispatch], [state])
    return <AuthContext.Provider value={value} {...props} />
}

export function useAuthorizedUser() {
    const context = useContext(AuthContext)
    const history = useHistory();

    if (!context) {
        throw new Error(`useAuthorizedUser must be used within a AuthProvider`)
    }
    const [state, dispatch] = context

    const saveUserToken = function (user) {
        dispatch({type: ACTION_LOGGED_IN, payload: user});
    }

    const logout = function () {
        dispatch({type: ACTION_LOGGED_OUT});
        history.replace(config.urlPath)
    }

    return {
        state,
        dispatch,
        saveUserToken,
        logout
    }
}

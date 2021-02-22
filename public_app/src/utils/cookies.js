import Cookies from 'universal-cookie';

const cookies = new Cookies();

export const setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${cname}=${cvalue};${expires};path=/`;
}

export const getCookie = (cname) => {
    return cookies.get(cname);
}

export const removeCookie = (cname) => {
    return cookies.remove(cname)
}

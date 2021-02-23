export const isAllLetter = (inputTxt) =>{
    const letters = /^[A-Za-z]+$/;
    return inputTxt.match(letters);
}

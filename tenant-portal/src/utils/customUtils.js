const standardizeString = (str) => {
    return (str.charAt(0).toUpperCase()+str.slice(1)).match(/[A-Z][a-z]+|[0-9]+/g).join(" ");
};
const downloadPdf = (samplefile) => {
    var dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", samplefile);
    dlAnchorElem.setAttribute("download", "sample.pdf");
    dlAnchorElem.click();
};

const camelCase = (str) => {
    let string = str.replace(/[^A-Za-z0-9]/g, ' ').split(' ')
        .reduce((result, word) => result + capitalize(word))
    return string.charAt(0).toLowerCase() + string.slice(1)
}

const capitalize = str => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1)


export {standardizeString, downloadPdf, camelCase};
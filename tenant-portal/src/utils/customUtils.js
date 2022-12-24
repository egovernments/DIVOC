const standardizeString = (str) => {
    return (str.charAt(0).toUpperCase()+str.slice(1)).match(/[A-Z][a-z]+|[0-9]+/g).join(" ");
};
const downloadPdf = (samplefile) => {
    var dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", samplefile);
    dlAnchorElem.setAttribute("download", "sample.pdf");
    dlAnchorElem.click();
};

export {standardizeString, downloadPdf};
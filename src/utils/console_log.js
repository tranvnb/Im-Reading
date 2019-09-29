const log = function(...args) {
    chrome.extension.getBackgroundPage().console.log(...args);
}

export default {
    log
}
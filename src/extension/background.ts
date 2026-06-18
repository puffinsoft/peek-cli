export {}

import { messageKeys, storageKeys } from "~constants";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message)
    if(message.type === messageKeys.setStorage){
        chrome.storage.local.set({
            [storageKeys.connected]: message.value
        }).then(() => {
            setTimeout(() => {
                sendResponse()
            }, 1500)
        })
    }

    return true;
})
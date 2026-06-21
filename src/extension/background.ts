export { }

import { messageKeys } from "~constants";

let activeWs = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === messageKeys.connect) {
        if(activeWs !== null) {
            sendResponse({
                success: false,
                message: "Already connected or attempting connection"
            })
            return
        }

        activeWs = new WebSocket('ws://localhost:7335');
        
        activeWs.addEventListener('open', () => {
            sendResponse({
                success: true,
                message: null
            })
        });

        activeWs.addEventListener('message', (event) => {
            const { id, url } = JSON.parse(event.data);
            console.log("received " + id + ", " + url)

            setTimeout(() => {
                activeWs.send(JSON.stringify({
                    type: "screenshot",
                    id,
                    data: "I got " + url
                }))
            }, 3000)
        })

        activeWs.addEventListener('close', () => {
            activeWs = null;
        })

        activeWs.addEventListener('error', () => {
            activeWs = null;
        })

        setTimeout(() => {
            if(activeWs?.readyState !== WebSocket.OPEN){
                activeWs = null;
                sendResponse({
                    success: false,
                    message: "Failed to connect to WebSocket server."
                })
            }
        }, 1000)
    }

    if(message.type === messageKeys.status){
        sendResponse({
            connected: activeWs?.readyState === WebSocket.OPEN
        })
    }
    return true;
})
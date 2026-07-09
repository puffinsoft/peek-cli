export { }

import { messageKeys } from "~utils/constants";
import { connectedIcon, disconnectedIcon, updateIconByWs, urlMatches } from "~utils/util";



let activeWs = null;

chrome.runtime.onStartup.addListener(() => updateIconByWs(activeWs))
chrome.tabs.onActivated.addListener(() => updateIconByWs(activeWs))

type CaptureRequest = {
    id: string;
    url: string;
}

let urlQueue: Array<CaptureRequest> = []
let currentlyScanning = false;


const scan = async () => {
    if (currentlyScanning) return;
    if (urlQueue.length == 0) return;

    currentlyScanning = true;
    try {
        while (urlQueue.length > 0) {
            const { id, url } = urlQueue.shift();
            try {
                const targetTab = await findTab(url);
                if (!targetTab) {
                    activeWs.send(JSON.stringify({
                        success: false,
                        id,
                        message: "Failed to find tab with URL " + url,
                        data: null
                    }))
                } else {
                    const { tab, prevTab } = targetTab;
                    await chrome.windows.update(tab.windowId, { focused: true });
                    await chrome.tabs.update(tab.id, { active: true });
                    // Small delay to ensure the OS / Chrome has rendered the switch visually
                    await new Promise((resolve) => setTimeout(resolve, 150));


                    const screenshotDataURL = await chrome.tabs.captureVisibleTab()

                    /**
                     * only glow for the last screenshot to speed up capture flow.
                     * must extract to var here in case new capture request comes in
                     * during capture
                     */
                    const shouldGlow = urlQueue.length === 0;

                    if (shouldGlow) {
                        try {
                            await chrome.tabs.sendMessage(tab.id, { type: messageKeys.showGlow })
                        } catch (error) {
                            // content script not injected
                        }
                    }

                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    if (shouldGlow) {
                        try {
                            await chrome.tabs.sendMessage(tab.id, { type: messageKeys.hideGlow })
                        } catch (error) { }
                    }

                    activeWs.send(JSON.stringify({
                        success: true,
                        id,
                        message: "Successfully glowed URL " + url,
                        data: screenshotDataURL
                    }))

                    await new Promise((resolve) => setTimeout(resolve, 600));
                    if (prevTab && tab.id !== prevTab.id) {
                        await chrome.windows.update(prevTab.windowId, { focused: true });
                        await chrome.tabs.update(prevTab.id, { active: true });
                    }
                }
            } catch (error) {
                activeWs.send(JSON.stringify({
                    success: false,
                    id,
                    message: "An unexpected error occured. Reason: " + error.name,
                    data: null
                }))
            }
        }
    } finally {
        currentlyScanning = false;
    }
}

/**
 * attempts to find the matching tab for requested URL.
 * checks if base URL matches requested URL.
 * strips out params & hash.
 * prioritizes active tab first.
 * 
 * WARNING: prevTab can be null.
 * 
 * @returns id of matching tab, null if not found.
 * ^ null handling (opening if not found) will be added later.
 */
const findTab = async (url: string) => {
    const topTabs = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }) // this is not an expensive

    if (topTabs.length === 1 && urlMatches(topTabs[0].url, url)) {
        return {
            tab: topTabs[0],
            prevTab: topTabs[0]
        }
    }

    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
        if (urlMatches(tab.url, url)) {
            return {
                tab,
                prevTab: topTabs.length > 0 ? topTabs[0] : null
            }
        }
    }

    return null;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === messageKeys.connect) {
        if (activeWs !== null) {
            sendResponse({
                success: false,
                message: "Already connected or attempting connection"
            })
            return
        }

        activeWs = new WebSocket('ws://localhost:7335');

        activeWs.addEventListener('open', () => {
            connectedIcon().then(() => {
                sendResponse({
                    success: true,
                    message: null
                })
            })
        });

        activeWs.addEventListener('message', async (event) => {
            const { id, type, url } = JSON.parse(event.data);

            if (type === "heartbeat") {
                activeWs.send(JSON.stringify({
                    id: "heartbeat",
                }))

                // call chrome.* API to reset timer
                chrome.runtime.getPlatformInfo();
            } else if (type === "screenshot") {
                urlQueue.push({
                    id,
                    url
                })

                if (!currentlyScanning) scan()
            } else if (type === "urls") {
                const tabs = await chrome.tabs.query({});

                activeWs.send(JSON.stringify({
                    success: true,
                    id,
                    data: tabs.map(e => e.url)
                }))
            }
        })

        activeWs.addEventListener('close', () => {
            activeWs = null;
            disconnectedIcon()
        })

        activeWs.addEventListener('error', () => {
            activeWs = null;
            disconnectedIcon()
        })

        setTimeout(() => {
            if (activeWs?.readyState !== WebSocket.OPEN) {
                activeWs = null;
                sendResponse({
                    success: false,
                    message: "Connection failed.\nDid you run start?"
                })
            }
        }, 1000)
    }

    if (message.type === messageKeys.status) {
        sendResponse({
            connected: activeWs?.readyState === WebSocket.OPEN
        })
    }
    return true;
})
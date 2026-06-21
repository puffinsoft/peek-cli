export { }

import { messageKeys } from "~constants";

let activeWs = null;

const urlMatches = (url: string, match: string) => {
    const parsed = new URL(url)
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString() === match;
}


/**
 * attempts to find the matching tab for requested URL.
 * checks if base URL matches requested URL.
 * strips out params & hash.
 * prioritizes active tab first.
 * 
 * @returns id of matching tab, null if not found.
 * ^ null handling (opening if not found) will be added later.
 */
// MAKE FUZZY SEARCH BETTER (i.e., trailing /)
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
                prevTab: topTabs[0]
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
            sendResponse({
                success: true,
                message: null
            })
        });

        activeWs.addEventListener('message', async (event) => {
            const { id, url } = JSON.parse(event.data);

            const targetTab = await findTab(url);
            if (targetTab === null) {
                activeWs.send(JSON.stringify({
                    success: false,
                    id,
                    message: "Failed to find tab with URL " + url,
                    data: null
                }))
            } else {
                console.log('glow start')
                const { tab, prevTab } = targetTab;
                await chrome.windows.update(tab.windowId, { focused: true });
                await chrome.tabs.update(tab.id, { active: true });
                // Small delay to ensure the OS / Chrome has rendered the switch visually
                await new Promise((resolve) => setTimeout(resolve, 150));
                console.log("delay")
                await chrome.tabs.sendMessage(tab.id, { type: messageKeys.showGlow })
                await new Promise((resolve) => setTimeout(resolve, 3000));
                await chrome.tabs.sendMessage(tab.id, { type: messageKeys.hideGlow })

                console.log('glow end')

                activeWs.send(JSON.stringify({
                    success: true,
                    id,
                    message: "Successfully glowed URL " + url,
                    data: null
                }))
            }
        })

        activeWs.addEventListener('close', () => {
            activeWs = null;
        })

        activeWs.addEventListener('error', () => {
            activeWs = null;
        })

        setTimeout(() => {
            if (activeWs?.readyState !== WebSocket.OPEN) {
                activeWs = null;
                sendResponse({
                    success: false,
                    message: "Failed to connect to WebSocket server."
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
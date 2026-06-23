import disconnectedIconSrc from "url:../assets/icon_gray.png";
import connectedIconSrc from "url:../assets/icon_color.png";

export const disconnectedIcon = () => {
    return chrome.action.setIcon({
        path: disconnectedIconSrc
    })
}

export const connectedIcon = () => {
    return chrome.action.setIcon({
        path: connectedIconSrc
    })
}

export const updateIconByWs = (activeWs) => {
    if (activeWs?.readyState !== WebSocket.OPEN) {
        disconnectedIcon()
    } else {
        connectedIcon()
    }
}

export const urlMatches = (url: string, match: string) => {
    const u1 = new URL(url)
    const u2 = new URL(match)

    // remove trailing slashes if exist
    const path1 = u1.pathname.replace(/\/$/, '');
    const path2 = u2.pathname.replace(/\/$/, '');

    return u1.origin === u2.origin && path1 === path2;
}
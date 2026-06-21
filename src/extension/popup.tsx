import { useCallback, useEffect, useState } from "react";
import { messageKeys } from "~constants";

// index.js
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/checkbox/checkbox.js';

import "./popup.css";

import banner from "data-base64:~assets/banner.png"

type ConnectedStatus = boolean | undefined;

const getCurrentTabId = async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  })
  if (!tab?.id) throw new Error("No active tab");
  return tab.id;
}

const show = () => {
  getCurrentTabId().then((id) => {
    chrome.tabs.sendMessage(id, { type: messageKeys.showGlow })
  })
}

const hide = () => {
  getCurrentTabId().then((id) => {
    chrome.tabs.sendMessage(id, { type: messageKeys.hideGlow })
  })
}

function IndexPopup() {
  const [connected, setConnected] = useState<ConnectedStatus>(undefined);

  const getConnectedStatus = useCallback((callback?: Function) => {
    setConnected(undefined)

    chrome.runtime.sendMessage({
      type: messageKeys.status
    }).then(response => {
      setConnected(response.connected)

      callback()
    })
  }, [])

  useEffect(() => {
    getConnectedStatus()
  }, [])

  const renderLabel = () => {
    if (connected) return "yes!";
    if (connected === undefined) return "wait...";
    return "no!"
  }

  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("");


  return (
    <div style={{
      width: 400,
      height: 200,
      paddingTop: 10
    }}>
      <div style={{
        textAlign: "center"
      }}>
        <img src={banner} height={30} />
      </div>

      <md-outlined-button disabled>
        Show Overlay
      </md-outlined-button>

      <p>Connected: {renderLabel()}</p>
      <button onClick={show}>Show Overlay</button>
      <button onClick={hide}>Hide Overlay</button>
      <hr />
      <button onClick={() => {
        setLoading(true);
        chrome.runtime.sendMessage({
          type: messageKeys.connect
        }).then(res => {
          if (res.success) {
            getConnectedStatus(() => {
              setLoading(false)
            })
          } else {
            setLoading(false)
            setError(res.message)
          }
        })

      }} disabled={loading}>Connect</button>
      {error && <p style={{
        color: "red"
      }}>{error}</p>}
    </div>
  )
}

export default IndexPopup

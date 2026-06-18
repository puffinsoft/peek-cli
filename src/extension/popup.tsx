import { useCallback, useEffect, useState } from "react";
import { messageKeys, storageKeys } from "~constants";

type ConnectedStatus = boolean | undefined;

const getCurrentTabId = async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  })
  if (!tab?.id) throw new Error("No active tab");
  return tab.id;
}

function IndexPopup() {
  const [connected, setConnected] = useState<ConnectedStatus>(undefined);

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

  const getConnectedStatus = useCallback(() => {
    setConnected(undefined)
    chrome.storage.local.get([storageKeys.connected]).then((result) => {
      setConnected(result[storageKeys.connected] === "true")
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



  return (
    <div style={{
      width: 400,
      height: 200
    }}>
      <p>Connected: {renderLabel()}</p>
      <button onClick={show}>Show Overlay</button>
      <button onClick={hide}>Hide Overlay</button>
      <hr />
      <input type="text" value={value} onChange={(e) => {
        setValue(e.target.value)
      }}/>
      <button onClick={() => {
        setLoading(true)
        chrome.runtime.sendMessage({
          type: messageKeys.setStorage,
          value
        }).then(() => {
          setLoading(false)
          getConnectedStatus()
        }).catch(console.log)
      }} disabled={loading}>Send to back</button>
    </div>
  )
}

export default IndexPopup

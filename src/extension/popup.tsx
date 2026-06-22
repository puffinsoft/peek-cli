import { useCallback, useEffect, useMemo, useState } from "react";
import { messageKeys } from "~constants";

import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/progress/circular-progress.js';

import "./popup.css";

import banner from "data-base64:~assets/banner.png"

type ConnectedStatus = boolean | undefined;

function IndexPopup() {
  const [connected, setConnected] = useState<ConnectedStatus>(undefined);

  const getConnectedStatus = useCallback((callback?: Function) => {
    setConnected(undefined)

    chrome.runtime.sendMessage({
      type: messageKeys.status
    }).then(response => {
      setConnected(response.connected)

      if (callback) callback();
    })
  }, [])


  const renderLabel = () => {
  }

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("");

  const connect = useCallback(() => {
    setError("")
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
  }, [])

  const connectButton = useMemo(() => {
    let icon;
    let label;
    let disabled = true;
    if (loading) {
      icon = <md-circular-progress indeterminate></md-circular-progress>;
      label = 'connecting...';
    } else if (connected === undefined) {
      icon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis-icon lucide-ellipsis"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>;
      label = 'loading...';
    } else if (connected) {
      icon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5" /></svg>;
      label = 'connected to cli!'
    } else {
      icon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right-icon lucide-arrow-right"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;
      label = 'connect to cli';
      disabled = false;
    }



    return <md-outlined-button onClick={connect} disabled={disabled ? true : undefined}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 5
      }}>
        {icon}
        {label}
      </div>
    </md-outlined-button>
  }, [connected, loading]);

  useEffect(() => {
    getConnectedStatus()
  }, [])

  return (
    <div style={{
      width: 300,
      height: 150,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      <div>
        <div style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 15,
          paddingLeft: 30,
          paddingRight: 30
        }}>
          <img src={banner} height={20} />
          <span>
            {connected ? "you are connected" : "not connected"}
          </span>
        </div>

        <div style={{
          textAlign: "center"
        }}>
          {connectButton}
        </div>

        {error && <div style={{
          marginTop: 20,
          fontWeight: 300,
          textAlign: "center",
          fontSize: 13
        }}>{error}</div>}
      </div>

      <div style={{
        backgroundColor: "#6706cf",
        paddingLeft: 20,
        paddingTop: 5,
        paddingBottom: 5,
        color: "white",
        marginTop: 30,
        fontWeight: 300,
        textAlign: "center",
        fontSize: 11
      }}>
        made with ❤️ by <a href="https://github.com/puffinsoft" style={{
          color: "white"
        }}>puffinsoft</a>.
      </div>
    </div>
  )
}

export default IndexPopup

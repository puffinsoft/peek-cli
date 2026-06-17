const getCurrentTabId = async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  })
  if (!tab?.id) throw new Error("No active tab");
  return tab.id;
}

function IndexPopup() {
  const show = () => {
    getCurrentTabId().then((id) => {
      chrome.tabs.sendMessage(id, { type: "show" })
    })
  }

  const hide = () => {
    getCurrentTabId().then((id) => {
      chrome.tabs.sendMessage(id, { type: "hide" })
    })
  }

  return (
    <div>
      <button onClick={show}>Show Overlay</button>
      <button onClick={hide}>Hide Overlay</button>
    </div>
  )
}

export default IndexPopup

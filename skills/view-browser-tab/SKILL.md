---
name: view-browser-tab
description: Screenshot open browser tabs for visual debugging.
license: MIT
---

You cannot see the consequences of your actions. It is important to get incorporate visual feedback. Use peek-cli to capture screenshots of tabs to aid in front-end development.

Iterate & capture often. Capturing a screenshot of a tab is remarkably cheap.

These are the commands:
- `peeked start` - start the WebSocket server for connection w/ the Chrome Extension
- `peeked stop` - stop the server
- `peeked status` - get server & connection status.
- `peeked list` - get list of all open tabs
- `peeked at <url>` - capture screenshot of tab. Will save it to a temp file. You must read it after.

Run `peeked status` at the start of each session.
- if the server is not started, run `start` and prompt the user to connect.
- if the server is started & extension is connected, it's safe to run all `peeked` commands.

Connecting the extension to the server is a manual process that the user needs to perform. Nothing can be done on your end.

Don't run `peeked stop` unless the user asks because reconnecting is a manual process.

Note: run `peeked at` at most two at a time. Simultaneous capturing works but Chrome throttles shots per second.
If you see a glowing border around the screenshot, that is an artifact from the capture process.
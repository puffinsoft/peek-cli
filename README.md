<p align="center">
    <img src="assets/banner.png" width="400" />
</p>

<p align="center">
<i>peek-cli</i> allows your agents to capture a screenshot of any open tab in your browser.
</p>
<p align="center">
Debug the hardest frontend problems, on any platform, any framework. The ultimate agnostic solution.
</p>

---

---

💡 **How it works:** *peek-cli* uses a browser extension to stream screenshots over WebSockets.

### Installation

1. Install the [Chrome Extension](src/extension/README.md).

<sup>the extension is in the process of approval; manual installation is needed for now.</sup>

2. Install the CLI

```
npm i -g peeked
```

### Usage

1. Start the *peek-cli* server

```
peeked start
```

2. Connect via the browser extension

![](assets/extension.png)

You only need to do this once, on startup.

3. Start your agent!

```bash
peeked list # view all URLs
peeked at http://localhost:3000 # capture screenshot
```
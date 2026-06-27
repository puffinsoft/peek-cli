<p align="center">
    <img src="assets/banner.png" width="400" />
</p>

<p align="center">
peek-cli allows agents to capture a screenshot of any open tab in your browser.
</p>

---

<p align="center">
Works with Claude Code, Codex, Copilot and many more...
</p>

![](assets/hero.png)

<p align="center">
It works by using a browser extension to stream screenshots over WebSockets.
</p>

---

### Usage

*You only need to do steps 1 & 2 once on startup.*

1. Start the WebSocket daemon:

```bash
peeked start
> Successfully started server.
```

2. Connect your browser:

<img src="assets/extension.png" width="300">

3. You're good to go!

```bash
peeked list # view available tabs
> [ 'http://localhost:3000/' ]

peeked at http://localhost:3000 # capture screenshot
> Image saved to: /var/.../peek_cli/images/dd999ee0.jpg
```

---

### Installation

1. Install the [Chrome Extension](src/extension/README.md).

<sup>the extension is in the process of approval; manual installation is needed for now.</sup>

2. Install the CLI

```bash
npm i -g peeked
```

3. Install the Skill

For Claude Code & Copilot:
```bash
/plugin marketplace add puffinsoft/peek-cli
```

For Codex:

```bash
codex plugin marketplace add puffinsoft/peek-cli
```

---

peek-cli is open source software, licensed under the [MIT](LICENSE) license.
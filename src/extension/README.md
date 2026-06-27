### Extension Installation

The extension is awaiting approval to go live on the Chrome Web Store. You will have to install it manually for now.

This is a [Plasmo extension](https://docs.plasmo.com/) that allows me to use React.

Only three steps are needed:

1. Clone this repo

```bash
git clone https://github.com/puffinsoft/peek-cli.git
```

2. Build the extension

```bash
cd peek-cli/src/extension
npm run build
```

A new folder will be created in `./build/chrome-mv3-prod`.

3. Load unpacked extension

Go to `chrome://extensions` and turn on Developer mode on the top right.

Select "Load unpacked" and upload the `chrome-mv3-prod` folder.

4. You're good to go!
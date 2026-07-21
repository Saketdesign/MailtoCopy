# Mailto:Copy

Mailto:Copy is a Chrome extension that copies email addresses from `mailto:` links instead of opening the default mail app.

## About

Clicking an email link on a web page normally opens a mail client. Mailto:Copy intercepts those links, extracts the email address, decodes it, and writes it to your clipboard.

After a successful copy, the extension shows a small confirmation toast, plays a short success cue, and briefly lights the viewport edge. Motion-sensitive users keep the clipboard behavior while the pulse animation is disabled through `prefers-reduced-motion`.

## Chrome Extension Link

Chrome Web Store: https://chromewebstore.google.com/detail/lbinbpbddnflfchnmbikkbniglehbaej

## Install Locally

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose this project folder.

## Files

- `manifest.json` defines the Manifest V3 extension metadata and content scripts.
- `content.js` intercepts `mailto:` interactions and handles clipboard feedback.
- `styles.css` styles the confirmation toast and pulse overlay.
- `paper-pulsing-border.js` renders the animated border effect.
- `THIRD_PARTY_NOTICES.md` lists third-party attribution.

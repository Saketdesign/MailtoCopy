# mailto:copy

[![license: mit](https://img.shields.io/badge/license-mit-yellow.svg)](LICENSE)
[![chrome web store](https://img.shields.io/badge/chrome_web_store-available-blue.svg)](https://chromewebstore.google.com/detail/lbinbpbddnflfchnmbikkbniglehbaej)
[![ci](https://github.com/Saketdesign/MailtoCopy/actions/workflows/ci.yml/badge.svg)](https://github.com/Saketdesign/MailtoCopy/actions/workflows/ci.yml)

chrome extension that copies email addresses from mailto links instead of opening a mail app.

## how it works

clicking an email link usually opens a desktop mail app you didn't ask for. mailto:copy intercepts the click, extracts and decodes the email address, and copies it to your clipboard.

after copying, the extension displays a quick confirmation toast and a brief pulse around the viewport edge. if you have `prefers-reduced-motion` enabled in your system, the animation is skipped while clipboard copying still works.

## install

- [chrome web store](https://chromewebstore.google.com/detail/lbinbpbddnflfchnmbikkbniglehbaej)
- or load unpacked in chrome:
  1. go to `chrome://extensions`
  2. turn on **developer mode**
  3. click **load unpacked**
  4. select this folder

## files

- `manifest.json`: manifest v3 extension setup and permissions
- `content.js`: catches mailto clicks and handles clipboard copying
- `styles.css`: toast and pulsing border styles
- `paper-pulsing-border.js`: animated border canvas effect
- `THIRD_PARTY_NOTICES.md`: third-party attribution

## community & support

- issue sla: bug reports and questions are answered within 24 hours.
- discussions: join our [github discussions](https://github.com/Saketdesign/MailtoCopy/discussions).

## license

[mit](LICENSE) © 2026 Saket Joshi

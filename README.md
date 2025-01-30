# KeepDown

<img src="extension/icons/KeepDown_Logo[256x256].png" width="128" alt="KeepDown Logo">

A Chrome extension that adds real-time Markdown preview to Google Keep notes. Write your notes in Markdown and see them rendered instantly alongside your text.

## Screenshots

<img src="docs/screenshots/editing.png" width="800" alt="Editing a note with markdown">

<img src="docs/screenshots/preview.png" width="800" alt="Rendered markdown preview">

## Features

- Real-time Markdown preview
- Side-by-side view
- Supports common Markdown syntax:
  - Headers (H1-H3)
  - Lists (ordered and unordered)
  - Emphasis (bold and italic)
  - Code blocks
  - Links
  - Blockquotes
  - GitHub Flavored Markdown:
    - Tables
    - Strikethrough
    - Task lists
    - Autolinks
  - Math expressions (LaTeX syntax)

## Modal Width Control

The extension adds a slider in the popup menu to control the width of the note modal. Click the extension icon to access the slider:
- Default width: 75% of viewport
- Range: 50% to 95% of viewport
- Changes are saved and persist between sessions

## Getting Started

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Build the extension:

```bash
npm run dev
```

4. Load the extension into Chrome:
   - Open Chrome and navigate to chrome://extensions/
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `extension` directory
   - Click "Add"

## Building for Production

```bash
npm run build
```

Create distribution ZIP (for Chrome Web Store):

```bash
mkdir -p dist-zip && zip -r dist-zip/keepdown.zip extension/manifest.json extension/styles.css extension/dist/content.js extension/popup.html extension/popup.js extension/icons/*
```

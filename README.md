# CartShare

CartShare is a responsive collaborative shopping room built with plain HTML, CSS, and JavaScript.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 5500
```

Then visit `http://localhost:5500`.

## Features

- Create a new room or join an existing room by code.
- Add, remove, and mark shared shopping items as picked up.
- Filter the list by all items, your items, or picked-up items.
- Persist each room in `localStorage`.
- Sync room changes across browser tabs with the `storage` event.
- Track a live activity feed and free-delivery progress toward $75.
- Print a clean, audit-ready group receipt with print styles.

## Folder structure

```text
css/styles.css
js/app.js
assets/
index.html
README.md
```

For deployment, this static project can be published with GitHub Pages, Netlify, or Vercel. Use the submission name format `BatchID_FullName_CartShare`.

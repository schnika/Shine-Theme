# AGENTS Instructions

## Scope
These instructions apply to the entire repository.

## Project Overview
This project is a fully static résumé site. Everything runs in the browser with plain HTML, CSS, and JavaScript that work when the files are served from a basic static web host.

## Tooling & Dependencies
- Keep the stack simple: do not add frontend frameworks, component compilers, build pipelines, or runtime dependencies (React, Vue, Angular, Webpack, Vite, etc.).
- Stick to vanilla ES6 modules/DOM APIs, hand-authored HTML, and plain CSS (generated from the existing SCSS files).
- Third-party assets already in the project (Bootstrap CSS, Bootstrap Icons, Font Awesome) may be used as-is, but avoid introducing new library CDNs unless absolutely necessary.

## HTML Guidelines
- Preserve semantic markup and the existing document outline.
- Many elements are referenced by `assets/js/i18n.js` via hard-coded IDs (e.g., `language-select`, `resume-name`, `experience-timeline`, etc.). Do not rename or remove these IDs without updating the script and the translations accordingly.
- Keep accessibility attributes (alt text, aria labels, roles) accurate whenever you change content.

## CSS/SCSS Guidelines
- Uses bootstrap v5.3.3
- Use bootstrap components and utilities
- The shipped stylesheet lives in `assets/css/shine.css` - DO NOT edit directly.
- Modify the SCSS sources in `assets/scss/`, and use sass to regenerate `shine.css` file
- Keep the layout responsive and mobile-friendly; test at multiple viewport widths when you adjust styling.

## JavaScript Guidelines
- All behaviour is implemented with vanilla JS in `assets/js/i18n.js`. Extend it using the same style (modular functions, early returns for null checks, no transpilation-only syntax).
- Avoid introducing global variables unless they are needed by the HTML; prefer module-scoped helpers.
- Maintain graceful error handling for network operations (language file fetches, etc.).

## Localization Content
- Language data lives in `assets/lang/*.json`. When you add or edit content, keep keys consistent across all language files.
- Ensure each language file includes the metadata section used for `<title>` and `<meta>` tags so they remain localized.

## Assets
- Place new static assets under `assets/images/` and reference them with relative paths.
- Compress large images before committing to keep the repository lightweight.

## Testing & Preview
- There are no automated tests. Manually preview the site by serving the repository via a simple static server (for example, `python3 -m http.server`) and inspecting it in a browser.

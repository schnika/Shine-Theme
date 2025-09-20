# Patrick Nüser – Resume Website

## Overview
This repository contains the source of Patrick Nüser's online CV, a fully static single-page site that renders resume content dynamically at runtime. The page is powered by Bootstrap 5 styling, Bootstrap Icons, and a bundled Font Awesome script, and it loads its main stylesheet (`assets/css/shine.css`) and behaviour script (`assets/js/i18n.js`) directly from the `index.html` entry point.

## Tech stack & architecture
- **Static HTML shell** – `index.html` provides the structural markup for the resume sections (profile, experience, skills, projects, education, languages, interests) and wires up external assets such as Google Fonts, Bootstrap Icons, Font Awesome, and the theme CSS.
- **Data-driven localisation** – `assets/js/i18n.js` fetches language JSON files, caches them, and fills the DOM on load, allowing the same markup to render multiple languages while persisting the visitor's preferred choice via `localStorage`.
- **Content sources** – Language-specific resume data lives in `assets/lang/en.json` and `assets/lang/de.json`, covering metadata, summary text, timeline entries, skills, and more.
- **Styling** – The published CSS is compiled from the SCSS entry point `assets/scss/shine.scss`, which defines the colour palette, overrides Bootstrap variables, and imports the Shine theme partials.

## Project structure
```
index.html                # Static shell that loads assets and defines resume sections
assets/
  css/shine.css           # Compiled theme stylesheet
  js/i18n.js              # Language loader and DOM renderer
  lang/en.json            # English resume content
  lang/de.json            # German resume content
  images/                 # Profile photo used in the header
  scss/                   # Bootstrap + Shine SCSS sources for recompiling the CSS
favicon.ico               # Browser tab icon
```

## Getting started locally
Because the resume data is fetched with `window.fetch`, the page must be served over HTTP(S). Opening `index.html` directly from the file system will be blocked by most browsers.

1. Ensure you have a static file server available (e.g. Python 3).
2. From the repository root, start a local server:
   ```bash
   python3 -m http.server 8000
   ```
3. Visit [http://localhost:8000](http://localhost:8000) in your browser to see the site.

Any simple HTTP server (Node's `http-server`, Ruby's `webrick`, etc.) will work equally well.

## Updating resume content
1. Choose the language file you want to edit in `assets/lang/`.
2. Update the relevant sections:
   - `meta`: document title, meta description, and HTML `lang` attribute.
   - `topBar`, `header`, `summary`, `experience`, `additionalExperience`, `techStack`, `softSkills`, `projects`, `education`, `languages`, `interests`: each section maps directly to the markup defined in `index.html` and is rendered by `i18n.js`.
3. Save the file and refresh your browser. The changes appear immediately because the content is rendered client-side.

The profile photo displayed in the header lives at `assets/images/patrick-nüser.256x256.jpg`; replace this file to update the image without changing the markup.

## Adding another language
1. Duplicate an existing JSON file in `assets/lang/` and translate its values.
2. Register the new file inside `LANGUAGE_FILES` near the top of `assets/js/i18n.js` and add it to the language selector options in each language JSON so it appears in the dropdown.
3. Optionally set a new default by updating `currentLanguage` in `i18n.js`.

The loader caches responses and falls back to English if a fetch fails, so additional languages integrate smoothly.

## Styling and theming
- Adjust colour tokens or Bootstrap overrides in `assets/scss/shine.scss`, then recompile the CSS using the Sass CLI:
  ```bash
  sass assets/scss/shine.scss assets/css/shine.css --style=compressed
  ```
- The SCSS entry point imports a full copy of Bootstrap's source and Shine theme partials, allowing fine-grained customisation while keeping the template look and feel.

## Deployment
The site is a static bundle, so you can deploy it to any static host (GitHub Pages, Netlify, Vercel, S3, etc.). Upload the repository contents (or the `index.html` and `assets` directory) and ensure the host serves them over HTTPS for best compatibility with the fetch-based localisation.

## Credits & licensing
This resume builds on the “Shine” Bootstrap 5 template by Xiaoying Riley / 3rd Wave Media, which requires retaining the attribution link in the footer when used for free distributions.

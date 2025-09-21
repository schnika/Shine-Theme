# Patrick Nüser – Resume Website

## Overview
This repository contains the source for Patrick Nüser's online CV. The site is built as a static bundle that can be hosted on Githu
b Pages or any other static host. All resume content lives in language-specific JSON files and is compiled into ready-to-serve `in
dex.html` builds through a lightweight Node-based generator.

Running `pnpm build` renders the Mustache template in `templates/resume.mustache` against the localisation data defined in `assets
/lang/*.json` and the locale configuration in `build.config.json`. The command emits language-specific HTML files (English and Germ
an by default) directly into the repository root so the output can be published without any runtime JavaScript.

## Tech stack & architecture
- **Static HTML builds** – The résumé is rendered ahead of time; no client-side JavaScript is required to populate the page.
- **Mustache templating** – `templates/resume.mustache` defines the shared document structure. It is rendered for each locale with
the help of [`mustache`](https://github.com/janl/mustache.js).
- **Build script** – `scripts/build.mjs` loads `build.config.json`, pulls in the language JSON files, and writes the final `index.
html` and `index.de.html` files. The script validates the configuration, computes helper data (e.g. language proficiency bars), a
nd keeps the output consistently formatted with two-space indentation.
- **Localisation content** – `assets/lang/en.json` and `assets/lang/de.json` provide all résumé copy, including metadata, contact i
nformation, experience, skills, and more.
- **Styling** – The published CSS at `assets/css/shine.css` is compiled from the SCSS entry point `assets/scss/shine.scss`, which c
ustomises Bootstrap 5 and the Shine theme. No changes to the Sass workflow are required for the static build.
- **Assets** – Profile imagery and icons are stored under `assets/images/`, while fonts and icons are loaded from their respective
CDNs.

## Project structure
```
build.config.json         # Locale and asset configuration for the build script
index.html                # English resume (generated)
index.de.html             # German resume (generated)
scripts/build.mjs         # Node build script that renders the Mustache template
templates/resume.mustache # Shared HTML template rendered for each locale
assets/
  css/shine.css           # Compiled theme stylesheet
  lang/en.json            # English resume content
  lang/de.json            # German resume content
  images/                 # Profile photo used in the header
  scss/                   # Bootstrap + Shine SCSS sources for recompiling the CSS
favicon.ico               # Browser tab icon
```

## Getting started locally
1. Install dependencies (once per checkout):
   ```bash
   pnpm install
   ```
2. Regenerate the language-specific HTML files:
   ```bash
   pnpm build
   ```
3. Serve the repository via any static web server:
   ```bash
   python3 -m http.server 8000
   ```
4. Visit [http://localhost:8000](http://localhost:8000) in your browser to preview the résumé pages.

The generated HTML files are committed, so rerun the build whenever you change the template, localisation JSON, build configuration, or the build script to keep `index.html` and `index.de.html` synchronised.

## Updating resume content
1. Edit the appropriate language file under `assets/lang/` (e.g. `en.json` or `de.json`).
2. Ensure any new keys are added consistently across all language files.
3. Run `pnpm build` to regenerate `index.html` and `index.de.html`.
4. Preview the changes in a browser by serving the repository, as described above.

The profile photo displayed in the header lives at `assets/images/patrick-nüser.256x256.jpg`. Replacing this file updates the imag
e without modifying the template or localisation data.

## Adding another language
1. Duplicate an existing JSON file in `assets/lang/` and translate its values.
2. Add a new entry to the `locales` array in `build.config.json`, specifying the locale code, source JSON path, and desired output
filename.
3. Update the `languageSelector.options` array in every language JSON file so the new locale appears in the language switcher.
4. Run `pnpm build` to generate the additional HTML file.

After updating locales, run `pnpm test` to ensure the generated markup still includes the required résumé sections and language links.

## Build configuration
`build.config.json` controls the build script:
- `template`: Path to the Mustache template file.
- `defaultLocale`: Locale used for the `x-default` alternate link.
- `assets.profileImage`: Path to the profile image referenced in the header.
- `locales`: Array describing each locale with `locale` (identifier), `source` (path to the JSON data), and `output` (HTML file na
me).

Adjust these values to change asset references or add/remove languages.

## Styling and theming
- Modify colour tokens or Bootstrap overrides in `assets/scss/shine.scss`, then recompile the CSS using the Sass CLI:
  ```bash
  sass assets/scss/shine.scss assets/css/shine.css --style=compressed
  ```
- The SCSS entry point imports Bootstrap's source and Shine theme partials, allowing fine-grained customisation while keeping the
template look and feel.

## Deployment
The site is a static bundle. Publish the repository contents—including the generated `index.html` files and the `assets` directory—to any static host (GitHub Pages, Netlify, Vercel, S3, etc.). No additional build step is required on the server.

## Testing & linting
- `pnpm test` executes the Node test suite in `tests/`, verifying that the build pipeline keeps critical résumé sections and language cross-links intact.
- `pnpm lint:fix` runs ESLint over `assets/js/` and HTMLHint over the generated pages to automatically address formatting and lint issues.

## Credits & licensing
This résumé builds on the “Shine” Bootstrap 5 template by Xiaoying Riley / 3rd Wave Media, which requires retaining the attribution link in the footer when used for free distributions.

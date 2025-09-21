# AGENTS Instructions

## Scope
These instructions apply to the entire repository.

## Project Overview
This project publishes Patrick Nüser's résumé as a fully static website. All language-specific content is stored in JSON files and rendered into prebuilt HTML pages via a small Node-based pipeline so the site works on GitHub Pages without requiring client-side JavaScript.

## Build & Localisation Workflow
- `pnpm build` runs `scripts/build.mjs`, rendering `templates/resume.mustache` with the locale data from `assets/lang/*.json` and the configuration in `build.config.json`.
- Whenever you edit the template, localisation JSON, build configuration, or the build script itself, rerun `pnpm build` and commit the regenerated `index.html` files to keep them in sync.
- The build script also ensures that each language version links to the others. Preserve those cross-links when making changes.

## Tooling & Dependencies
- Keep the stack lightweight: no frontend frameworks, bundlers, or runtime dependencies such as React, Vue, Angular, Webpack, or Vite.
- Use pnpm for dependency management. All tooling lives in `devDependencies` and should stay minimal.

## HTML Guidelines
- Preserve the semantic structure of the résumé template and maintain the document outline.
- IDs referenced by `assets/js/i18n.js` must remain stable; update the script and translations in tandem if you need to rename them.
- Maintain accurate accessibility attributes (alt text, aria labels, roles) when adjusting markup or content.

## CSS/SCSS Guidelines
- Styling is based on Bootstrap 5.3.3 and the Shine theme.
- Modify the SCSS sources in `assets/scss/` and recompile `assets/css/shine.css` with Sass; never edit the compiled CSS directly.
- Ensure the layout remains responsive—spot-check changes on small and large viewports.

## JavaScript Guidelines
- Behaviour is implemented with vanilla ES modules in `assets/js/`. Follow the existing modular style and avoid adding global variables unless necessary.
- Do not introduce transpilation-only syntax or new build tooling.

## Localisation Content
- Keep localisation keys consistent across every file in `assets/lang/`.
- Ensure each language includes the metadata required for the `<head>` section so titles and descriptions stay localised.

## Assets
- Place new static assets under `assets/images/` and compress large files before committing.
- Reference assets with relative paths that work when hosted from the repository root.

## Testing, Linting & Preview
- Unit tests live under `tests/` and guard the build pipeline. Run `pnpm test` after changing the template, build script, config, or localisation data.
- Run `pnpm lint:fix` whenever you touch JavaScript or HTML to keep formatting and lint rules satisfied.
- Preview the site with a simple static server such as `python3 -m http.server` before shipping visual changes.

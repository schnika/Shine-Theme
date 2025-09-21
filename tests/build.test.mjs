import assert from 'node:assert/strict';
import { test } from 'node:test';
import Mustache from 'mustache';

import {
  computeLanguageIndicators,
  createView,
  loadBuildContext,
} from '../scripts/build.mjs';

const buildContextPromise = loadBuildContext();

test('computeLanguageIndicators maps fractional proficiency to display steps', () => {
  const steps = computeLanguageIndicators(4, 2.5);
  assert.equal(steps.length, 4);
  assert.deepEqual(
    steps.map((step) => step.classSuffix),
    [' item-full', ' item-full', ' item-half', ''],
  );

  const empty = computeLanguageIndicators(0, 3);
  assert.deepEqual(empty, []);

  const nonNegative = computeLanguageIndicators(5, -2);
  assert.equal(nonNegative.length, 5);
  assert.ok(nonNegative.every((step) => step.classSuffix === ''));
});

test('createView adds cross-linked language options and structural defaults', async () => {
  const { config, translations, defaultLocale, profileImage } = await buildContextPromise;

  for (const localeConfig of config.locales) {
    const translation = translations.get(localeConfig.locale);
    assert.ok(translation, `expected translation for ${localeConfig.locale}`);

    const view = createView({
      localeConfig,
      translation,
      translations,
      config,
      profileImage,
      defaultLocale,
    });

    assert.equal(view.meta.lang, translation.meta.lang);

    const alternateHreflangs = new Set(view.alternateLinks.map((link) => link.hreflang));
    for (const entry of config.locales) {
      const alternate = translations.get(entry.locale);
      assert.ok(alternate, `expected alternate translation for ${entry.locale}`);
      assert.ok(
        alternateHreflangs.has(alternate.meta.lang),
        `missing alternate link for locale ${entry.locale}`,
      );
    }
    assert.ok(alternateHreflangs.has('x-default'), 'missing x-default alternate');

    assert.equal(
      view.languageSwitcher.options.length,
      translation.languageSelector.options.length,
    );

    for (const option of view.languageSwitcher.options) {
      const targetConfig = config.locales.find((entry) => entry.locale === option.value);
      const targetTranslation = translations.get(option.value);
      assert.ok(targetConfig, `language option ${option.value} missing locale config`);
      assert.ok(targetTranslation, `language option ${option.value} missing translation`);

      assert.equal(option.href, targetConfig.output);
      assert.equal(option.hreflang, targetTranslation.meta.lang);
      assert.equal(option.isActive, option.value === localeConfig.locale);
    }

    const experienceItems = view.experience.items;
    assert.ok(Array.isArray(experienceItems));
    experienceItems.forEach((item, index) => {
      assert.ok(Array.isArray(item.bullets));
      const expectedLast = index === experienceItems.length - 1;
      assert.equal(item.isLast, expectedLast);
    });

    const maxLanguageLevel = translation.languages?.maxLevel ?? 0;
    view.languages.items.forEach((language) => {
      assert.equal(language.indicators.length, maxLanguageLevel);
    });
  }
});

test('rendered markup keeps the main résumé sections intact', async () => {
  const { config, translations, defaultLocale, profileImage, template } = await buildContextPromise;

  const requiredFragments = [
    '<section class="resume-summary-section',
    '<section class="resume-experience-section',
    '<section class="resume-skills-section',
    '<section class="resume-lang-section',
    '<footer class="footer',
  ];

  for (const localeConfig of config.locales) {
    const translation = translations.get(localeConfig.locale);
    const view = createView({
      localeConfig,
      translation,
      translations,
      config,
      profileImage,
      defaultLocale,
    });

    const html = Mustache.render(template, view);
    assert.ok(html.includes(`<html lang="${translation.meta.lang}">`));

    for (const fragment of requiredFragments) {
      assert.ok(
        html.includes(fragment),
        `expected fragment "${fragment}" in ${localeConfig.output}`,
      );
    }

    for (const option of view.languageSwitcher.options) {
      assert.ok(
        html.includes(`href="${option.href}"`),
        `expected language link for ${option.value} in ${localeConfig.output}`,
      );
    }
  }
});

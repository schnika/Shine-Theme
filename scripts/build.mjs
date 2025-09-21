import { promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Mustache from 'mustache';

const ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

Mustache.escape = (value) => {
  const string = value == null ? '' : String(value);
  return string.replace(/[&<>"']/g, (char) => ENTITY_MAP[char]);
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const CONFIG_PATH = resolve(projectRoot, 'build.config.json');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

export function computeLanguageIndicators(maxLevel, value) {
  const total = Number.isFinite(maxLevel) && maxLevel > 0 ? Math.floor(maxLevel) : 0;
  const target = Number.isFinite(value) ? value : 0;
  const steps = [];

  if (total === 0) {
    return steps;
  }

  let remaining = Math.min(Math.max(target, 0), total);

  for (let index = 0; index < total; index += 1) {
    if (remaining >= 1) {
      steps.push({ classSuffix: ' item-full' });
      remaining -= 1;
    } else if (remaining >= 0.5) {
      steps.push({ classSuffix: ' item-half' });
      remaining = 0;
    } else {
      steps.push({ classSuffix: '' });
      remaining = 0;
    }
  }

  return steps;
}

export function createView({ localeConfig, translation, translations, config, profileImage, defaultLocale }) {
  assert(translation?.meta?.lang, `Missing meta.lang for locale "${localeConfig.locale}"`);

  const alternateLinks = config.locales.map((entry) => {
    const translated = translations.get(entry.locale);
    assert(translated?.meta?.lang, `Missing meta.lang for alternate locale "${entry.locale}"`);
    return {
      hreflang: translated.meta.lang,
      href: entry.output,
    };
  });

  const defaultEntry = config.locales.find((entry) => entry.locale === defaultLocale) ?? config.locales[0];
  if (defaultEntry) {
    alternateLinks.push({ hreflang: 'x-default', href: defaultEntry.output });
  }

  const languageOptions = (translation.languageSelector?.options ?? []).map((option) => {
    const targetConfig = config.locales.find((entry) => entry.locale === option.value);
    assert(targetConfig, `Missing locale config for language option "${option.value}"`);
    const translated = translations.get(option.value);
    assert(translated?.meta?.lang, `Missing translation for language option "${option.value}"`);
    return {
      ...option,
      href: targetConfig.output,
      hreflang: translated.meta.lang,
      isActive: option.value === localeConfig.locale,
    };
  });

  assert(languageOptions.length > 0, `No language options defined for locale "${localeConfig.locale}"`);

  const experienceItems = (translation.experience?.items ?? []).map((item, index, array) => ({
    ...item,
    bullets: item.bullets ?? [],
    isLast: index === array.length - 1,
  }));

  const techGroups = (translation.techStack?.groups ?? []).map((group, index, array) => ({
    ...group,
    items: group.items ?? [],
    hasMargin: index !== array.length - 1,
  }));

  const educationItems = (translation.education?.items ?? []).map((item, index, array) => ({
    ...item,
    hasMargin: index !== array.length - 1,
  }));

  const languageItems = (translation.languages?.items ?? []).map((item, index, array) => ({
    ...item,
    hasMargin: index !== array.length - 1,
    indicators: computeLanguageIndicators(translation.languages?.maxLevel ?? 10, item.level ?? 0),
  }));

  return {
    meta: translation.meta,
    alternateLinks,
    languageSwitcher: {
      label: translation.languageSelector?.label ?? '',
      ariaLabel: translation.languageSelector?.ariaLabel ?? '',
      options: languageOptions,
    },
    topBar: translation.topBar ?? { contactLabel: '', contactLink: '#' },
    header: {
      ...translation.header,
      contact: translation.header?.contact ?? [],
    },
    profileImage,
    summary: {
      heading: translation.summary?.heading ?? '',
      paragraphs: translation.summary?.paragraphs ?? [],
    },
    experience: {
      heading: translation.experience?.heading ?? '',
      items: experienceItems,
    },
    additionalExperience: {
      heading: translation.additionalExperience?.heading ?? '',
      items: translation.additionalExperience?.items ?? [],
    },
    techStack: {
      heading: translation.techStack?.heading ?? '',
      groups: techGroups,
    },
    softSkills: {
      heading: translation.softSkills?.heading ?? '',
      items: translation.softSkills?.items ?? [],
    },
    projects: {
      heading: translation.projects?.heading ?? '',
      items: translation.projects?.items ?? [],
    },
    education: {
      heading: translation.education?.heading ?? '',
      items: educationItems,
    },
    languages: {
      heading: translation.languages?.heading ?? '',
      items: languageItems,
    },
    interests: {
      heading: translation.interests?.heading ?? '',
      items: translation.interests?.items ?? [],
    },
  };
}

export async function loadBuildContext(configPath = CONFIG_PATH) {
  const config = await readJson(configPath);
  assert(Array.isArray(config.locales) && config.locales.length > 0, 'No locales configured');

  const templatePath = resolve(projectRoot, config.template ?? 'templates/resume.mustache');
  const template = await fs.readFile(templatePath, 'utf8');

  const translations = new Map();
  for (const localeConfig of config.locales) {
    assert(localeConfig.locale, 'Locale config missing "locale"');
    assert(localeConfig.source, `Locale "${localeConfig.locale}" missing source`);
    const sourcePath = resolve(projectRoot, localeConfig.source);
    const translation = await readJson(sourcePath);
    translations.set(localeConfig.locale, translation);
  }

  const defaultLocale = translations.has(config.defaultLocale) ? config.defaultLocale : config.locales[0].locale;
  const profileImage = config.assets?.profileImage ?? '';
  assert(profileImage, 'Missing "assets.profileImage" in build.config.json');

  return { config, template, translations, defaultLocale, profileImage };
}

export async function build() {
  const { config, template, translations, defaultLocale, profileImage } = await loadBuildContext();

  for (const localeConfig of config.locales) {
    const translation = translations.get(localeConfig.locale);
    assert(translation, `Missing translation for locale "${localeConfig.locale}"`);
    const view = createView({
      localeConfig,
      translation,
      translations,
      config,
      profileImage,
      defaultLocale,
    });

    const rendered = Mustache.render(template, view);
    const outputPath = resolve(projectRoot, localeConfig.output);
    await fs.writeFile(outputPath, `${rendered.trimEnd()}\n`);
    console.log(`✔ Built ${localeConfig.locale} → ${localeConfig.output}`);
  }
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  build().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

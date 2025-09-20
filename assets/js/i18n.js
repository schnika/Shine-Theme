const LANGUAGE_FILES = {
  en: 'assets/lang/en.json',
  de: 'assets/lang/de.json'
};

const languageCache = new Map();
let currentLanguage = 'en';

async function getLanguageData(language) {
  if (!LANGUAGE_FILES[language]) {
    throw new Error(`Unsupported language: ${language}`);
  }

  if (languageCache.has(language)) {
    return languageCache.get(language);
  }

  const response = await fetch(LANGUAGE_FILES[language]);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${LANGUAGE_FILES[language]}: ${response.status}`);
  }

  const data = await response.json();
  languageCache.set(language, data);
  return data;
}

function cloneIcon(element) {
  if (!element) {
    return null;
  }
  return element.cloneNode(true);
}

function setHeadingText(element, text) {
  if (!element) {
    return;
  }
  const existingIcon = element.querySelector('i');
  const icon = cloneIcon(existingIcon);
  element.innerHTML = '';
  if (icon) {
    element.appendChild(icon);
  }
  const headingText = typeof text === 'string' ? text : '';
  element.appendChild(document.createTextNode(headingText));
}

function renderLanguageSelector(data, language) {
  const select = document.getElementById('language-select');
  const label = document.getElementById('language-select-label');

  if (!select) {
    return;
  }

  if (label && data?.label) {
    label.textContent = data.label;
  }

  select.innerHTML = '';
  const options = Array.isArray(data?.options) ? data.options : [];
  options.forEach((option) => {
    if (!option || !option.value) {
      return;
    }
    if (!LANGUAGE_FILES[option.value]) {
      return;
    }
    const opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.label || option.value;
    select.appendChild(opt);
  });

  if (!Array.from(select.options).some((opt) => opt.value === language)) {
    const opt = document.createElement('option');
    opt.value = language;
    opt.textContent = language;
    select.appendChild(opt);
  }

  select.value = language;

  const ariaLabel = data?.ariaLabel || data?.label;
  if (ariaLabel) {
    select.setAttribute('aria-label', ariaLabel);
  } else {
    select.removeAttribute('aria-label');
  }
}

function renderTopBar(data) {
  const contactButton = document.getElementById('contact-button');
  const topBarNote = document.getElementById('top-bar-note');

  if (contactButton) {
    contactButton.textContent = data?.contactLabel || '';
    contactButton.href = data?.contactLink || '#';
  }

  if (topBarNote) {
    topBarNote.textContent = data?.note || '';
  }
}

function renderHeader(data) {
  const profileImage = document.getElementById('profile-image');
  if (profileImage) {
    profileImage.alt = data?.profileImageAlt || '';
  }

  const nameEl = document.getElementById('resume-name');
  if (nameEl) {
    nameEl.textContent = data?.name || '';
  }

  const roleEl = document.getElementById('resume-role-title');
  if (roleEl) {
    roleEl.textContent = data?.role || '';
  }

  const contactList = document.getElementById('contact-list');
  if (contactList) {
    contactList.innerHTML = '';
    const items = Array.isArray(data?.contact) ? data.contact : [];
    items.forEach((item) => {
      const li = document.createElement('li');
      li.className = item?.className || 'list-inline-item me-md-3 me-lg-5';

      if (item?.icon) {
        const icon = document.createElement('i');
        icon.className = `resume-contact-icon ${item.icon} me-2`;
        li.appendChild(icon);
      }

      if (item?.href) {
        const link = document.createElement('a');
        link.href = item.href;
        link.textContent = item?.text || '';
        li.appendChild(link);
      } else if (item?.text) {
        li.appendChild(document.createTextNode(item.text));
      }

      contactList.appendChild(li);
    });
  }
}

function renderSummary(data) {
  const heading = document.getElementById('summary-heading');
  setHeadingText(heading, data?.heading || '');

  const body = document.getElementById('summary-body');
  if (body) {
    body.innerHTML = '';
    const paragraphs = Array.isArray(data?.paragraphs) ? data.paragraphs : [];
    paragraphs.forEach((text) => {
      const p = document.createElement('p');
      p.textContent = text;
      body.appendChild(p);
    });
  }
}

function renderExperience(data) {
  const heading = document.getElementById('experience-heading');
  setHeadingText(heading, data?.heading || '');

  const timeline = document.getElementById('experience-timeline');
  if (!timeline) {
    return;
  }

  timeline.innerHTML = '';
  const items = Array.isArray(data?.items) ? data.items : [];
  items.forEach((item, index) => {
    const article = document.createElement('article');
    article.className = 'resume-timeline-item position-relative';
    if (index < items.length - 1) {
      article.classList.add('pb-5');
    }

    const header = document.createElement('div');
    header.className = 'resume-timeline-item-header mb-2';

    const meta = document.createElement('div');
    meta.className = 'resume-position-meta d-flex justify-content-between mb-1';

    const time = document.createElement('div');
    time.className = 'resume-position-time';
    time.textContent = item?.time || '';
    meta.appendChild(time);

    const company = document.createElement('div');
    company.className = 'resume-company-name';
    company.textContent = item?.company || '';
    meta.appendChild(company);

    header.appendChild(meta);

    const title = document.createElement('h3');
    title.className = 'resume-position-title mb-1';
    title.textContent = item?.title || '';
    header.appendChild(title);

    const desc = document.createElement('div');
    desc.className = 'resume-timeline-item-desc';
    const list = document.createElement('ul');
    list.className = 'resume-timeline-list';

    const bullets = Array.isArray(item?.bullets) ? item.bullets : [];
    bullets.forEach((bullet) => {
      const li = document.createElement('li');
      li.textContent = bullet;
      list.appendChild(li);
    });

    desc.appendChild(list);

    article.appendChild(header);
    article.appendChild(desc);

    timeline.appendChild(article);
  });
}

function renderAdditionalExperience(data) {
  const heading = document.getElementById('additional-experience-heading');
  setHeadingText(heading, data?.heading || '');

  const list = document.getElementById('additional-experience-list');
  if (!list) {
    return;
  }

  list.innerHTML = '';
  const items = Array.isArray(data?.items) ? data.items : [];
  items.forEach((item) => {
    const li = document.createElement('li');
    if (item?.title) {
      const strong = document.createElement('strong');
      strong.textContent = item.title;
      li.appendChild(strong);
      if (item?.description) {
        li.appendChild(document.createTextNode(': '));
      }
    }
    if (item?.description) {
      li.appendChild(document.createTextNode(item.description));
    }
    list.appendChild(li);
  });
}

function renderTechStack(data) {
  const heading = document.getElementById('tech-stack-heading');
  setHeadingText(heading, data?.heading || '');

  const list = document.getElementById('tech-stack-list');
  if (!list) {
    return;
  }

  list.innerHTML = '';
  const groups = Array.isArray(data?.groups) ? data.groups : [];
  if (groups.length > 0) {
    groups.forEach((group) => {
      const li = document.createElement('li');
      li.className = 'mb-3';

      if (group?.title) {
        const title = document.createElement('div');
        title.className = 'resume-skill-name';
        title.textContent = group.title;
        li.appendChild(title);
      }

      const groupItems = Array.isArray(group?.items) ? group.items : [];
      if (groupItems.length > 0) {
        const badges = document.createElement('div');
        badges.className = 'd-flex flex-wrap gap-2 mt-2';

        groupItems.forEach((item) => {
          const badge = document.createElement('span');
          badge.className = 'badge resume-skill-badge';
          badge.textContent = item;
          badges.appendChild(badge);
        });

        li.appendChild(badges);
      }

      list.appendChild(li);
    });
    return;
  }

  const items = Array.isArray(data?.items) ? data.items : [];
  items.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'mb-2';

    const name = document.createElement('div');
    name.className = 'resume-skill-name';
    name.textContent = item?.name || '';
    li.appendChild(name);

    const progress = document.createElement('div');
    progress.className = 'progress resume-progress';
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-valuemin', '0');
    progress.setAttribute('aria-valuemax', '100');
    progress.setAttribute('aria-valuenow', String(item?.value ?? 0));
    if (data?.progressAriaLabel) {
      progress.setAttribute('aria-label', data.progressAriaLabel);
    }

    const bar = document.createElement('div');
    bar.className = 'progress-bar resume-progress-bar';
    const width = Math.max(0, Math.min(100, Number(item?.value ?? 0)));
    bar.style.width = `${width}%`;

    progress.appendChild(bar);
    li.appendChild(progress);

    list.appendChild(li);
  });
}

function renderSoftSkills(data) {
  const heading = document.getElementById('soft-skills-heading');
  setHeadingText(heading, data?.heading || '');

  const list = document.getElementById('soft-skills-list');
  if (!list) {
    return;
  }

  list.innerHTML = '';
  const items = Array.isArray(data?.items) ? data.items : [];
  items.forEach((skill) => {
    const li = document.createElement('li');
    li.className = 'list-inline-item';

    const badge = document.createElement('span');
    badge.className = 'badge resume-skill-badge';
    badge.textContent = skill;

    li.appendChild(badge);
    list.appendChild(li);
  });
}

function renderProjects(data) {
  const heading = document.getElementById('projects-heading');
  setHeadingText(heading, data?.heading || '');

  const container = document.getElementById('projects-list');
  if (!container) {
    return;
  }

  container.innerHTML = '';
  const items = Array.isArray(data?.items) ? data.items : [];
  items.forEach((item) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'item';

    const title = document.createElement('h4');
    title.className = 'item-heading';
    const icon = document.createElement('i');
    icon.className = 'item-icon bi bi-square-fill me-2';
    title.appendChild(icon);
    title.appendChild(document.createTextNode(item?.name || ''));

    const desc = document.createElement('div');
    desc.className = 'item-desc';
    desc.textContent = item?.description || '';

    wrapper.appendChild(title);
    wrapper.appendChild(desc);
    container.appendChild(wrapper);
  });
}

function renderEducation(data) {
  const heading = document.getElementById('education-heading');
  setHeadingText(heading, data?.heading || '');

  const list = document.getElementById('education-list');
  if (!list) {
    return;
  }

  list.innerHTML = '';
  const items = Array.isArray(data?.items) ? data.items : [];
  items.forEach((item, index) => {
    const li = document.createElement('li');
    if (index < items.length - 1) {
      li.classList.add('mb-2');
    }

    const degree = document.createElement('div');
    degree.className = 'resume-degree font-weight-bold';
    degree.textContent = item?.degree || '';
    li.appendChild(degree);

    const org = document.createElement('div');
    org.className = 'resume-degree-org';
    org.textContent = item?.organisation || '';
    li.appendChild(org);

    const time = document.createElement('div');
    time.className = 'resume-degree-time';
    time.textContent = item?.time || '';
    li.appendChild(time);

    const desc = document.createElement('div');
    desc.className = 'resume-degree-desc';
    desc.textContent = item?.description || '';
    li.appendChild(desc);

    list.appendChild(li);
  });
}

function renderLanguages(data) {
  const heading = document.getElementById('languages-heading');
  setHeadingText(heading, data?.heading || '');

  const list = document.getElementById('languages-list');
  if (!list) {
    return;
  }

  list.innerHTML = '';
  const maxLevel = Number.isFinite(data?.maxLevel) ? Number(data.maxLevel) : 10;
  const items = Array.isArray(data?.items) ? data.items : [];

  items.forEach((item, index) => {
    const li = document.createElement('li');
    if (index < items.length - 1) {
      li.classList.add('mb-2');
    }

    const name = document.createElement('div');
    name.className = 'resume-lang-name';
    name.textContent = item?.name || '';
    li.appendChild(name);

    const indicator = document.createElement('div');
    indicator.className = 'resume-level-indicator row gx-0 flex-nowrap';

    const levelValue = Number(item?.level ?? 0);
    const fullSegments = Math.floor(levelValue);
    const hasHalf = levelValue - fullSegments >= 0.5;

    for (let i = 0; i < maxLevel; i += 1) {
      const col = document.createElement('div');
      col.className = 'col';
      const span = document.createElement('span');
      span.className = 'item';
      if (i < fullSegments) {
        span.classList.add('item-full');
      } else if (i === fullSegments && hasHalf) {
        span.classList.add('item-half');
      }
      col.appendChild(span);
      indicator.appendChild(col);
    }

    li.appendChild(indicator);
    list.appendChild(li);
  });
}

function renderInterests(data) {
  const heading = document.getElementById('interests-heading');
  setHeadingText(heading, data?.heading || '');

  const list = document.getElementById('interests-list');
  if (!list) {
    return;
  }

  list.innerHTML = '';
  const items = Array.isArray(data?.items) ? data.items : [];
  items.forEach((interest) => {
    const li = document.createElement('li');
    li.className = 'list-inline-item';

    const badge = document.createElement('span');
    badge.className = 'badge resume-skill-badge';
    badge.textContent = interest;

    li.appendChild(badge);
    list.appendChild(li);
  });
}

function applyTranslations(data, language) {
  if (data?.meta) {
    document.documentElement.lang = data.meta.lang || language;
    if (typeof data.meta.title === 'string') {
      document.title = data.meta.title;
    }
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta && typeof data.meta.description === 'string') {
      descriptionMeta.setAttribute('content', data.meta.description);
    }
  }

  renderLanguageSelector(data?.languageSelector, language);
  renderTopBar(data?.topBar);
  renderHeader(data?.header);
  renderSummary(data?.summary);
  renderExperience(data?.experience);
  renderAdditionalExperience(data?.additionalExperience);
  renderTechStack(data?.techStack);
  renderSoftSkills(data?.softSkills);
  renderProjects(data?.projects);
  renderEducation(data?.education);
  renderLanguages(data?.languages);
  renderInterests(data?.interests);
}

async function loadLanguage(language) {
  let targetLanguage = LANGUAGE_FILES[language] ? language : 'en';
  try {
    const data = await getLanguageData(targetLanguage);
    applyTranslations(data, targetLanguage);
    currentLanguage = targetLanguage;
    return targetLanguage;
  } catch (error) {
    console.error(`Failed to load language "${language}":`, error);
    if (targetLanguage !== 'en') {
      try {
        const fallbackData = await getLanguageData('en');
        applyTranslations(fallbackData, 'en');
        currentLanguage = 'en';
        return 'en';
      } catch (fallbackError) {
        console.error('Failed to load fallback language "en":', fallbackError);
      }
    }
  }
  return currentLanguage;
}

document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('language-select');
  const storedLanguage = localStorage.getItem('preferredLanguage');
  const initialLanguage = storedLanguage && LANGUAGE_FILES[storedLanguage] ? storedLanguage : 'en';

  if (select) {
    select.addEventListener('change', (event) => {
      const chosenLanguage = event.target.value;
      loadLanguage(chosenLanguage).then((loadedLanguage) => {
        if (loadedLanguage && LANGUAGE_FILES[loadedLanguage]) {
          localStorage.setItem('preferredLanguage', loadedLanguage);
        }
      });
    });
  }

  loadLanguage(initialLanguage).then((loadedLanguage) => {
    if (loadedLanguage && LANGUAGE_FILES[loadedLanguage]) {
      localStorage.setItem('preferredLanguage', loadedLanguage);
    }
  });
});

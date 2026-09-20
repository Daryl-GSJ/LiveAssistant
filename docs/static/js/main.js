(function () {
  const cases = {
    singing: {
      image: './static/images/gif3.gif',
      alt: 'Singing livestream case with a key-event answer decision',
      index: 'CASE 01 · SINGING',
      title: 'Recognize the moment worth speaking up',
      description: 'LiveAssistant stays quiet across ordinary chunks, then identifies the instant the host begins an improvised rap for a guest and emits a grounded <code>ANS</code> event.',
      state: 'ANS',
      tokenClass: 'ans-token',
      action: 'Key event · assist viewers'
    },
    cooking: {
      image: './static/images/gif1.gif',
      alt: 'Cooking livestream case with an observe decision trajectory',
      index: 'CASE 02 · COOKING',
      title: 'Wait when the stream needs no interruption',
      description: 'The model follows native video, audio, comments, and gifts over time. With no reliable need to intervene, it deliberately preserves the live rhythm with <code>OBS</code>.',
      state: 'OBS',
      tokenClass: 'obs-token',
      action: 'Observe · preserve live rhythm'
    },
    education: {
      image: './static/images/gif2.gif',
      alt: 'Education livestream case with a continuous observation trajectory',
      index: 'CASE 03 · EDUCATION',
      title: 'Accumulate context before making a decision',
      description: 'Across a fast-moving educational explanation, LiveAssistant follows equations and audience signals without forcing a premature response, retaining context for the right future moment.',
      state: 'MEM',
      tokenClass: 'mem-token',
      action: 'Remember · retain causal context'
    }
  };

  const tabs = Array.from(document.querySelectorAll('.case-tab'));
  const caseImage = document.querySelector('#case-image');
  const caseIndex = document.querySelector('#case-index');
  const caseTitle = document.querySelector('#case-title');
  const caseDescription = document.querySelector('#case-description');
  const caseState = document.querySelector('#case-state');
  const caseAction = document.querySelector('#case-action');
  let currentCase = 0;
  let rotationTimer;

  function selectCase(name, restartRotation) {
    const selected = cases[name];
    if (!selected) return;
    currentCase = tabs.findIndex(tab => tab.dataset.case === name);
    tabs.forEach(tab => {
      const isActive = tab.dataset.case === name;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });
    caseImage.classList.add('switching');
    window.setTimeout(() => {
      caseImage.src = selected.image;
      caseImage.alt = selected.alt;
      caseIndex.textContent = selected.index;
      caseTitle.textContent = selected.title;
      caseDescription.innerHTML = selected.description;
      caseState.textContent = selected.state;
      caseState.className = 'decision-token ' + selected.tokenClass;
      caseAction.textContent = selected.action;
      caseImage.classList.remove('switching');
    }, 160);
    if (restartRotation) startRotation();
  }

  function startRotation() {
    window.clearInterval(rotationTimer);
    rotationTimer = window.setInterval(() => {
      currentCase = (currentCase + 1) % tabs.length;
      selectCase(tabs[currentCase].dataset.case, false);
    }, 9000);
  }

  tabs.forEach(tab => tab.addEventListener('click', () => selectCase(tab.dataset.case, true)));
  if (tabs.length) startRotation();

  const links = Array.from(document.querySelectorAll('.nav-links a'));
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  function updateActiveLink() {
    const scrollPosition = window.scrollY + 140;
    let currentSection = '';
    sections.forEach(section => {
      if (section.offsetTop <= scrollPosition) currentSection = section.id;
    });
    links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + currentSection));
  }
  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  const revealItems = document.querySelectorAll('.reveal, .state-card, .feature, .method-grid article, .role-grid article, .stat');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => observer.observe(item));

  const copyButton = document.querySelector('#copy-cite');
  const citation = document.querySelector('.cite-card code');
  if (copyButton && citation) {
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(citation.textContent.trim());
        copyButton.textContent = 'Copied ✓';
        window.setTimeout(() => { copyButton.textContent = 'Copy BibTeX'; }, 1600);
      } catch (error) {
        console.error('Unable to copy citation', error);
      }
    });
  }
})();

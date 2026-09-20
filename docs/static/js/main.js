(function () {
  const cases = {
    singing: {
      video: './static/images/case-singing.mp4',
      label: 'Singing livestream case with a key-event answer decision',
      index: 'CASE 01 · SINGING',
      title: 'Recognize the moment worth speaking up',
      description: 'LiveAssistant stays quiet across ordinary chunks, then identifies the instant the host begins an improvised rap for a guest and emits a grounded <code>ANS</code> event.',
      state: 'ANS',
      tokenClass: 'ans-token',
      action: 'Key event · assist viewers'
    },
    cooking: {
      video: './static/images/case-cooking.mp4',
      label: 'Cooking livestream case with an observe decision trajectory',
      index: 'CASE 02 · COOKING',
      title: 'Wait when the stream needs no interruption',
      description: 'The model follows native video, audio, comments, and gifts over time. With no reliable need to intervene, it deliberately preserves the live rhythm with <code>OBS</code>.',
      state: 'OBS',
      tokenClass: 'obs-token',
      action: 'Observe · preserve live rhythm'
    },
    education: {
      video: './static/images/case-education.mp4',
      label: 'Education livestream case with a continuous observation trajectory',
      index: 'CASE 03 · EDUCATION',
      title: 'Accumulate context before making a decision',
      description: 'Across a fast-moving educational explanation, LiveAssistant follows equations and audience signals without forcing a premature response, retaining context for the right future moment.',
      state: 'MEM',
      tokenClass: 'mem-token',
      action: 'Remember · retain causal context'
    }
  };

  const tabs = Array.from(document.querySelectorAll('.case-tab'));
  const caseVideo = document.querySelector('#case-video');
  const caseIndex = document.querySelector('#case-index');
  const caseTitle = document.querySelector('#case-title');
  const caseDescription = document.querySelector('#case-description');
  const caseState = document.querySelector('#case-state');
  const caseAction = document.querySelector('#case-action');
  const caseTurn = document.querySelector('#case-turn');
  const caseProgressTrack = document.querySelector('#case-progress-track');
  const casePlayToggle = document.querySelector('#case-play-toggle');
  const casePlaybackState = document.querySelector('#case-playback-state');
  const playIcon = casePlayToggle.querySelector('.play-icon');
  const turnDurations = [...Array(17).fill(2.8), 4.4];
  const turnStarts = turnDurations.map((_, index) => turnDurations.slice(0, index).reduce((sum, duration) => sum + duration, 0));
  let currentCase = 0;
  let animationFrame;
  let switchTimer;
  let loadVersion = 0;

  function setPlaybackLabel(isPlaying) {
    playIcon.textContent = isPlaying ? 'Ⅱ' : '▶';
    casePlaybackState.textContent = isPlaying ? 'PLAYING TURN' : 'PAUSED AT TURN';
    casePlayToggle.setAttribute('aria-label', isPlaying ? 'Pause case playback' : 'Resume case playback');
  }

  function resetTurnProgress() {
    caseProgressTrack.replaceChildren();
    turnDurations.forEach((_, index) => {
      const step = document.createElement('button');
      step.type = 'button';
      step.className = 'turn-step';
      step.setAttribute('aria-label', `Jump to turn ${String(index).padStart(2, '0')}`);
      step.title = `Turn ${String(index).padStart(2, '0')}`;
      step.dataset.turn = String(index);
      step.appendChild(document.createElement('i'));
      caseProgressTrack.appendChild(step);
    });
    caseTurn.textContent = `00 / ${String(turnDurations.length - 1).padStart(2, '0')}`;
  }

  function turnAtTime(time) {
    for (let index = turnStarts.length - 1; index >= 0; index -= 1) {
      if (time >= turnStarts[index]) return index;
    }
    return 0;
  }

  function renderTurnProgress() {
    const time = Number.isFinite(caseVideo.currentTime) ? caseVideo.currentTime : 0;
    const activeTurn = turnAtTime(time);
    const steps = Array.from(caseProgressTrack.children);

    steps.forEach((step, index) => {
      const fill = step.firstElementChild;
      const elapsed = time - turnStarts[index];
      const progress = Math.max(0, Math.min(1, elapsed / turnDurations[index]));
      fill.style.width = `${progress * 100}%`;
      step.classList.toggle('completed', progress >= 1);
      step.classList.toggle('active', index === activeTurn && progress < 1);
      step.setAttribute('aria-current', index === activeTurn ? 'step' : 'false');
    });
    caseTurn.textContent = `${String(activeTurn).padStart(2, '0')} / ${String(turnDurations.length - 1).padStart(2, '0')}`;
  }

  function followPlayback() {
    window.cancelAnimationFrame(animationFrame);
    renderTurnProgress();
    if (!caseVideo.paused && !caseVideo.ended) animationFrame = window.requestAnimationFrame(followPlayback);
  }

  async function playVideo() {
    try {
      await caseVideo.play();
      setPlaybackLabel(true);
      followPlayback();
    } catch (error) {
      setPlaybackLabel(false);
      console.warn('Autoplay was blocked; use the play control to begin the case.', error);
    }
  }

  function seekToTurn(turnIndex) {
    if (!Number.isFinite(caseVideo.duration)) return;
    caseVideo.currentTime = turnStarts[turnIndex];
    renderTurnProgress();
    playVideo();
  }

  function selectCase(name) {
    const selected = cases[name];
    if (!selected) return;
    window.clearTimeout(switchTimer);
    window.cancelAnimationFrame(animationFrame);
    caseVideo.pause();
    currentCase = tabs.findIndex(tab => tab.dataset.case === name);
    tabs.forEach(tab => {
      const isActive = tab.dataset.case === name;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    const currentLoad = ++loadVersion;
    caseVideo.classList.add('switching');
    resetTurnProgress();
    setPlaybackLabel(false);
    switchTimer = window.setTimeout(() => {
      caseVideo.src = selected.video;
      caseVideo.setAttribute('aria-label', selected.label);
      caseVideo.load();
      caseIndex.textContent = selected.index;
      caseTitle.textContent = selected.title;
      caseDescription.innerHTML = selected.description;
      caseState.textContent = selected.state;
      caseState.className = 'decision-token ' + selected.tokenClass;
      caseAction.textContent = selected.action;
      caseVideo.onloadedmetadata = () => {
        if (currentLoad !== loadVersion) return;
        caseVideo.currentTime = 0;
        caseVideo.classList.remove('switching');
        renderTurnProgress();
        playVideo();
      };
    }, 140);
  }

  caseProgressTrack.addEventListener('click', event => {
    const step = event.target.closest('.turn-step');
    if (step) seekToTurn(Number(step.dataset.turn));
  });
  casePlayToggle.addEventListener('click', () => {
    if (caseVideo.paused) playVideo();
    else caseVideo.pause();
  });
  caseVideo.addEventListener('play', () => {
    setPlaybackLabel(true);
    followPlayback();
  });
  caseVideo.addEventListener('pause', () => {
    setPlaybackLabel(false);
    renderTurnProgress();
  });
  caseVideo.addEventListener('seeked', renderTurnProgress);
  caseVideo.addEventListener('ended', () => {
    renderTurnProgress();
    currentCase = (currentCase + 1) % tabs.length;
    selectCase(tabs[currentCase].dataset.case);
  });
  tabs.forEach(tab => tab.addEventListener('click', () => selectCase(tab.dataset.case)));
  if (tabs.length) selectCase(tabs[0].dataset.case);

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

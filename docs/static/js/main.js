// LiveAssistant project page — light interactions
(function () {
  // Smooth active-link highlight on scroll
  const links = document.querySelectorAll('.nav-links a');
  const sections = [...links].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  function onScroll() {
    const y = window.scrollY + 120;
    let current = null;
    sections.forEach(sec => { if (sec.offsetTop <= y) current = sec.id; });
    links.forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + current ? 'var(--brand)' : '';
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Click-to-copy for BibTeX block
  const cite = document.querySelector('.codeblock.cite');
  if (cite) {
    cite.style.cursor = 'copy';
    cite.title = 'Click to copy';
    cite.addEventListener('click', () => {
      navigator.clipboard.writeText(cite.innerText.trim()).then(() => {
        const old = cite.style.outline;
        cite.style.outline = '2px solid var(--brand)';
        setTimeout(() => (cite.style.outline = old), 700);
      });
    });
  }
})();

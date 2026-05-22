// Letmotiv — interactions globales
(() => {
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.burger');
  burger?.addEventListener('click', () => nav?.classList.toggle('open'));

  // Lien actif dans le header
  const normalizePath = value => {
    try {
      const url = new URL(value, window.location.href);
      let path = url.pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '');
      return path || '/';
    } catch {
      return value;
    }
  };

  const current = normalizePath(window.location.href);
  document.querySelectorAll('.nav nav a[href]').forEach(link => {
    const target = normalizePath(link.href);
    const isActive = current === target ||
      (target.endsWith('/formations') && current.includes('/formations/')) ||
      (target.endsWith('/ressources') && current.includes('/ressources/')) ||
      (target.endsWith('/simulateur') && current.includes('/simulateur'));
    if (isActive) link.classList.add('active');
  });

  // Simulateur ROI accueil
  const fmt = n => new Intl.NumberFormat('fr-FR').format(Math.round(n));

  function calcRoi() {
    const people = +document.querySelector('#people')?.value || 0;
    const hours = +document.querySelector('#hours')?.value || 0;
    const week = people * hours;
    const year = week * 44;
    const rate = 33.5;
    const cost = year * rate;
    const save = cost / 2;
    const roi = ((save - 5000) / 5000) * 100;

    const values = {
      week: `${fmt(week)} h`,
      year: `${fmt(year)} h`,
      cost: `${fmt(cost)} € / an`,
      save: `${fmt(save)} € / an`,
      roi: `+${fmt(roi)} %`
    };

    Object.entries(values).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }

  function revealRoi() {
    calcRoi();
    const result = document.querySelector('.result');
    const roiBox = document.querySelector('.roi');
    if (!result || !roiBox) return;

    result.classList.remove('revealed');
    result.querySelectorAll('.message').forEach(m => m.classList.remove('show'));
    roiBox.classList.remove('roiOpen');
    void result.offsetWidth;

    roiBox.classList.add('roiOpen');
    setTimeout(() => {
      result.classList.add('revealed');
      [...result.querySelectorAll('.message')].forEach((m, index) => {
        setTimeout(() => m.classList.add('show'), index * 500);
      });
      if (matchMedia('(max-width:900px)').matches) {
        setTimeout(() => result.scrollIntoView({ behavior: 'smooth', block: 'start' }), 280);
      }
    }, 260);
  }

  document.querySelector('#calc')?.addEventListener('click', revealRoi);
  if (document.querySelector('#people')) calcRoi();

  // Témoignages : un seul ouvert à la fois pour éviter les lignes déformées sur desktop
  document.querySelectorAll('.testiMore').forEach(btn => {
    btn.addEventListener('click', event => {
      event.stopPropagation();
      const card = btn.closest('.testiCard');
      if (!card) return;
      const willOpen = !card.classList.contains('open');
      document.querySelectorAll('.testiCard.open').forEach(openCard => {
        if (openCard !== card) {
          openCard.classList.remove('open');
          openCard.querySelector('.testiMore')?.setAttribute('aria-expanded', 'false');
        }
      });
      card.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });

  // Logos clients : GitHub API si disponible, fallback local sinon.
  async function loadClientLogos() {
    const section = document.querySelector('.logos[data-auto-logos]');
    if (!section) return;
    const track = section.querySelector('.logosTrack');
    if (!track) return;

    const fallback = (section.dataset.fallbackLogos || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    let logos = [];

    const repo = section.dataset.githubRepo;
    const ref = section.dataset.githubRef || 'main';
    const apiPath = section.dataset.githubPath || 'images';

    if (repo) {
      try {
        const res = await fetch(`https://api.github.com/repos/${repo}/contents/${apiPath}?ref=${ref}`, {
          headers: { Accept: 'application/vnd.github+json' }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            logos = data.map(f => f.name).filter(name => /^Logo_.+\.webp$/i.test(name));
          }
        }
      } catch (e) {
        logos = [];
      }
    }

    if (!logos.length) logos = fallback;
    logos = [...new Set(logos)].sort((a, b) => a.localeCompare(b, 'fr'));
    if (!logos.length) return;

    track.innerHTML = '';
    [...logos, ...logos].forEach(name => {
      const img = document.createElement('img');
      img.src = `${section.dataset.logoBase || 'images'}/${name}`;
      img.alt = name.replace(/^Logo_/, '').replace(/\.webp$/i, '').replace(/_/g, ' ');
      img.loading = 'lazy';
      img.addEventListener('click', () => {
        img.classList.toggle('active');
        track.style.animationPlayState = img.classList.contains('active') ? 'paused' : 'running';
      });
      track.appendChild(img);
    });
  }

  loadClientLogos();
})();

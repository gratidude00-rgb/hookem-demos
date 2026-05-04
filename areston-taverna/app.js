// HookEm food template — app.js
// Handles: language toggle, scroll nav, reveals, menu tabs, open/closed status, mobile menu.

(function () {
  const STORAGE_KEY = 'hookem_lang';
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';

  // ===== Language toggle =====
  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    const dict = (window.HOOKEM_I18N || {})[lang] || {};
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] != null) {
        if (key === 'about_text') el.innerHTML = dict[key];
        else el.textContent = dict[key];
      }
    });
    const toggle = document.getElementById('langToggle');
    if (toggle) {
      const active = toggle.querySelector('.lang-active');
      const inactive = toggle.querySelector('.lang-inactive');
      if (lang === 'en') { active.textContent = 'EN'; inactive.textContent = 'EL'; }
      else { active.textContent = 'EL'; inactive.textContent = 'EN'; }
    }
    refreshStatus();
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyLang(currentLang);
    document.getElementById('langToggle')?.addEventListener('click', () => {
      applyLang(currentLang === 'en' ? 'el' : 'en');
    });

    // ===== Year =====
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    // ===== Scroll nav =====
    const nav = document.getElementById('nav');
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // ===== Mobile burger =====
    document.getElementById('navBurger')?.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
    document.querySelectorAll('.nav-links a').forEach((a) => {
      a.addEventListener('click', () => nav.classList.remove('open'));
    });

    // ===== Reveal-on-scroll =====
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

    // ===== Menu tabs =====
    document.querySelectorAll('.tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b === btn));
        document.querySelectorAll('.menu-panel').forEach((p) => {
          p.classList.toggle('active', p.dataset.panel === target);
        });
      });
    });

    // ===== Open/closed status =====
    refreshStatus();
    setInterval(refreshStatus, 60000);
  });

  // Hours data is injected by build script as window.HOOKEM_HOURS.
  // Format: { mon: [{open: "12:00", close: "23:00"}], tue: [...], ... } — empty array = closed.
  function refreshStatus() {
    const hours = window.HOOKEM_HOURS;
    if (!hours) return;
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    const list = document.querySelectorAll('.hours-list li');
    if (!dot || !text) return;
    const now = new Date();
    const dayKeys = ['sun','mon','tue','wed','thu','fri','sat'];
    const todayKey = dayKeys[now.getDay()];
    list.forEach((li, i) => {
      const dayLabel = li.querySelector('span:first-child');
      const dayKey = dayLabel?.getAttribute('data-i18n')?.replace('day_','');
      li.classList.toggle('today', dayKey === todayKey);
    });
    const todays = hours[todayKey] || [];
    const minutes = now.getHours() * 60 + now.getMinutes();
    const dict = (window.HOOKEM_I18N || {})[currentLang] || {};
    let openNow = false;
    for (const slot of todays) {
      const [oh, om] = slot.open.split(':').map(Number);
      const [ch, cm] = slot.close.split(':').map(Number);
      const start = oh * 60 + om;
      let end = ch * 60 + cm;
      if (end <= start) end += 24 * 60;
      const m = end > 24 * 60 && minutes < start ? minutes + 24 * 60 : minutes;
      if (m >= start && m < end) { openNow = true; break; }
    }
    if (openNow) {
      dot.className = 'status-dot open';
      text.textContent = dict.status_open || 'Open now';
    } else {
      dot.className = 'status-dot closed';
      text.textContent = dict.status_closed || 'Closed now';
    }
  }
})();

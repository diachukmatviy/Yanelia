/* =========================================================
   Yaneliua — site behaviour (vanilla JS, no dependencies)
   ========================================================= */
(function () {
  'use strict';

  /* ------------------------------------------------------
     CONFIG — edit these before going live
     ------------------------------------------------------ */
  var CONFIG = {

    
    formEndpoint: 'https://formsubmit.co/hello@yanelia.tech',

    
    mailTo: 'hello@yanelia.tech'
  };

  
  var MSG = {
    en: {
      sending:    'Sending…',
      ok:         'Thank you! Your message has been sent — I will reply soon.',
      err:        'Something went wrong. Please try again or message me on Instagram.',
      validation: 'Please fill in your name, a valid email and a short message.',
      mailto:     'Opening your email app…'
    },
    ua: {
      sending:    'Надсилання…',
      ok:         'Дякуємо! Ваше повідомлення надіслано — я відповім незабаром.',
      err:        'Щось пішло не так. Спробуйте ще раз або напишіть мені в Instagram.',
      validation: 'Будь ласка, вкажіть ваше ім\'я, дійсний email та коротке повідомлення.',
      mailto:     'Відкриваємо ваш поштовий додаток…'
    },
    pl: {
      sending:    'Wysyłanie…',
      ok:         'Dziękujemy! Wiadomość została wysłana — odpiszę wkrótce.',
      err:        'Coś poszło nie tak. Spróbuj ponownie lub napisz do mnie na Instagramie.',
      validation: 'Proszę podać imię, prawidłowy adres e-mail i krótką wiadomość.',
      mailto:     'Otwieranie aplikacji pocztowej…'
    }
  };

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  
  function currentLang() { return store.get('yanelia-lang') || 'ua'; }

  function applyLang(l) {
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l === 'ua' ? 'uk' : l);
    store.set('yanelia-lang', l);


    $$('[data-lang-btn]').forEach(function (btn) {
      var active = btn.getAttribute('data-lang-btn') === l;
      btn.setAttribute('aria-current', String(active));
    });


    $$('input[data-ph-' + l + '], textarea[data-ph-' + l + ']').forEach(function (el) {
      el.placeholder = el.getAttribute('data-ph-' + l) || '';
    });
  }

  $$('[data-lang-btn]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-lang-btn'));
    });
  });



  applyLang(currentLang());

  
  var themeBtn = $('#themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {

    });
  }

  
  var header = $('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 12); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var nav = $('#nav');
  var menuBtn = $('#menuBtn');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = ((i % 3) * 90) + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  
  var track = $('#reviewTrack');
  function slide(dir) {
    var card = $('.review', track);
    var step = card ? card.getBoundingClientRect().width + 22 : 320;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  }
  $('#revPrev').addEventListener('click', function () { slide(-1); });
  $('#revNext').addEventListener('click', function () { slide(1); });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); slide(1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); slide(-1); }
  });

  
  var galTrack = $('#galleryTrack');
  function slideGal(dir) {
    var card = $('.g-item', galTrack);
    var step = card ? card.getBoundingClientRect().width + 22 : 320;
    galTrack.scrollBy({ left: dir * step, behavior: 'smooth' });
  }
  $('#galPrev').addEventListener('click', function () { slideGal(-1); });
  $('#galNext').addEventListener('click', function () { slideGal(1); });
  galTrack.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); slideGal(1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); slideGal(-1); }
  });

  
  var items   = $$('.g-item');
  var box     = $('#lightbox');
  var stage   = $('#lbStage');
  var current = 0;

  function show(i) {
    current = (i + items.length) % items.length;
    var el = items[current];
    stage.innerHTML = '';
    if (el.classList.contains('g-video')) {
      var src = el.getAttribute('data-src');
      if (src) {
        var v = document.createElement('video');
        v.src = src; v.controls = true; v.autoplay = true; v.playsInline = true;
        var poster = el.getAttribute('data-poster'); if (poster) v.poster = poster;
        stage.appendChild(v);
      } else {
        var note = document.createElement('p');
        note.className = 'lb-note';
        var msgs = { en: 'Performance video coming soon.', ua: 'Відео виступу — незабаром.', pl: 'Film z występu — wkrótce.' };
        note.textContent = msgs[currentLang()] || msgs.en;
        stage.appendChild(note);
      }
    } else {
      var img = document.createElement('img');
      img.src = el.getAttribute('data-full');
      img.alt = el.getAttribute('data-alt') || '';
      stage.appendChild(img);
    }
  }
  function stopMedia() { var v = $('video', stage); if (v) v.pause(); }
  function openBox(i) {
    show(i);
    if (typeof box.showModal === 'function') box.showModal(); else box.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  }
  function closeBox() {
    stopMedia();
    if (typeof box.close === 'function') box.close(); else box.removeAttribute('open');
    document.body.style.overflow = '';
  }

  items.forEach(function (el, i) { el.addEventListener('click', function () { openBox(i); }); });
  $('#lbClose').addEventListener('click', closeBox);
  $('#lbPrev').addEventListener('click', function () { stopMedia(); show(current - 1); });
  $('#lbNext').addEventListener('click', function () { stopMedia(); show(current + 1); });
  box.addEventListener('click', function (e) { if (e.target === box || e.target === stage) closeBox(); });
  box.addEventListener('close', function () { stopMedia(); document.body.style.overflow = ''; });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { stopMedia(); show(current - 1); }
    if (e.key === 'ArrowRight') { stopMedia(); show(current + 1); }
  });

  
  var interest = $('#interest');
  $$('[data-interest]').forEach(function (a) {
    a.addEventListener('click', function () {
      var v = a.getAttribute('data-interest');

      var map = { violin: 'Violin lessons', piano: 'Piano lessons', wedding: 'Wedding performance', proposal: 'Marriage proposal' };
      if (map[v]) interest.value = map[v];
    });
  });

  
  var form     = $('#contactForm');
  var statusEl = $('#formStatus');

  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = 'form-status' + (type ? ' ' + type : '');
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(form);
    if (d.get('website')) return;

    var name    = (d.get('name')    || '').trim();
    var email   = (d.get('email')   || '').trim();
    var message = (d.get('message') || '').trim();
    var lang    = currentLang();
    var m       = MSG[lang] || MSG.en;

    $$('.field', form).forEach(function (f) { f.classList.remove('has-error'); });
    var bad = [];
    if (!name)           bad.push('name');
    if (!validEmail(email)) bad.push('email');
    if (!message)        bad.push('message');
    if (bad.length) {
      bad.forEach(function (id) { var el = $('#' + id); if (el) el.closest('.field').classList.add('has-error'); });
      var first = $('#' + bad[0]); if (first) first.focus();
      setStatus(m.validation, 'err');
      return;
    }

    var payload = { name: name, email: email, interest: d.get('interest'), message: message };
    var btn = $('button[type="submit"]', form);

    if (CONFIG.formEndpoint) {
      btn.disabled = true;
      setStatus(m.sending);
      fetch(CONFIG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) {
        if (!r.ok) throw new Error('bad status');
        form.reset();
        setStatus(m.ok, 'ok');
      }).catch(function () {
        setStatus(m.err, 'err');
      }).then(function () { btn.disabled = false; });
    } else {
      var subject = 'Enquiry: ' + payload.interest;
      var body = 'Name: ' + name + '\nEmail: ' + email + '\nInterested in: ' + payload.interest + '\n\n' + message;
      window.location.href = 'mailto:' + CONFIG.mailTo + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      setStatus(m.mailto, 'ok');
    }
  });

  
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();

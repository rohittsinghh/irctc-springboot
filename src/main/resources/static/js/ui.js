/**
 * ui.js  —  Shared UI helpers
 * Exposes window.UI
 */
(function (global) {
  'use strict';

  /* ── Toast ── */
  function toast(msg, type, duration) {
    type     = type     || 'info';
    duration = duration || 3400;
    var container = document.getElementById('toasts');
    if (!container) return;

    var t = document.createElement('div');
    t.className = 'toast toast-' + type;
    var icons = { ok: '✓', err: '✕', info: 'ℹ' };
    t.innerHTML =
      '<span class="toast-icon">' + (icons[type] || 'ℹ') + '</span>' +
      '<span>' + msg + '</span>';
    container.appendChild(t);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { t.classList.add('in'); });
    });

    setTimeout(function () {
      t.classList.remove('in');
      t.addEventListener('transitionend', function () { t.remove(); }, { once: true });
    }, duration);
  }

  /* ── Toast with action (Undo) ── */
  function toastAction(msg, type, duration, actionText, onAction) {
    type     = type     || 'info';
    duration = duration || 3400;
    var container = document.getElementById('toasts');
    if (!container) return;

    var t = document.createElement('div');
    t.className = 'toast toast-' + type;
    var icons = { ok: '✓', err: '✕', info: 'ℹ' };
    t.innerHTML =
      '<span class="toast-icon">' + (icons[type] || 'ℹ') + '</span>' +
      '<span class="toast-msg">' + msg + '</span>' +
      '<button class="toast-act">' + (actionText || 'Undo') + '</button>';
    container.appendChild(t);

    var actBtn = t.querySelector('.toast-act');
    actBtn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      try { onAction(); } catch (e) {}
      t.classList.remove('in');
      t.addEventListener('transitionend', function () { t.remove(); }, { once: true });
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { t.classList.add('in'); });
    });

    setTimeout(function () {
      t.classList.remove('in');
      t.addEventListener('transitionend', function () { t.remove(); }, { once: true });
    }, duration);
  }

  /* ── Field errors ── */
  function setErr(input, msg) {
    clearErr(input);
    input.classList.add('err');
    var p = document.createElement('p');
    p.className = 'ferr';
    p.textContent = msg;
    input.closest('.fgroup').appendChild(p);
  }
  function clearErr(input) {
    input.classList.remove('err');
    var p = input.closest('.fgroup').querySelector('.ferr');
    if (p) p.remove();
  }
  function clearAllErr(form) {
    form.querySelectorAll('.input.err').forEach(function (i) { clearErr(i); });
  }

  /* ── Button loading ── */
  function btnLoad(btn, text) {
    btn.dataset.orig = btn.textContent;
    btn.textContent  = text || 'Loading…';
    btn.disabled     = true;
    btn.classList.add('btn-loading');
  }
  function btnReset(btn) {
    btn.textContent = btn.dataset.orig || 'Submit';
    btn.disabled    = false;
    btn.classList.remove('btn-loading');
  }

  /* ── Page loader bar ── */
  function loaderOn()  { var l = document.getElementById('page-loader'); if (l) l.classList.add('loader-on'); }
  function loaderOff() { var l = document.getElementById('page-loader'); if (l) l.classList.remove('loader-on'); }

  /* ── Empty state ── */
  function emptyState(container, icon, title, sub) {
    container.innerHTML =
      '<div class="empty">' +
        '<div class="empty-icon">' + icon + '</div>' +
        '<h3>' + title + '</h3>' +
        (sub ? '<p>' + sub + '</p>' : '') +
      '</div>';
  }

  /* ── Nav ── */
  function renderNav() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    var session = Auth.get();

    if (!session) {
      nav.innerHTML =
        '<a href="/index.html" class="nav-logo"><span>🚂</span> IRCTC</a>' +
        '<div class="nav-links">' +
          '<a href="/index.html" class="nav-link">Login</a>' +
          '<a href="/signup.html" class="nav-link cta">Sign Up</a>' +
        '</div>';
      return;
    }

    nav.innerHTML =
      '<a href="/dashboard.html" class="nav-logo"><span>🚂</span> IRCTC</a>' +
      '<div class="nav-links">' +
        '<a href="/dashboard.html" class="nav-link" id="nl-dash">Search Trains</a>' +
        '<a href="/bookings.html" class="nav-link" id="nl-book">My Bookings</a>' +
        '<div class="nav-user">' +
          '<span class="nav-user-name">👤 ' + escHtml(session.name) + '</span>' +
          '<button id="btn-logout" class="btn btn-ghost btn-sm">Logout</button>' +
        '</div>' +
      '</div>';

    document.getElementById('btn-logout').addEventListener('click', function () {
      Auth.clear();
      window.location.href = '/index.html';
    });

    /* highlight active link */
    var page = window.location.pathname.replace(/^\//, '') || 'index.html';
    if (page.indexOf('dashboard') !== -1 && document.getElementById('nl-dash'))
      document.getElementById('nl-dash').classList.add('active');
    if (page.indexOf('bookings') !== -1 && document.getElementById('nl-book'))
      document.getElementById('nl-book').classList.add('active');
  }

  /* ── Helpers ── */
  function cap(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
  }
  function fmtDate(d) {
    if (!d) return '—';
    var dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function escHtml(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  global.UI = {
    toast: toast,
    toastAction: toastAction,
    initStationAutocomplete: function (inputEl, opts) {
      opts = opts || {};
      // avoid double-init
      if (inputEl.getAttribute('data-stations-inited')) return;

      // prefer existing datalist if present
      var existingListId = inputEl.getAttribute('list');
      var dl = existingListId ? document.getElementById(existingListId) : null;

      var listId = existingListId || 'dl-' + (inputEl.name || inputEl.id || Date.now());
      if (!dl) {
        dl = document.getElementById(listId);
        if (!dl) {
          dl = document.createElement('datalist');
          dl.id = listId;
          document.body.appendChild(dl);
        }
      }

      inputEl.setAttribute('list', listId);
      inputEl.setAttribute('data-stations-inited', '1');

      var timer;
      inputEl.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(async function () {
          var q = inputEl.value.trim();
          if (!q) { dl.innerHTML = ''; return; }
          try {
            var items = await (window.Stations ? window.Stations.query(q, opts.limit || 8) : []);
            dl.innerHTML = items.map(function (s) {
              var label = (s.name || '') + (s.code ? (' (' + s.code + ')') : '') + (s.city ? (' — ' + s.city) : '');
              return '<option value="' + escHtml(label) + '">';
            }).join('');
          } catch (e) { dl.innerHTML = ''; }
        }, opts.delay || 180);
      });
    },
    setErr: setErr, clearErr: clearErr, clearAllErr: clearAllErr,
    btnLoad: btnLoad, btnReset: btnReset,
    loaderOn: loaderOn, loaderOff: loaderOff,
    emptyState: emptyState,
    renderNav: renderNav,
    cap: cap, fmtDate: fmtDate, escHtml: escHtml
  };

})(window);

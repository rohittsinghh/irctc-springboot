/**
 * dashboard.js  —  Train search & booking controller
 */
(function () {
  'use strict';

  if (!Auth.requireAuth()) return;
  UI.renderNav();

  var session     = Auth.get();
  var grid        = document.getElementById('trains-grid');
  var resCount    = document.getElementById('res-count');
  var searchForm  = document.getElementById('search-form');
  var srcInput    = document.getElementById('source');
  var destInput   = document.getElementById('destination');
  var btnClear    = document.getElementById('btn-clear');

  // initialize station autocomplete if available
  if (window.UI && typeof UI.initStationAutocomplete === 'function') {
    try {
      UI.initStationAutocomplete(srcInput, { limit: 8 });
      UI.initStationAutocomplete(destInput, { limit: 8 });
    } catch (e) { /* ignore */ }
  }

  // load local trains dataset (e.g. Jammu entries)
  var localTrains = [];
  (async function loadLocalTrains() {
    try {
      var r = await fetch('/data/trains.json', { cache: 'no-store' });
      if (r.ok) localTrains = await r.json();
    } catch (e) { localTrains = []; }
  })();

  /* ── Load all trains on start ── */
  async function loadAll() {
    UI.loaderOn();
    resCount.textContent = 'Loading trains…';
    try {
      var data = await API.getAllTrains();
      var apiTrains = data.trains || [];
      // append local trains not already present
      var seen = new Set(apiTrains.map(function (t) { return t.trainId; }));
      (localTrains || []).forEach(function (lt) {
        if (!seen.has(lt.trainId)) apiTrains.push(Object.assign({ availableSeats: (lt.availableSeats != null ? lt.availableSeats : 10), totalSeats: (lt.totalSeats != null ? lt.totalSeats : 100) }, lt));
      });
      renderTrains(apiTrains, '');
    } catch (err) {
      UI.toast(err.message, 'err');
      UI.emptyState(grid, '🚫', 'Could not load trains', err.message);
    } finally {
      UI.loaderOff();
    }
  }

  /* ── Search ── */
  searchForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    var src  = srcInput.value.trim().toLowerCase();
    var dest = destInput.value.trim().toLowerCase();
    if (!src || !dest) { UI.toast('Enter both source and destination', 'err'); return; }

    var btn = searchForm.querySelector('[type=submit]');
    UI.btnLoad(btn, 'Searching…');
    UI.loaderOn();

    try {
      // try to map inputs to station codes using Stations (optional)
      var srcCodes = [], destCodes = [];
      try {
        if (window.Stations) {
          var sres = await Stations.query(src, 4);
          var dres = await Stations.query(dest, 4);
          srcCodes = sres.map(function (s) { return (s.code || '').toLowerCase(); });
          destCodes = dres.map(function (s) { return (s.code || '').toLowerCase(); });
        }
      } catch (e) { srcCodes = []; destCodes = []; }

      var data = await API.searchTrains(src, dest);
      var apiTrains = data.trains || [];

      // find matching local trains (loose match: code or name/city contains query)
      var localMatches = (localTrains || []).filter(function (t) {
        var tsrc = (t.source || '').toLowerCase();
        var tdest = (t.destination || '').toLowerCase();
        var name = (t.trainName || '').toLowerCase();

        var srcMatch = srcCodes.length ? srcCodes.indexOf(tsrc) !== -1 : (tsrc.indexOf(src) !== -1 || name.indexOf(src) !== -1);
        var destMatch = destCodes.length ? destCodes.indexOf(tdest) !== -1 : (tdest.indexOf(dest) !== -1 || name.indexOf(dest) !== -1);
        return srcMatch && destMatch;
      });

      // enrich local matches with defaults for seat counts if missing
      localMatches = localMatches.map(function (t) {
        return Object.assign({ availableSeats: (t.availableSeats != null ? t.availableSeats : 10), totalSeats: (t.totalSeats != null ? t.totalSeats : 100) }, t);
      });

      // merge (API results first, then local matches not already present)
      var seen = new Set(apiTrains.map(function (t) { return t.trainId; }));
      localMatches.forEach(function (lt) { if (!seen.has(lt.trainId)) apiTrains.push(lt); });

      renderTrains(apiTrains, UI.cap(src) + ' → ' + UI.cap(dest));
      btnClear.style.display = 'inline-flex';
    } catch (err) {
      UI.toast(err.message, 'err');
    } finally {
      UI.loaderOff();
      UI.btnReset(btn);
    }
  });

  btnClear.addEventListener('click', function () {
    srcInput.value  = '';
    destInput.value = '';
    btnClear.style.display = 'none';
    loadAll();
  });

  /* ── Render cards ── */
  function avail(seats, total) {
    if (seats === 0)                           return { cls: 'b-err',  sc: 'seats-err',  lbl: 'Sold Out' };
    if ((seats / total) * 100 > 50)           return { cls: 'b-ok',   sc: 'seats-ok',   lbl: 'Available' };
    if ((seats / total) * 100 > 20)           return { cls: 'b-warn', sc: 'seats-warn', lbl: 'Filling Fast' };
    return                                           { cls: 'b-err',  sc: 'seats-err',  lbl: 'Almost Full' };
  }

  function renderTrains(trains, label) {
    resCount.textContent = label
      ? label + ' — ' + trains.length + ' train' + (trains.length !== 1 ? 's' : '') + ' found'
      : trains.length + ' train' + (trains.length !== 1 ? 's' : '') + ' available';

    if (!trains.length) {
      UI.emptyState(grid, '🔍', 'No trains found', 'Try different cities');
      return;
    }

    grid.innerHTML = '';

    trains.forEach(function (t) {
      var a   = avail(t.availableSeats, t.totalSeats);
      var art = document.createElement('article');
      art.className = 'train-card';
      art.innerHTML =
        '<div class="tc-header">' +
          '<div>' +
            '<p class="tc-id">' + UI.escHtml(t.trainId) + '</p>' +
            '<h2 class="tc-name">' + UI.escHtml(t.trainName) + '</h2>' +
          '</div>' +
          '<span class="badge ' + a.cls + '">' + a.lbl + '</span>' +
        '</div>' +
        '<div class="tc-route">' +
          '<div class="rt-stop"><span class="rt-dot rt-dot-from"></span>' +
            '<span class="rt-city">' + UI.cap(t.source) + '</span></div>' +
          '<div class="rt-arrow">→</div>' +
          '<div class="rt-stop"><span class="rt-dot rt-dot-to"></span>' +
            '<span class="rt-city">' + UI.cap(t.destination) + '</span></div>' +
        '</div>' +
        '<div class="tc-foot">' +
          '<div>' +
            '<p class="seats-lbl">Available Seats</p>' +
            '<p class="seats-val ' + a.sc + '">' + t.availableSeats + ' / ' + t.totalSeats + '</p>' +
          '</div>' +
          '<button class="btn btn-primary btn-book"' +
            ' data-id="' + UI.escHtml(t.trainId) + '"' +
            ' data-name="' + UI.escHtml(t.trainName) + '"' +
            (t.availableSeats === 0 ? ' disabled' : '') + '>' +
            (t.availableSeats === 0 ? 'Sold Out' : 'Book Now') +
          '</button>' +
        '</div>';
      grid.appendChild(art);
    });

    grid.querySelectorAll('.btn-book').forEach(function (btn) {
      btn.addEventListener('click', handleBook);
    });
  }

  /* ── Book ── */
  async function handleBook(e) {
    var btn   = e.currentTarget;
    var tid   = btn.dataset.id;
    var tname = btn.dataset.name;

    UI.btnLoad(btn, 'Booking…');

    try {
      var ticket = await API.bookTicket(session.userId, tid);

      if (ticket.error) {
        var msgs = {
          no_seats_available: 'No seats left on this train.',
          invalid_user:       'Your session expired. Please login again.',
          invalid_train:      'Train no longer available.'
        };
        UI.toast(msgs[ticket.error] || ticket.error, 'err');
        UI.btnReset(btn);
        return;
      }

      UI.toast('🎉 Booked on ' + tname + '! View in My Bookings.', 'ok', 4000);

      /* update seat count in card without full reload */
      var card    = btn.closest('.train-card');
      var valEl   = card.querySelector('.seats-val');
      var parts   = valEl.textContent.split('/');
      var newSeats = Math.max(0, parseInt(parts[0]) - 1);
      var total    = parseInt(parts[1]);
      var na = avail(newSeats, total);

      valEl.textContent = newSeats + ' / ' + total;
      valEl.className   = 'seats-val ' + na.sc;
      card.querySelector('.badge').className   = 'badge ' + na.cls;
      card.querySelector('.badge').textContent = na.lbl;

      if (newSeats === 0) {
        btn.textContent = 'Sold Out';
        btn.disabled = true;
        btn.classList.remove('btn-loading');
      } else {
        UI.btnReset(btn);
      }

    } catch (err) {
      UI.toast(err.message, 'err');
      UI.btnReset(btn);
    }
  }

  /* ── City autocomplete ── */
  var CITIES = ['delhi','mumbai','jaipur','chennai','kolkata','bangalore',
                'hyderabad','pune','ahmedabad','lucknow','patna','bhopal',
                'surat','nagpur','vadodara','agra','varanasi','indore'];

  function attachAC(input) {
    var list = null;
    function remove() { if (list) { list.remove(); list = null; } }

    input.addEventListener('input', function () {
      remove();
      var v = input.value.trim().toLowerCase();
      if (!v) return;
      var matches = CITIES.filter(function (c) { return c.startsWith(v); });
      if (!matches.length) return;

      list = document.createElement('ul');
      list.className = 'ac-list';
      matches.forEach(function (city) {
        var li = document.createElement('li');
        li.className = 'ac-item';
        li.textContent = UI.cap(city);
        li.addEventListener('mousedown', function () {
          input.value = UI.cap(city);
          remove();
        });
        list.appendChild(li);
      });
      input.parentElement.style.position = 'relative';
      input.insertAdjacentElement('afterend', list);
    });

    input.addEventListener('blur', function () { setTimeout(remove, 180); });
  }

  attachAC(srcInput);
  attachAC(destInput);

  loadAll();
})();

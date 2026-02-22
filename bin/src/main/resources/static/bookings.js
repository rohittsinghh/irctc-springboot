/**
 * bookings.js  —  My Bookings page controller
 */
(function () {
  'use strict';

  if (!Auth.requireAuth()) return;
  UI.renderNav();

  var session   = Auth.get();
  var list      = document.getElementById('tickets-list');
  var countEl   = document.getElementById('ticket-count');
  var refreshBtn = document.getElementById('btn-refresh');

  /* ── Load ── */
  async function load() {
    UI.loaderOn();
    list.innerHTML =
      '<div class="skel-grid">' +
      '<div class="skel-card"></div>'.repeat(3) +
      '</div>';

    try {
      var data    = await API.getUserBookings(session.userId);
      var tickets = data.tickets || [];
      countEl.textContent = tickets.length + ' Ticket' + (tickets.length !== 1 ? 's' : '');
      render(tickets);
    } catch (err) {
      UI.toast(err.message, 'err');
      UI.emptyState(list, '🚫', 'Failed to load bookings', err.message);
    } finally {
      UI.loaderOff();
    }
  }

  /* ── Render ── */
  function render(tickets) {
    if (!tickets.length) {
      UI.emptyState(list, '🎫', 'No bookings yet',
        'Head to Search Trains and book your first journey');
      return;
    }

    list.innerHTML = '';

    tickets.forEach(function (tk) {
      var card = document.createElement('article');
      card.className = 'ticket-card';
      card.id = 'tk-' + tk.ticketId;
      var shortId = tk.ticketId.substring(0, 8).toUpperCase();

      card.innerHTML =
        '<div class="tk-stripe"></div>' +
        '<div class="tk-body">' +
          '<div class="tk-top">' +
            '<div>' +
              '<span class="tk-id">🎫 ' + shortId + '</span>' +
              '<span class="tk-date">' + UI.fmtDate(tk.journeyDate) + '</span>' +
            '</div>' +
            '<span class="badge b-ok">Confirmed</span>' +
          '</div>' +
          '<div class="tk-route">' +
            '<div class="trt-side">' +
              '<span class="trt-lbl">From</span>' +
              '<span class="trt-city">' + UI.cap(tk.source) + '</span>' +
            '</div>' +
            '<div class="trt-mid">' +
              '<div class="trt-line"></div>' +
              '<div class="trt-icon">🚂</div>' +
              '<div class="trt-line"></div>' +
            '</div>' +
            '<div class="trt-side right">' +
              '<span class="trt-lbl">To</span>' +
              '<span class="trt-city">' + UI.cap(tk.destination) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="tk-info">' +
            '<div class="tki-row"><span>Train</span><span>' + UI.escHtml((tk.train && tk.train.trainName) || '—') + '</span></div>' +
            '<div class="tki-row"><span>Train No.</span><span>' + UI.escHtml((tk.train && tk.train.trainId) || '—') + '</span></div>' +
            '<div class="tki-row"><span>Passenger</span><span>' + UI.cap(session.name) + '</span></div>' +
          '</div>' +
          '<div class="tk-foot">' +
            '<button class="btn btn-danger btn-sm btn-cancel"' +
              ' data-id="' + UI.escHtml(tk.ticketId) + '"' +
              ' data-short="' + shortId + '">Cancel Ticket</button>' +
          '</div>' +
        '</div>';

      list.appendChild(card);
    });

    list.querySelectorAll('.btn-cancel').forEach(function (btn) {
      btn.addEventListener('click', handleCancel);
    });
  }

  /* ── Cancel ── */
  async function handleCancel(e) {
    var btn      = e.currentTarget;
    var ticketId = btn.dataset.id;
    var shortId  = btn.dataset.short;

    if (!confirm('Cancel ticket #' + shortId + '? This cannot be undone.')) return;

    UI.btnLoad(btn, 'Cancelling…');

    try {
      var result = await API.cancelTicket(ticketId);

      if (result.error) {
        UI.toast(result.error === 'ticket_not_found'
          ? 'Ticket not found — may already be cancelled.'
          : result.error, 'err');
        UI.btnReset(btn);
        return;
      }

      UI.toast('Ticket #' + shortId + ' cancelled.', 'ok');

      var card = document.getElementById('tk-' + ticketId);
      if (card) {
        card.classList.add('removing');
        card.addEventListener('transitionend', function () {
          card.remove();
          var remaining = list.querySelectorAll('.ticket-card').length;
          countEl.textContent = remaining + ' Ticket' + (remaining !== 1 ? 's' : '');
          if (!remaining) {
            UI.emptyState(list, '🎫', 'No bookings yet',
              'Head to Search Trains and book your first journey');
          }
        }, { once: true });
      }

    } catch (err) {
      UI.toast(err.message, 'err');
      UI.btnReset(btn);
    }
  }

  /* ── Refresh ── */
  refreshBtn.addEventListener('click', function () {
    var icon = refreshBtn.querySelector('.ri') || refreshBtn;
    icon.classList.add('spin');
    setTimeout(function () { icon.classList.remove('spin'); }, 600);
    load();
  });

  load();
})();

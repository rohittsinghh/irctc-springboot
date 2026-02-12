/**
 * bookings.js  —  My Bookings page controller
 */
(function () {
  'use strict';

  // Keep auth/navigation behavior, but simplify page content
  if (!Auth.requireAuth()) return;
  UI.renderNav();

  var titleEl = document.querySelector('.ph-title');
  var subEl = document.querySelector('.ph-sub');
  var list = document.getElementById('tickets-list');
  var countEl = document.getElementById('ticket-count');

  function showHero() {
    if (titleEl) titleEl.textContent = 'Explore the world, one ticket at a time.';
    if (subEl) subEl.textContent = 'A small demo showcasing a train booking flow inspired by open-source projects.';
    if (countEl) countEl.textContent = '';

    if (!list) return;
    list.innerHTML =
      '<div class="hero-card" style="padding:24px;border-radius:8px;box-shadow:var(--card-shadow);">' +
        '<h2 style="margin:0 0 8px;">Plan. Book. Travel.</h2>' +
        '<p class="text-muted" style="margin:0 0 12px;">This is a demo application — bookings are simulated using local data. Use the dashboard to search and book demo tickets. Feel free to explore the code or adapt ideas from public projects for learning purposes.</p>' +
        '<div style="display:flex;gap:10px;margin-top:8px;flex-wrap:wrap;">' +
          '<a class="btn btn-primary" href="/dashboard.html">Search Trains</a>' +
          '<a class="btn btn-outline" href="/">Project Home</a>' +
        '</div>' +
      '</div>';
  }

  // Run immediately
  showHero();
})();

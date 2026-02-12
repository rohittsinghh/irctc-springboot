/**
 * auth.js  —  Session management using sessionStorage
 * Exposes window.Auth
 */
(function (global) {
  'use strict';

  var KEY = 'irctc_sess';

  global.Auth = {
    set: function (userId, name) {
      sessionStorage.setItem(KEY, JSON.stringify({ userId: userId, name: name }));
    },
    get: function () {
      try { return JSON.parse(sessionStorage.getItem(KEY)); } catch (e) { return null; }
    },
    clear: function () {
      sessionStorage.removeItem(KEY);
    },
    isLoggedIn: function () {
      return !!this.get();
    },
    requireAuth: function () {
      if (!this.isLoggedIn()) {
        window.location.href = '/index.html';
        return false;
      }
      return true;
    },
    redirectIfAuth: function () {
      if (this.isLoggedIn()) {
        window.location.href = '/dashboard.html';
        return true;
      }
      return false;
    }
  };

})(window);

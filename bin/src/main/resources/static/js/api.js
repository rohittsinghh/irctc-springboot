/**
 * api.js  —  All REST calls to Spring Boot backend
 * Plain script tag (no ES modules) for maximum compatibility.
 * Exposes a global window.API object.
 */

(function (global) {
  'use strict';

  var BASE = '/api';   /* same-origin: Spring Boot serves static + API on port 8080 */

  /** Custom error type */
  function ApiError(message, status) {
    this.name    = 'ApiError';
    this.message = message;
    this.status  = status;
  }
  ApiError.prototype = Object.create(Error.prototype);

  /** Core fetch wrapper */
  async function req(path, options) {
    options = options || {};
    var url = BASE + path;
    var config = Object.assign(
      { headers: { 'Content-Type': 'application/json' } },
      options
    );
    try {
      var res = await fetch(url, config);
      var text = await res.text();
      var data = text ? JSON.parse(text) : {};
      if (!res.ok) {
        throw new ApiError(data.error || data.message || ('HTTP ' + res.status), res.status);
      }
      return data;
    } catch (e) {
      if (e instanceof ApiError || e.name === 'ApiError') throw e;
      throw new ApiError('Cannot reach the server. Is Spring Boot running?', 0);
    }
  }

  global.API = {
    /* ── Auth ── */
    login:  function (name, password) {
      return req('/auth/login', { method: 'POST', body: JSON.stringify({ name: name, password: password }) });
    },
    signup: function (name, password) {
      return req('/auth/signup', { method: 'POST', body: JSON.stringify({ name: name, password: password }) });
    },

    /* ── Trains ── */
    getAllTrains: function () {
      return req('/trains');
    },
    searchTrains: function (source, destination) {
      return req('/trains/search?source=' + encodeURIComponent(source) + '&destination=' + encodeURIComponent(destination));
    },
    getTrainById: function (id) {
      return req('/trains/' + id);
    },

    /* ── Bookings ── */
    bookTicket: function (userId, trainId) {
      return req('/bookings', { method: 'POST', body: JSON.stringify({ userId: userId, trainId: trainId }) });
    },
    getUserBookings: function (userId) {
      return req('/bookings/' + userId);
    },
    cancelTicket: function (ticketId) {
      var session = (window.Auth && Auth.get && Auth.get()) || {};
      var userId = session.userId;
      var path = '/bookings/' + ticketId + (userId ? '?userId=' + encodeURIComponent(userId) : '');
      return req(path, { method: 'DELETE' });
    },

    /* ── Health ── */
    health: function () {
      return req('/health');
    }
  };

})(window);

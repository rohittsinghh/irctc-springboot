/**
 * stations.js — Local station dataset loader and simple query API
 */
(function (global) {
  'use strict';

  var Stations = {
    _cache: null,

    async load() {
      if (this._cache) return this._cache;
      var list = [];
      try {
        var res = await fetch('/data/stations.json', { cache: 'no-store' });
        if (res.ok) list = await res.json();
      } catch (e) { /* ignore */ }

      // optional remote merge (proxy endpoint if implemented)
      try {
        var r2 = await fetch('/api/irctc/stations', { cache: 'no-store' });
        if (r2.ok) {
          var remote = await r2.json();
          if (Array.isArray(remote)) list = list.concat(remote);
        }
      } catch (e) { /* ignore */ }

      // dedupe by code+name
      var seen = new Map();
      list.forEach(function (s) {
        var key = ((s.code || '') + '|' + (s.name || '')).toLowerCase();
        if (!seen.has(key)) seen.set(key, s);
      });

      this._cache = Array.from(seen.values());
      return this._cache;
    },

    async query(q, limit) {
      limit = limit || 10;
      if (!q) return [];
      var arr = await this.load();
      q = q.toLowerCase();
      return arr.filter(function (s) {
        return (s.code || '').toLowerCase().includes(q) ||
               (s.name || '').toLowerCase().includes(q) ||
               (s.city || '').toLowerCase().includes(q);
      }).slice(0, limit);
    }
  };

  global.Stations = Stations;
})(window);

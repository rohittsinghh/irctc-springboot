/**
 * login.js  —  Login page controller
 */
(function () {
  'use strict';

  Auth.redirectIfAuth();
  UI.renderNav();

  var form     = document.getElementById('login-form');
  var uInput   = document.getElementById('username');
  var pInput   = document.getElementById('password');
  var submitBtn = document.getElementById('btn-login');

  /* password eye toggle */
  var eyeBtn = document.getElementById('eye-pass');
  if (eyeBtn) {
    eyeBtn.addEventListener('click', function () {
      var t = pInput.type === 'password' ? 'text' : 'password';
      pInput.type = t;
      eyeBtn.textContent = t === 'password' ? '👁' : '🙈';
    });
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    UI.clearAllErr(form);

    var name     = uInput.value.trim();
    var password = pInput.value.trim();

    var valid = true;
    if (!name)     { UI.setErr(uInput, 'Username is required');  valid = false; }
    if (!password) { UI.setErr(pInput, 'Password is required');  valid = false; }
    if (!valid) return;

    UI.btnLoad(submitBtn, 'Signing in…');

    try {
      var data = await API.login(name, password);

      if (data.error) {
        var msgs = {
          invalid_credentials:              'Invalid username or password.',
          username_and_password_required:   'Both fields are required.'
        };
        UI.toast(msgs[data.error] || data.error, 'err');
        UI.btnReset(submitBtn);
        return;
      }

      Auth.set(data.userId, name);
      UI.toast('Welcome back, ' + name + '!', 'ok', 1600);
      setTimeout(function () {
        window.location.href = '/dashboard.html';
      }, 900);

    } catch (err) {
      UI.toast(err.message, 'err');
      UI.btnReset(submitBtn);
    }
  });

})();

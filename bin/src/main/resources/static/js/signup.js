/**
 * signup.js  —  Signup page controller
 */
(function () {
  'use strict';

  Auth.redirectIfAuth();
  UI.renderNav();

  var form      = document.getElementById('signup-form');
  var uInput    = document.getElementById('username');
  var pInput    = document.getElementById('password');
  var cInput    = document.getElementById('confirm');
  var submitBtn = document.getElementById('btn-signup');

  /* eye toggles */
  function eyeToggle(btnId, field) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', function () {
      var t = field.type === 'password' ? 'text' : 'password';
      field.type = t;
      btn.textContent = t === 'password' ? '👁' : '🙈';
    });
  }
  eyeToggle('eye-pass', pInput);
  eyeToggle('eye-conf', cInput);

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    UI.clearAllErr(form);

    var name     = uInput.value.trim();
    var password = pInput.value.trim();
    var confirm  = cInput.value.trim();

    var valid = true;
    if (!name)             { UI.setErr(uInput, 'Username is required'); valid = false; }
    else if (name.length < 3)  { UI.setErr(uInput, 'Minimum 3 characters'); valid = false; }

    if (!password)          { UI.setErr(pInput, 'Password is required'); valid = false; }
    else if (password.length < 4) { UI.setErr(pInput, 'Minimum 4 characters'); valid = false; }

    if (password && confirm !== password) { UI.setErr(cInput, 'Passwords do not match'); valid = false; }
    if (!valid) return;

    UI.btnLoad(submitBtn, 'Creating account…');

    try {
      var data = await API.signup(name, password);

      if (data.error) {
        var msgs = {
          user_already_exists:            'That username is already taken.',
          username_and_password_required: 'Both fields are required.'
        };
        UI.toast(msgs[data.error] || data.error, 'err');
        UI.btnReset(submitBtn);
        return;
      }

      UI.toast('Account created! Redirecting to login…', 'ok', 2200);
      setTimeout(function () {
        window.location.href = '/index.html';
      }, 1500);

    } catch (err) {
      UI.toast(err.message, 'err');
      UI.btnReset(submitBtn);
    }
  });

})();

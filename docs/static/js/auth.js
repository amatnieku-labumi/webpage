// Login, registration and logout (replaces the Flask /login, /register and
// /logout routes). Forms are marked with data-login-form / data-register-form.

(function () {
    function showError(form, message) {
        var box = form.querySelector('[data-form-error]');
        if (box) {
            box.textContent = message;
            box.hidden = !message;
        } else if (message) {
            alert(message);
        }
    }

    function setBusy(form, busy) {
        var btn = form.querySelector('button[type="submit"]');
        if (btn) btn.disabled = busy;
    }

    function formData(form) {
        var data = {};
        Array.prototype.forEach.call(form.elements, function (el) {
            if (el.name) data[el.name] = el.type === 'password' ? el.value : el.value.trim();
        });
        return data;
    }

    function onSignedIn(form, result) {
        Store.setUser({ user_id: result.user.user_id, name: result.user.name, token: result.token });
        Store.mergeCart(result.cart || {});
        var target = form.getAttribute('data-redirect');
        if (target) window.location.href = target;
        else renderUser();
    }

    function submitHandler(action, validate) {
        return function (event) {
            event.preventDefault();
            var form = event.currentTarget;
            var data = formData(form);
            var error = validate(data);
            if (error) return showError(form, error);
            showError(form, '');
            setBusy(form, true);
            api(action, data)
                .then(function (result) { onSignedIn(form, result); })
                .catch(function (err) { showError(form, err.message); })
                .then(function () { setBusy(form, false); });
        };
    }

    var login = submitHandler('login', function (d) {
        if (!d.email || !d.password) return 'Nepareizs e-pasts vai parole.';
    });

    var register = submitHandler('register', function (d) {
        if (!d.name || !d.surname || !d.email || !d.password) return 'Lūdzu aizpildiet visus obligātos laukus.';
    });

    function logout(event) {
        event.preventDefault();
        var user = Store.getUser();
        Store.setUser(null);
        if (user && apiConfigured()) {
            api('logout', { user_id: user.user_id, token: user.token }).catch(function () {});
        }
        window.location.href = 'index.html';
    }

    function renderUser() {
        var user = Store.getUser();
        document.querySelectorAll('[data-auth="in"]').forEach(function (el) { el.hidden = !user; });
        document.querySelectorAll('[data-auth="out"]').forEach(function (el) { el.hidden = !!user; });
        document.querySelectorAll('[data-user-name]').forEach(function (el) {
            el.textContent = user ? user.name : '';
        });
    }

    document.querySelectorAll('[data-login-form]').forEach(function (f) { f.addEventListener('submit', login); });
    document.querySelectorAll('[data-register-form]').forEach(function (f) { f.addEventListener('submit', register); });
    document.querySelectorAll('[data-logout]').forEach(function (a) { a.addEventListener('click', logout); });

    // Keep clicks inside the header dropdown form from closing the dropdown.
    document.querySelectorAll('.dropdown-menu form').forEach(function (f) {
        f.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    renderUser();
})();

// Browser-side replacement for the Flask `session`:
//   - the cart lives in localStorage as {product_id: quantity}
//   - the logged-in user lives in localStorage as {user_id, name, token}
// When a user is logged in, every cart change is also saved to the sheet.

var Store = (function () {
    var CART_KEY = 'amatnieki.cart';
    var USER_KEY = 'amatnieki.user';

    function read(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    function write(key, value) {
        try {
            if (value === null) localStorage.removeItem(key);
            else localStorage.setItem(key, JSON.stringify(value));
        } catch (e) { /* storage blocked: the page still works for this visit */ }
    }

    function getCart() {
        var cart = read(CART_KEY, {});
        return (cart && typeof cart === 'object') ? cart : {};
    }

    function cartCount() {
        var cart = getCart();
        return Object.keys(cart).reduce(function (sum, id) { return sum + (cart[id] || 0); }, 0);
    }

    function renderCartCount() {
        var el = document.getElementById('cartCount');
        if (!el) return;
        var n = cartCount();
        el.textContent = n;
        el.hidden = n === 0;
    }

    function syncCart() {
        var user = getUser();
        if (!user || typeof api !== 'function' || !apiConfigured()) return;
        api('saveCart', { user_id: user.user_id, token: user.token, cart: getCart() })
            .catch(function (err) { console.warn('Grozu neizdevās saglabāt serverī:', err.message); });
    }

    function setCart(cart, opts) {
        write(CART_KEY, cart);
        renderCartCount();
        if (!opts || opts.sync !== false) syncCart();
    }

    function addToCart(productId) {
        var cart = getCart();
        var id = String(productId);
        cart[id] = (cart[id] || 0) + 1;
        setCart(cart);
    }

    function emptyCart() {
        setCart({});
    }

    // Combines the browser cart with the cart saved on the server at login.
    function mergeCart(serverCart) {
        var cart = getCart();
        Object.keys(serverCart || {}).forEach(function (id) {
            cart[id] = Math.max(cart[id] || 0, serverCart[id] || 0);
        });
        setCart(cart);
    }

    function getUser() {
        var user = read(USER_KEY, null);
        return (user && user.user_id) ? user : null;
    }

    function setUser(user) {
        write(USER_KEY, user);
    }

    document.addEventListener('DOMContentLoaded', renderCartCount);
    if (document.readyState !== 'loading') renderCartCount();

    return {
        getCart: getCart,
        setCart: setCart,
        addToCart: addToCart,
        emptyCart: emptyCart,
        mergeCart: mergeCart,
        getUser: getUser,
        setUser: setUser
    };
})();

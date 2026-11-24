// Catalogue page: "Pievienot grozam" and "Apskatīt visu" buttons.

(function () {
    document.querySelectorAll('[data-add-to-cart]').forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            Store.addToCart(link.getAttribute('data-add-to-cart'));
        });
    });

    var showAll = document.getElementById('showAllProducts');
    if (showAll) {
        showAll.addEventListener('click', function (event) {
            event.preventDefault();
            document.querySelectorAll('[data-extra-product]').forEach(function (el) { el.hidden = false; });
            showAll.parentNode.hidden = true;
        });
    }
})();

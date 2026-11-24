// Connection to the Google Apps Script web app (apps-script/Code.gs),
// which stores users, carts and orders in a Google Spreadsheet.
//
// Paste the web app URL from Apps Script (Deploy > New deployment > Web app)
// here. It ends in /exec.
var API_URL = 'https://script.google.com/macros/s/AKfycbxAie4Hfj2uwIqTLz0_cDEUOe61YOcsAvEl_z-3GgnUYCK5KtDkEJLCmwAFDs83iH5Hvw/exec';

function apiConfigured() {
    return /^https:\/\/script\.google\.com\/.+\/exec$/.test(API_URL);
}

// Sends {action, ...payload} to the script and resolves with its JSON reply.
// The body is sent as text/plain on purpose: Apps Script cannot answer CORS
// preflight (OPTIONS) requests, and text/plain does not trigger one.
function api(action, payload) {
    if (!apiConfigured()) {
        return Promise.reject(new Error('Serveris nav konfigurēts (API_URL failā static/js/api.js).'));
    }
    var body = Object.assign({ action: action }, payload || {});
    return fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body)
    })
        .then(function (res) {
            if (!res.ok) throw new Error('Servera kļūda (' + res.status + ').');
            return res.json();
        })
        .then(function (data) {
            if (!data.ok) throw new Error(data.error || 'Nezināma kļūda.');
            return data;
        });
}

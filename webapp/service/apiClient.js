sap.ui.define([], function () {
    "use strict";

    // ponytail: every *Client.js module POSTs JSON to xyra-core the same way -
    // one shared fetch-with-timeout instead of each reinventing it. A hung
    // backend now rejects after TIMEOUT_MS straight into the caller's
    // existing .catch()/fallback path, instead of leaving the UI waiting
    // indefinitely with zero feedback (previously: no timeout at all, so a
    // stalled request just hung until the browser gave up on its own).
    var TIMEOUT_MS = 15000;

    function postJson(sUrl, oBody) {
        var oController = (typeof AbortController !== "undefined") ? new AbortController() : null;
        var iTimer = oController ? setTimeout(function () { oController.abort(); }, TIMEOUT_MS) : null;

        function clear() { if (iTimer) { clearTimeout(iTimer); } }

        return fetch(sUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(oBody),
            signal: oController ? oController.signal : undefined
        }).then(function (r) {
            clear();
            return r.json();
        }, function (err) {
            clear();
            throw err;
        });
    }

    return { postJson: postJson };
});

sap.ui.define([], function () {
    "use strict";

    // ponytail: plain sessionStorage, not a JWT/token — there's no session/JWT
    // layer on the backend yet (every endpoint still takes subdomain/userId
    // explicitly in the request body, see auth-service.js). This just remembers
    // who's logged in for THIS browser tab so pages like Profile/Configuration
    // know who/what tenant they're operating on, instead of nothing at all.
    var KEY = "xyra.session";

    return {
        save: function (oSession) {
            sessionStorage.setItem(KEY, JSON.stringify(oSession));
        },
        get: function () {
            var sRaw = sessionStorage.getItem(KEY);
            return sRaw ? JSON.parse(sRaw) : null;
        },
        clear: function () {
            sessionStorage.removeItem(KEY);
        }
    };
});

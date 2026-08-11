sap.ui.define([], function () {
    "use strict";

    var KEY = "xyra.sidebarExpanded";

    // ponytail: sideExpanded="true" is hardcoded in every page's XML, so a
    // fresh navigation always rebuilt the ToolPage expanded regardless of what
    // the user had chosen on the page they left. sessionStorage carries that
    // choice across the full view reconstruction each route change causes.
    return {
        get: function () {
            var sValue = sessionStorage.getItem(KEY);
            return sValue === null ? true : sValue === "true";
        },
        save: function (bExpanded) {
            sessionStorage.setItem(KEY, bExpanded ? "true" : "false");
        }
    };
});

sap.ui.define([], function () {
    "use strict";

    // ponytail: CSS alone couldn't beat the theme's focus-ring rule after
    // several rounds of raising specificity on Login's Input/Select fields —
    // inline style (especially !important) outranks every stylesheet rule
    // regardless of selector specificity or load order. Same bug then showed
    // up on Configuration's SearchField, so this moved out of Login.controller.js
    // into one shared helper any view can call instead of re-fighting it
    // page by page. Call once per view from onAfterRendering — it guards
    // itself so re-renders don't attach a second listener.
    return function killFocusRing(oView) {
        var oDomRef = oView.getDomRef();
        if (!oDomRef || oDomRef.dataset.focusRingKilled) { return; }
        oDomRef.dataset.focusRingKilled = "true";
        oDomRef.addEventListener("focusin", function (oEvent) {
            var el = oEvent.target;
            var bInSearchField = !!(el && el.closest && el.closest(".sapMSF, .sapMSFF"));
            while (el && el !== oDomRef) {
                el.style.setProperty("outline", "none", "important");
                el.style.setProperty("box-shadow", "none", "important");
                if (bInSearchField) {
                    if (el.classList.contains("sapMSFF")) {
                        el.style.setProperty("border-color", "#533bff", "important");
                        el.style.setProperty("border-width", "1px", "important");
                        el.style.setProperty("border-style", "solid", "important");
                    }
                } else {
                    el.style.setProperty("border-color", "#E2E8F0", "important");
                }
                el = el.parentElement;
            }
        }, true);

        oDomRef.addEventListener("focusout", function (oEvent) {
            var el = oEvent.target;
            var oSearchWrapper = el && el.closest && el.closest(".sapMSF");
            if (oSearchWrapper) {
                var oForm = oSearchWrapper.querySelector(".sapMSFF");
                if (oForm) {
                    oForm.style.setProperty("border-color", "#cbd5e1", "important");
                }
            }
        }, true);
    };
});

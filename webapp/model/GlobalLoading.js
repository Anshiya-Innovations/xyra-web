sap.ui.define([
    "sap/ui/core/BusyIndicator"
], function (BusyIndicator) {
    "use strict";

    var oOverlay = null;
    var oTextEl = null;
    var iHideTimer = null;
    var bIsAppLoaded = false;

    // Enable user-triggered loading overlay 800ms after initial page load to prevent Chrome refresh glitches
    setTimeout(function () {
        bIsAppLoaded = true;
    }, 800);

    // ONLY NAVIGATIONS FOR CONFIGURATION AND ACCESS MANAGEMENT TRIGGER ROUTER LOADING
    var ALLOWED_ACTIVITIES = {
        "Configuration": "System Configuration",
        "AutomationMonitoring": "System Configuration",
        "AccessManagement": "Access Management"
    };

    function createOverlay() {
        if (oOverlay) {
            return;
        }

        oOverlay = document.createElement("div");
        oOverlay.id = "xyraGlobalLoadingOverlay";
        oOverlay.className = "xyraLoadingOverlayContainer";

        var oCard = document.createElement("div");
        oCard.className = "xyraLoadingOverlayCard";

        oTextEl = document.createElement("div");
        oTextEl.id = "xyraGlobalLoadingText";
        oTextEl.className = "xyraLoadingActivityText";
        oTextEl.textContent = "";

        var oDots = document.createElement("div");
        oDots.className = "xyra-dot-flashing";
        oDots.innerHTML = "<span></span><span></span><span></span>";

        oCard.appendChild(oTextEl);
        oCard.appendChild(oDots);
        oOverlay.appendChild(oCard);
        document.body.appendChild(oOverlay);
    }

    var GlobalLoading = {
        init: function () {
            createOverlay();
            this._patchNativeBusyIndicator();
        },

        isAllowedRoute: function (sRouteName) {
            return !!ALLOWED_ACTIVITIES[sRouteName];
        },

        getActivityForRoute: function (sRouteName) {
            return ALLOWED_ACTIVITIES[sRouteName] || "";
        },

        show: function (sActivityText, iDurationMs, bForce) {
            if (!sActivityText || (!bIsAppLoaded && !bForce)) {
                return;
            }

            createOverlay();

            if (oTextEl) {
                var sClean = sActivityText
                    .replace(/loading\.{0,3}/gi, "")
                    .replace(/please wait\.{0,3}/gi, "")
                    .replace(/\.\.\./g, "...")
                    .trim();
                oTextEl.textContent = sClean || sActivityText;
            }

            if (iHideTimer) {
                clearTimeout(iHideTimer);
                iHideTimer = null;
            }

            if (oOverlay) {
                oOverlay.classList.add("xyraLoadingOverlayVisible");
            }

            var iTime = (iDurationMs !== undefined && iDurationMs !== null) ? iDurationMs : 3000;
            if (iTime > 0) {
                var self = this;
                iHideTimer = setTimeout(function () {
                    self.hide();
                }, iTime);
            }
        },

        hide: function () {
            if (iHideTimer) {
                clearTimeout(iHideTimer);
                iHideTimer = null;
            }
            if (oOverlay) {
                oOverlay.classList.remove("xyraLoadingOverlayVisible");
            }
        },

        logout: function (oController) {
            this.show("Logout", 3000, true);
            setTimeout(function () {
                if (oController && typeof oController.navToRoute === "function") {
                    oController.navToRoute("Login");
                } else if (oController && oController.getOwnerComponent && oController.getOwnerComponent().getRouter()) {
                    oController.getOwnerComponent().getRouter().navTo("Login");
                } else {
                    window.location.hash = "#/Login";
                }
            }, 300);
        },

        _patchNativeBusyIndicator: function () {
            var self = this;
            var fnOrigHide = BusyIndicator.hide;
            BusyIndicator.hide = function () {
                self.hide();
                fnOrigHide.apply(BusyIndicator, arguments);
            };
        }
    };

    GlobalLoading.init();
    return GlobalLoading;
});

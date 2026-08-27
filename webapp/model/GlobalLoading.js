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

        show: function (sActivityText, iDurationMs, bForce, bContentOnly) {
            // Auto-detect activity text from hash if missing
            var sHash = window.location.hash || "";
            if (!sActivityText) {
                if (sHash.indexOf("Configuration") !== -1) {
                    sActivityText = "System Configuration";
                } else if (sHash.indexOf("AccessManagement") !== -1) {
                    sActivityText = "Access Management";
                }
            }

            if (!sActivityText || (!bIsAppLoaded && !bForce && sActivityText !== "System Configuration" && sActivityText !== "Access Management")) {
                return;
            }

            createOverlay();

            var sClean = sActivityText
                .replace(/loading\.{0,3}/gi, "")
                .replace(/please wait\.{0,3}/gi, "")
                .replace(/\.\.\./g, "")
                .trim();

            if (!sClean) {
                sClean = sActivityText;
            }

            if (oTextEl) {
                oTextEl.textContent = sClean;
                oTextEl.style.display = "block";
            }

            if (bContentOnly === undefined) {
                bContentOnly = (sClean === "System Configuration" || sClean === "Access Management" ||
                                sHash.indexOf("Configuration") !== -1 || sHash.indexOf("AccessManagement") !== -1);
            }

            if (bContentOnly) {
                // Ensure left sidebar is NOT blurred by offsetting overlay past sidebar width (default 240px)
                var oSideNav = document.querySelector(".sapTNTSideNavigation") ||
                               document.querySelector(".sapTNTToolPageSide");
                var iSideWidth = oSideNav ? oSideNav.getBoundingClientRect().width : 240;
                if (!iSideWidth || iSideWidth < 10) {
                    iSideWidth = 240;
                }

                oOverlay.style.setProperty("left", iSideWidth + "px", "important");
                oOverlay.style.setProperty("width", "calc(100vw - " + iSideWidth + "px)", "important");
                oOverlay.classList.add("xyraContentOnlyOverlay");
            } else {
                oOverlay.style.setProperty("left", "0px", "important");
                oOverlay.style.setProperty("width", "100vw", "important");
                oOverlay.classList.remove("xyraContentOnlyOverlay");
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
            try {
                var Session = sap.ui.require("xyraweb/model/session");
                if (Session && typeof Session.clear === "function") {
                    Session.clear();
                }
            } catch (e) {
                // Ignore if session module not yet loaded
            }

            this.show("Logout", 500, true, false);
            setTimeout(function () {
                var oRouter = null;
                if (oController) {
                    if (typeof oController.getOwnerComponent === "function" && oController.getOwnerComponent()) {
                        oRouter = oController.getOwnerComponent().getRouter();
                    }
                    if (!oRouter && typeof sap !== "undefined" && sap.ui && sap.ui.core && sap.ui.core.UIComponent) {
                        oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
                    }
                    if (!oRouter && typeof oController.navToRoute === "function") {
                        oController.navToRoute("Login");
                        return;
                    }
                }
                if (oRouter) {
                    oRouter.navTo("Login");
                } else {
                    window.location.hash = "#/Login";
                }
            }, 300);
        },

        _patchNativeBusyIndicator: function () {
            var self = this;
            var fnOrigShow = BusyIndicator.show;
            var fnOrigHide = BusyIndicator.hide;

            BusyIndicator.show = function (iDelay, sText) {
                var sHash = window.location.hash || "";
                if (sHash.indexOf("Configuration") !== -1) {
                    self.show("System Configuration", 3000, true, true);
                } else if (sHash.indexOf("AccessManagement") !== -1) {
                    self.show("Access Management", 3000, true, true);
                }
                fnOrigShow.apply(BusyIndicator, arguments);
            };

            BusyIndicator.hide = function () {
                self.hide();
                fnOrigHide.apply(BusyIndicator, arguments);
            };
        }
    };

    GlobalLoading.init();
    return GlobalLoading;
});

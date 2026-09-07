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

    function updateOverlayBounds(sActivityText, bContentOnly) {
        if (!oOverlay) {
            return;
        }

        var sHash = window.location.hash || "";
        var bIsLogin = !sHash || sHash === "#" || sHash === "#/" || sHash.indexOf("Login") !== -1;
        var sText = (sActivityText || "").toLowerCase();
        var bIsFullPageAction = bIsLogin || sText.indexOf("logout") !== -1 || sText.indexOf("signing in") !== -1 || sText.indexOf("sign in") !== -1 || bContentOnly === false;

        // Sign In AND Logout MUST BE 100% FULL SCREEN BLURRED (including sidebar / entire window)
        if (bIsFullPageAction) {
            if (oOverlay.parentNode !== document.body) {
                document.body.appendChild(oOverlay);
            }
            oOverlay.style.setProperty("position", "fixed", "important");
            oOverlay.style.setProperty("left", "0px", "important");
            oOverlay.style.setProperty("right", "0px", "important");
            oOverlay.style.setProperty("top", "0px", "important");
            oOverlay.style.setProperty("bottom", "0px", "important");
            oOverlay.style.setProperty("width", "100%", "important");
            oOverlay.style.setProperty("height", "100%", "important");
            oOverlay.classList.remove("xyraContentOnlyOverlay");
            return;
        }

        // In-app route loading (System Configuration & Access Management refresh): blur ONLY main content area
        var oMain = document.querySelector(".sapTntToolPageMain") ||
                    document.querySelector(".sapTntToolPageContent") ||
                    document.querySelector(".sapMPage");

        if (oMain) {
            var sPos = window.getComputedStyle(oMain).position;
            if (sPos === "static" || !sPos) {
                oMain.style.setProperty("position", "relative", "important");
            }
            if (oOverlay.parentNode !== oMain) {
                oMain.appendChild(oOverlay);
            }
            oOverlay.style.setProperty("position", "absolute", "important");
            oOverlay.style.setProperty("left", "0px", "important");
            oOverlay.style.setProperty("right", "0px", "important");
            oOverlay.style.setProperty("top", "0px", "important");
            oOverlay.style.setProperty("bottom", "0px", "important");
            oOverlay.style.setProperty("width", "100%", "important");
            oOverlay.style.setProperty("height", "100%", "important");
            oOverlay.classList.add("xyraContentOnlyOverlay");
        } else {
            // Fallback if main content container is not yet attached to DOM
            if (oOverlay.parentNode !== document.body) {
                document.body.appendChild(oOverlay);
            }
            var oSideNav = document.querySelector(".sapTntSideNavigation") ||
                           document.querySelector(".sapTntToolPageAside") ||
                           document.querySelector("aside");
            var iSideWidth = 240;
            if (oSideNav && oSideNav.getBoundingClientRect) {
                var r = oSideNav.getBoundingClientRect().right;
                if (r > 50) {
                    iSideWidth = Math.ceil(r);
                }
            }
            oOverlay.style.setProperty("position", "fixed", "important");
            oOverlay.style.setProperty("left", iSideWidth + "px", "important");
            oOverlay.style.setProperty("right", "0px", "important");
            oOverlay.style.setProperty("top", "0px", "important");
            oOverlay.style.setProperty("bottom", "0px", "important");
            oOverlay.classList.add("xyraContentOnlyOverlay");
        }
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

            var fnUpdate = function () {
                updateOverlayBounds(sActivityText, bContentOnly);
            };

            fnUpdate();
            setTimeout(fnUpdate, 50);
            setTimeout(fnUpdate, 150);
            setTimeout(fnUpdate, 300);
            setTimeout(fnUpdate, 500);
            setTimeout(fnUpdate, 800);

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
            var fnOrigHide = BusyIndicator.hide;

            // In-page actions (Add System, Create User, Test Connection) use silent BusyIndicator;
            // GlobalLoading overlay is shown ONLY on initial page load / route navigation via Component.js.
            BusyIndicator.show = function (iDelay, sText) {
                // Suppress native 3-dot overlay and do not re-trigger full page GlobalLoading overlay
            };

            BusyIndicator.hide = function () {
                self.hide();
                try {
                    fnOrigHide.apply(BusyIndicator, arguments);
                } catch (e) {}
            };
        }
    };

    GlobalLoading.init();
    return GlobalLoading;
});

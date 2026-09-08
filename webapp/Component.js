sap.ui.define([
    "sap/ui/core/UIComponent",
    "xyraweb/model/models",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationService",
    "sap/ui/core/Popup",
    "sap/m/Select"
], (UIComponent, models, GlobalLoading, NotificationService, Popup, Select) => {
    "use strict";

    return UIComponent.extend("xyraweb.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // Install safe coordinate callback delegator for Popups
            if (Popup && !Popup._xyraCallbackPatched) {
                Popup._xyraCallbackPatched = true;
                const fnOrigApplyPosition = Popup.prototype._applyPosition;
                Popup.prototype._applyPosition = function(oPosition) {
                    fnOrigApplyPosition.apply(this, arguments);
                    if (typeof this._xyraAlignCallback === "function") {
                        this._xyraAlignCallback();
                    }
                };
            }

            // Install closed-loop alignment compensator specifically for dropdown selection popovers
            if (Select && !Select._xyraAlignPatched) {
                Select._xyraAlignPatched = true;
                const fnOrigOpen = Select.prototype.open;
                Select.prototype.open = function() {
                    const res = fnOrigOpen.apply(this, arguments);
                    const oPicker = this.getPicker();
                    if (oPicker) {
                        const that = this;
                        const fnAlign = function() {
                            const oSelDom = that.getDomRef();
                            const oPkrDom = oPicker.getDomRef();
                            if (!oSelDom || !oPkrDom) {
                                return;
                            }

                            const z = parseFloat(window.getComputedStyle(document.documentElement).zoom) || 1;
                            if (Math.abs(z - 1) < 0.005) {
                                return;
                            }

                            const sR = oSelDom.getBoundingClientRect();
                            const pR = oPkrDom.getBoundingClientRect();

                            // 1. Exact horizontal alignment & matching width
                            oPkrDom.style.left = (sR.left / z) + "px";
                            if (sR.width > 0) {
                                const sWidth = (sR.width / z) + "px";
                                oPkrDom.style.width = sWidth;
                                oPkrDom.style.minWidth = sWidth;
                            }

                            // 2. Docking vertical alignment
                            const pHeight = pR.height || 180;
                            const spaceBelow = window.innerHeight - sR.bottom;
                            if (spaceBelow >= Math.min(pHeight, 180) || spaceBelow >= (window.innerHeight / 3)) {
                                oPkrDom.style.top = ((sR.bottom + 2) / z) + "px";
                            } else {
                                oPkrDom.style.top = ((sR.top - 2 - pHeight) / z) + "px";
                            }
                        };

                        const oPopup = oPicker.oPopup || (oPicker._oPopover && oPicker._oPopover.oPopup);
                        if (oPopup) {
                            oPopup._xyraAlignCallback = fnAlign;
                        }

                        if (!oPicker._xyraAlignAttached) {
                            oPicker._xyraAlignAttached = true;
                            oPicker.attachAfterOpen(fnAlign);
                        }

                        requestAnimationFrame(fnAlign);
                        setTimeout(fnAlign, 10);
                        setTimeout(fnAlign, 30);
                        setTimeout(fnAlign, 60);
                    }
                    return res;
                };
            }

            // set device model & global notifications model
            this.setModel(models.createDeviceModel(), "device");
            this.setModel(NotificationService.getModel(), "notifications");

            // Show loading screen on initial page load / F5 refresh OR first time entering page after Sign In
            var bInitialPageLoad = true;
            var mVisitedRoutes = {};
            var oRouter = this.getRouter();
            if (oRouter) {
                oRouter.attachBeforeRouteMatched((oEvent) => {
                    var sRouteName = oEvent.getParameter("name");
                    var docEl = document.documentElement;
                    if (sRouteName === "Login") {
                        mVisitedRoutes = {};
                        if (docEl) {
                            docEl.classList.remove("xyra-app-zoomed");
                            docEl.classList.add("xyra-login-active");
                        }
                    } else {
                        if (docEl) {
                            docEl.classList.add("xyra-app-zoomed");
                            docEl.classList.remove("xyra-login-active");
                        }
                    }
                    if (GlobalLoading.isAllowedRoute(sRouteName)) {
                        if (bInitialPageLoad || !mVisitedRoutes[sRouteName]) {
                            mVisitedRoutes[sRouteName] = true;
                            var sActivity = GlobalLoading.getActivityForRoute(sRouteName);
                            GlobalLoading.show(sActivity, 1500, true, true);
                        }
                    }
                    bInitialPageLoad = false;
                });
                // Every page has its own bell button instance - a freshly
                // rendered one starts with no data-unread-count attribute until
                // JS touches it. Re-apply the current badge state after each
                // navigation instead of waiting for the next poll (up to 20s -
                // see NotificationService.js) to reach the new page's button.
                oRouter.attachRouteMatched(() => {
                    setTimeout(NotificationService.updateBadges, 100);
                });
                oRouter.initialize();
            }

            // Global dropdown / select hover border highlight (works before and after click/focus)
            document.addEventListener("mouseover", function (oEvent) {
                var oSelect = oEvent.target && oEvent.target.closest && oEvent.target.closest(".sapMSlt, .sapMSelect");
                if (oSelect) {
                    oSelect.style.setProperty("border-color", "#533bff", "important");
                }
            }, true);

            document.addEventListener("mouseout", function (oEvent) {
                var oSelect = oEvent.target && oEvent.target.closest && oEvent.target.closest(".sapMSlt, .sapMSelect");
                if (oSelect) {
                    oSelect.style.removeProperty("border-color");
                }
            }, true);
        }
    });
});
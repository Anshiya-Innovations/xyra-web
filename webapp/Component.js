sap.ui.define([
    "sap/ui/core/UIComponent",
    "xyraweb/model/models",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationService",
    "sap/ui/core/Popup"
], (UIComponent, models, GlobalLoading, NotificationService, Popup) => {
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

            // Install automatic coordinate compensator for SAPUI5 Popups when CSS zoom is active
            if (Popup && !Popup._xyraZoomPatched) {
                Popup._xyraZoomPatched = true;
                const fnOrigApplyPosition = Popup.prototype._applyPosition;
                Popup.prototype._applyPosition = function(oPosition) {
                    fnOrigApplyPosition.apply(this, arguments);

                    const z = parseFloat(window.getComputedStyle(document.documentElement).zoom) || 1;
                    if (Math.abs(z - 1) > 0.005 && this._$) {
                        const $Ref = this._$();
                        if ($Ref && $Ref.length && $Ref[0]) {
                            const dom = $Ref[0];
                            // Do not adjust Dialogs or Message Boxes which are centered via CSS fixed positioning
                            if (dom.classList.contains("sapMDialog") || dom.classList.contains("sapMMessageBox") || dom.classList.contains("sapMMessageDialog")) {
                                return;
                            }
                            if (dom.style.left && dom.style.left.indexOf("px") > -1) {
                                dom.style.left = (parseFloat(dom.style.left) / z) + "px";
                            }
                            if (dom.style.right && dom.style.right.indexOf("px") > -1) {
                                dom.style.right = (parseFloat(dom.style.right) / z) + "px";
                            }
                            if (dom.style.top && dom.style.top.indexOf("px") > -1) {
                                dom.style.top = (parseFloat(dom.style.top) / z) + "px";
                            }
                            if (dom.style.width && dom.style.width.indexOf("px") > -1) {
                                dom.style.width = (parseFloat(dom.style.width) / z) + "px";
                            }
                            if (dom.style.minWidth && dom.style.minWidth.indexOf("px") > -1) {
                                dom.style.minWidth = (parseFloat(dom.style.minWidth) / z) + "px";
                            }
                        }
                    }
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
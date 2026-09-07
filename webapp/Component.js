sap.ui.define([
    "sap/ui/core/UIComponent",
    "xyraweb/model/models",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationService"
], (UIComponent, models, GlobalLoading, NotificationService) => {
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
                    if (sRouteName === "Login") {
                        mVisitedRoutes = {};
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
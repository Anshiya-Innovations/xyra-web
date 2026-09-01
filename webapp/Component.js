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

            // enable routing & handle ONLY allowed loading screens (System Configuration & Access Management)
            var oRouter = this.getRouter();
            if (oRouter) {
                oRouter.attachBeforeRouteMatched((oEvent) => {
                    var sRouteName = oEvent.getParameter("name");
                    if (GlobalLoading.isAllowedRoute(sRouteName)) {
                        var sActivity = GlobalLoading.getActivityForRoute(sRouteName);
                        GlobalLoading.show(sActivity, 2000, true, true);
                    }
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
        }
    });
});
sap.ui.define([
    "sap/ui/core/UIComponent",
    "xyraweb/model/models",
    "xyraweb/model/GlobalLoading"
], (UIComponent, models, GlobalLoading) => {
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

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

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
                oRouter.initialize();
            }
        }
    });
});
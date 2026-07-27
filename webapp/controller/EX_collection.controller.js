sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast"
], function (
    Controller,
    UIComponent,
    MessageToast
) {
    "use strict";

    return Controller.extend("xyraweb.controller.EXCollectionManager", {

        onInit: function () {

        },

        onRefresh: function () {
            MessageToast.show("Evidence list refreshed.");
        },

        onAssign: function () {
            MessageToast.show("Reviewer assigned successfully.");
        },

        onLogout: function () {
            UIComponent.getRouterFor(this).navTo("Login");
        }

    });

});
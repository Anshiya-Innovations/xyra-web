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

    return Controller.extend("xyraweb.controller.Firefighter", {

        onInit: function () {

        },

        onRefresh: function () {
            MessageToast.show("Emergency requests refreshed.");
        },

        onStartSession: function () {
            MessageToast.show("Emergency session started successfully.");
        },

        onLogout: function () {
            UIComponent.getRouterFor(this).navTo("Login");
        }

    });

});
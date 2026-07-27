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

    return Controller.extend("xyraweb.controller.Reviewer1", {

        onInit: function () {

        },

        onRefresh: function () {

            MessageToast.show("Data Refreshed");

        },

        onLogout: function () {

            UIComponent.getRouterFor(this).navTo("Login");

        }

    });

});
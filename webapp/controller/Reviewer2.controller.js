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

    return Controller.extend("xyraweb.controller.Reviewer2", {

        onInit: function () {

        },

        onRefresh: function () {
            MessageToast.show("Dashboard Refreshed");
        },

        onApprove: function () {
            MessageToast.show("Request Approved Successfully");
        },

        onReject: function () {
            MessageToast.show("Request Rejected");
        },

        onLogout: function () {
            UIComponent.getRouterFor(this).navTo("Login");
        }

    });

});
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

        onApproveSelectedPress: function () {
            var oTable = this.byId("reviewer2Table");
            var aSelected = oTable ? oTable.getSelectedItems() : [];
            if (aSelected.length === 0) {
                MessageToast.show("Please select at least one technical review to approve.");
            } else {
                MessageToast.show(aSelected.length + " Selected Technical Review(s) Approved Successfully");
            }
        },

        onRejectSelectedPress: function () {
            var oTable = this.byId("reviewer2Table");
            var aSelected = oTable ? oTable.getSelectedItems() : [];
            if (aSelected.length === 0) {
                MessageToast.show("Please select at least one technical review to reject.");
            } else {
                MessageToast.show(aSelected.length + " Selected Technical Review(s) Rejected");
            }
        },

        onSelectionChange: function (oEvent) {
            var aItems = oEvent.getSource().getSelectedItems();
            MessageToast.show(aItems.length + " row(s) selected");
        },

        onProfilePress: function (oEvent) {
            var oButton = oEvent.getSource();
            var oPopover = this.byId("rev2ProfilePopover");
            if (oPopover) {
                oPopover.openBy(oButton);
            }
        },

        onActionPress: function (oEvent) {
            var sText = oEvent.getSource().getText() || oEvent.getSource().getTooltip() || "Action";
            MessageToast.show("Reviewer 2 Action: " + sText);
        },

        onLogout: function () {
            UIComponent.getRouterFor(this).navTo("Login");
        }

    });

});
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

        onProfilePress: function (oEvent) {
            var oButton = oEvent.getSource();
            var oPopover = this.byId("rev1ProfilePopover");
            if (oPopover) {
                oPopover.openBy(oButton);
            }
        },

        onActionPress: function (oEvent) {
            var sText = oEvent.getSource().getText() || oEvent.getSource().getTooltip() || "Action";
            MessageToast.show("Reviewer 1 Action: " + sText);
        },

        onApproveSelectedPress: function () {
            var oTable = this.byId("reviewer1Table");
            var aSelected = oTable ? oTable.getSelectedItems() : [];
            if (aSelected.length === 0) {
                MessageToast.show("Please select at least one review to approve.");
            } else {
                MessageToast.show(aSelected.length + " Selected Review(s) Approved Successfully");
            }
        },

        onRejectSelectedPress: function () {
            var oTable = this.byId("reviewer1Table");
            var aSelected = oTable ? oTable.getSelectedItems() : [];
            if (aSelected.length === 0) {
                MessageToast.show("Please select at least one review to reject.");
            } else {
                MessageToast.show(aSelected.length + " Selected Review(s) Rejected");
            }
        },

        onSelectionChange: function (oEvent) {
            var aItems = oEvent.getSource().getSelectedItems();
            MessageToast.show(aItems.length + " row(s) selected");
        },

        onLogout: function () {
            UIComponent.getRouterFor(this).navTo("Login");
        }

    });

});
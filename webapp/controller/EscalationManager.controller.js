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

    return Controller.extend("xyraweb.controller.EscalationManager", {

        onInit: function () {

        },

        onRefresh: function () {
            MessageToast.show("Evidence list refreshed.");
        },

        onAssign: function () {
            var oDialog = this.byId("assignReviewerDialog");
            if (oDialog && oDialog.isOpen()) {
                oDialog.close();
            }
            MessageToast.show("Reviewer assigned successfully.");
        },

        onProfilePress: function (oEvent) {
            var oButton = oEvent.getSource();
            var oPopover = this.byId("escProfilePopover");
            if (oPopover) {
                oPopover.openBy(oButton);
            }
        },

        onOpenAssignDialog: function () {
            var oDialog = this.byId("assignReviewerDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseAssignDialog: function () {
            var oDialog = this.byId("assignReviewerDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onActionPress: function (oEvent) {
            var sText = oEvent.getSource().getText() || oEvent.getSource().getTooltip() || "Action";
            MessageToast.show("Escalation Manager: " + sText);
        },

        onLogout: function () {
            UIComponent.getRouterFor(this).navTo("Login");
        }

    });

});
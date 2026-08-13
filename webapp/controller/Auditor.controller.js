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

    return Controller.extend("xyraweb.controller.Auditor", {

        onInit: function () {

        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("auditorToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
            }
        },

        onSideNavItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            if (oItem) {
                var sKey = oItem.getKey();
                if (sKey && this[sKey]) {
                    this[sKey]();
                } else if (sKey) {
                    this.getOwnerComponent().getRouter().navTo(sKey);
                }
            }
        },

        onRefresh: function () {
            MessageToast.show("Audit data refreshed.");
        },

        onProfilePress: function (oEvent) {
            var oButton = oEvent.getSource();
            var oPopover = this.byId("auditorProfilePopover");
            if (oPopover) {
                oPopover.openBy(oButton);
            }
        },

        onActionPress: function (oEvent) {
            var sText = oEvent.getSource().getText() || oEvent.getSource().getTooltip() || "Action";
            MessageToast.show("Auditor Action: " + sText);
        },

        // Navigation Handlers
        onAdmin: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
        onControlManagement: function () { this.getOwnerComponent().getRouter().navTo("ControlManagement"); },
        onAIInsights: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
        onSOXCompliance: function () { this.getOwnerComponent().getRouter().navTo("SOXCompliance"); },
        onReports: function () { this.getOwnerComponent().getRouter().navTo("Reports"); },
        onAuditLogs: function () { this.getOwnerComponent().getRouter().navTo("AuditLogs"); },
        onConfiguration: function () { this.getOwnerComponent().getRouter().navTo("Configuration"); },
        onAccessManagement: function () { this.getOwnerComponent().getRouter().navTo("AccessManagement"); },
        onRiskAnalytics: function () { MessageToast.show("Navigating to Risk Analytics..."); },
        onSystemHealth: function () { MessageToast.show("Navigating to System Health..."); },
        onProfile: function () { this.getOwnerComponent().getRouter().navTo("Profile"); },
        onLogout: function () { this.getOwnerComponent().getRouter().navTo("Login"); }

    });

});
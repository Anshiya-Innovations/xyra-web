sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent"
], function (Controller, MessageToast, UIComponent) {
    "use strict";

    return Controller.extend("xyraweb.controller.Admin", {

        onInit: function () {

        },

        navToRoute: function (sRouteName) {
            var oRouter = UIComponent.getRouterFor(this) || (this.getOwnerComponent() && this.getOwnerComponent().getRouter());
            if (oRouter) {
                oRouter.navTo(sRouteName);
            } else {
                window.location.hash = "#/" + sRouteName;
            }
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("adminToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
            }
        },

        onSideNavItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            if (oItem) {
                var sKey = oItem.getKey();
                if (sKey) {
                    this.navToRoute(sKey);
                }
            }
        },

        onAdmin: function () {
            this.navToRoute("Admin");
        },

        onUserManagement: function () {
            this.navToRoute("UserManagement");
        },

        onRoleManagement: function () {
            this.navToRoute("RoleManagement");
        },

        onControlManagement: function () {
            this.navToRoute("ControlManagement");
        },

        onControlMonitoring: function () {
            this.navToRoute("ControlMonitoring");
        },

        onAIInsights: function () {
            this.navToRoute("AIInsights");
        },

        onSOXCompliance: function () {
            this.navToRoute("SOXCompliance");
        },

        onReports: function () {
            this.navToRoute("Reports");
        },

        onAuditLogs: function () {
            this.navToRoute("AuditLogs");
        },

        onConfiguration: function () {
            this.navToRoute("Configuration");
        },

        onAccessManagement: function () {
            this.navToRoute("AccessManagement");
        },

        onRiskAnalytics: function () {
            this.navToRoute("RiskAnalytics");
        },

        onEmergencyAccess: function () {
            this.navToRoute("EmergencyAccess");
        },

        onSystemHealth: function () {
            this.navToRoute("SystemHealth");
        },

        onProfile: function () {
            this.navToRoute("Profile");
        },

        onAdminProfilePress: function (oEvent) {
            var oButton = oEvent.getSource();
            var oPopover = this.byId("adminProfilePopover");
            if (oPopover) {
                oPopover.openBy(oButton);
            }
        },

        onNotificationPress: function () {
            MessageToast.show("System Notifications: 0 Critical Alerts");
        },

        onSearchPress: function () {
            MessageToast.show("Search initiated");
        },

        onHelpPress: function () {
            MessageToast.show("SAP Build Work Zone Help Documentation loaded");
        },

        onQuickAction: function (oEvent) {
            var sText = oEvent.getSource().getText();
            if (sText === "Create Control") {
                this.onControlManagement();
            } else {
                MessageToast.show("Action triggered: " + sText);
            }
        },

        onLogout: function () {
            MessageToast.show("Logged Out Successfully");
            this.navToRoute("Login");
        }

    });

});
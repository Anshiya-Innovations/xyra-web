sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("xyraweb.controller.Profile", {

        onInit: function () {

        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("profileToolPage");
            if (oToolPage) {
                var bSideExpanded = oToolPage.getSideExpanded();
                oToolPage.setSideExpanded(!bSideExpanded);
            }
            var oSideNav = this.byId("sideNavigation");
            if (oSideNav) {
                var bExpanded = oSideNav.getExpanded();
                oSideNav.setExpanded(!bExpanded);
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

        onAdmin: function () {
            this.getOwnerComponent().getRouter().navTo("Admin");
        },

        onRoleManagement: function () {
            this.getOwnerComponent().getRouter().navTo("RoleManagement");
        },

        onControlManagement: function () {
            this.getOwnerComponent().getRouter().navTo("ControlManagement");
        },

        onControlMonitoring: function () {
            this.getOwnerComponent().getRouter().navTo("ControlMonitoring");
        },

        onAIInsights: function () {
            this.getOwnerComponent().getRouter().navTo("AIInsights");
        },

        onSOXCompliance: function () {
            this.getOwnerComponent().getRouter().navTo("SOXCompliance");
        },

        onReports: function () {
            this.getOwnerComponent().getRouter().navTo("Reports");
        },

        onAuditLogs: function () {
            this.getOwnerComponent().getRouter().navTo("AuditLogs");
        },

        onConfiguration: function () {
            this.getOwnerComponent().getRouter().navTo("Configuration");
        },

        onAccessManagement: function () {
            this.getOwnerComponent().getRouter().navTo("AccessManagement");
        },

        onRiskAnalytics: function () {
            this.getOwnerComponent().getRouter().navTo("RiskAnalytics");
        },

        onSystemHealth: function () {
            this.getOwnerComponent().getRouter().navTo("SystemHealth");
        },

        onProfile: function () {
            this.getOwnerComponent().getRouter().navTo("Profile");
        },

        onPhoneLiveChange: function (oEvent) {
            var sValue = oEvent.getParameter("value") || "";
            var sCleaned = sValue.replace(/[^0-9]/g, "");
            if (sValue !== sCleaned) {
                oEvent.getSource().setValue(sCleaned);
            }
        },

        onSavePassword: function () {
            var oCurrentPass = this.byId("profCurrentPass");
            var oNewPass = this.byId("profNewPass");
            var oConfirmPass = this.byId("profConfirmPass");

            var sCurrent = oCurrentPass ? oCurrentPass.getValue() : "";
            var sNew = oNewPass ? oNewPass.getValue() : "";
            var sConfirm = oConfirmPass ? oConfirmPass.getValue() : "";

            if (!sCurrent || !sNew || !sConfirm) {
                MessageToast.show("Please enter Current Password, New Password, and Confirm Password.");
                return;
            }

            if (sNew !== sConfirm) {
                MessageToast.show("New Password and Confirm Password do not match.");
                return;
            }

            MessageToast.show("Password updated successfully!");
            if (oCurrentPass) { oCurrentPass.setValue(""); }
            if (oNewPass) { oNewPass.setValue(""); }
            if (oConfirmPass) { oConfirmPass.setValue(""); }
        },

        onSaveProfile: function () {
            MessageToast.show("Personal & Account details saved successfully.");
        },

        onResetProfile: function () {
            var aInputIds = [
                "profFullName", "profEmail", "profPhone", "profDepartment", "profOrg",
                "profCurrentPass", "profNewPass", "profConfirmPass"
            ];
            aInputIds.forEach(function (sId) {
                var oInput = this.byId(sId);
                if (oInput) {
                    oInput.setValue("");
                }
            }.bind(this));
            MessageToast.show("All profile text details have been reset.");
        },

        onNotificationPress: function () {
            MessageToast.show("System Notifications: Account operational.");
        },

        onQuickAction: function (oEvent) {
            var sText = oEvent.getSource().getText();
            MessageToast.show("Action triggered: " + sText);
        },

        onLogout: function () {
            MessageToast.show("Logged Out Successfully");
            this.getOwnerComponent().getRouter().navTo("Login");
        }

    });

});

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller,
    UIComponent,
    JSONModel,
    MessageToast,
    MessageBox
) {
    "use strict";

    return Controller.extend("xyraweb.controller.EscalationManagerProfile", {

        onInit: function () {
            var oProfileData = {
                fullName: "David Lead",
                email: "security.lead@xyra.ai",
                phone: "+1 (555) 019-2834",
                department: "Enterprise Application Security",
                organization: "Forte Innovations Inc.",
                managerId: "EM001",
                persona: "Escalation Manager",
                role: "Security Team Lead / Manager",
                subdomain: "xyra.ai",
                accountStatus: "ACTIVE",
                lastLogin: "14-Aug-2026 17:45:12 UTC"
            };

            var oModel = new JSONModel(oProfileData);
            this.getView().setModel(oModel, "profileModel");
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("escManagerProfileToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
            }
        },

        onQueue: function () {
            UIComponent.getRouterFor(this).navTo("EscalationManager");
        },

        onHistory: function () {
            UIComponent.getRouterFor(this).navTo("EscalationManagerHistory");
        },

        onProfile: function () {
            // Already on Profile page
        },

        onSideNavItemSelect: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            if (sKey === "Queue") {
                this.onQueue();
            } else if (sKey === "History") {
                this.onHistory();
            } else if (sKey === "Profile") {
                this.onProfile();
            }
        },

        onSaveProfile: function () {
            var sName = this.byId("profFullNameEsc").getValue();
            var sEmail = this.byId("profEmailEsc").getValue();

            if (!sName || !sEmail) {
                MessageBox.error("Name and Email are required fields.");
                return;
            }

            MessageToast.show("Escalation Manager profile changes saved successfully!");
        },

        onResetProfile: function () {
            this.onInit();
            MessageToast.show("Profile details reset.");
        },

        onSavePassword: function () {
            var sCurrent = this.byId("profCurrentPassEsc").getValue();
            var sNew = this.byId("profNewPassEsc").getValue();
            var sConfirm = this.byId("profConfirmPassEsc").getValue();

            if (!sCurrent || !sNew || !sConfirm) {
                MessageBox.error("Please fill in all password fields.");
                return;
            }

            if (sNew !== sConfirm) {
                MessageBox.error("New password and confirm password do not match.");
                return;
            }

            if (sNew.length < 8) {
                MessageBox.error("Password must be at least 8 characters long.");
                return;
            }

            this.byId("profCurrentPassEsc").setValue("");
            this.byId("profNewPassEsc").setValue("");
            this.byId("profConfirmPassEsc").setValue("");

            MessageToast.show("Security password updated successfully!");
        },

        onBackToDashboard: function () {
            UIComponent.getRouterFor(this).navTo("EscalationManager");
        },

        onNotificationPress: function () {
            MessageToast.show("No new notifications.");
        },

        onLogout: function () {
            UIComponent.getRouterFor(this).navTo("Login");
        },

        onQuickAction: function () {
            MessageToast.show("Profile picture update feature enabled.");
        }

    });

});

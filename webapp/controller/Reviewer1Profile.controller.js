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

    return Controller.extend("xyraweb.controller.Reviewer1Profile", {

        onInit: function () {
            this._loadProfileData();
        },

        _loadProfileData: function () {
            var oData = {
                fullName: "John Basis",
                email: "basis.reviewer1@xyra.ai",
                phone: "+1 555-019-2834",
                department: "SAP Basis Team",
                organization: "XYRA Security & Compliance Operations",
                reviewerId: "REV1",
                employeeId: "EMP-88492",
                persona: "Reviewer 1",
                subdomain: "xyra.ai",
                accountStatus: "ACTIVE",
                lastLogin: "14-Aug-2026 09:15 IST"
            };

            this._initialProfileData = Object.assign({}, oData);
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "profileModel");
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("reviewerProfileToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
            }
        },

        onQueue: function () {
            UIComponent.getRouterFor(this).navTo("Reviewer1Queue");
        },

        onAnalysis: function () {
            UIComponent.getRouterFor(this).navTo("Reviewer1Analysis", { reportId: "REP-101" });
        },

        onHistory: function () {
            UIComponent.getRouterFor(this).navTo("Reviewer1History");
        },

        onProfile: function () {
            // Already on Profile page
        },

        onBackToDashboard: function () {
            UIComponent.getRouterFor(this).navTo("Reviewer1Queue");
        },

        onQuickAction: function () {
            MessageToast.show("Edit Profile Picture clicked.");
        },

        onNotificationPress: function () {
            MessageToast.show("No new notifications for Reviewer 1.");
        },

        onLogout: function () {
            UIComponent.getRouterFor(this).navTo("Login");
        },

        onSavePassword: function () {
            var sCurrentPass = this.byId("profCurrentPass") ? this.byId("profCurrentPass").getValue() : "";
            var sNewPass = this.byId("profNewPass") ? this.byId("profNewPass").getValue() : "";
            var sConfirmPass = this.byId("profConfirmPass") ? this.byId("profConfirmPass").getValue() : "";

            if (!sCurrentPass || sCurrentPass.trim() === "") {
                MessageBox.error("Please enter your current password.");
                return;
            }

            if (!sNewPass || sNewPass.trim() === "") {
                MessageBox.error("Please enter a new password.");
                return;
            }

            if (sNewPass.length < 8) {
                MessageBox.error("New password must be at least 8 characters long.");
                return;
            }

            if (sNewPass !== sConfirmPass) {
                MessageBox.error("New password and Confirm password do not match.");
                return;
            }

            // Clear inputs and display success message
            this.byId("profCurrentPass").setValue("");
            this.byId("profNewPass").setValue("");
            this.byId("profConfirmPass").setValue("");

            MessageToast.show("Password updated successfully.");
        },

        onSaveProfile: function () {
            var oModel = this.getView().getModel("profileModel");
            var sFullName = oModel.getProperty("/fullName");
            var sEmail = oModel.getProperty("/email");

            if (!sFullName || sFullName.trim() === "") {
                MessageBox.error("Full Name cannot be empty.");
                return;
            }

            if (!sEmail || sEmail.trim() === "") {
                MessageBox.error("Email Address cannot be empty.");
                return;
            }

            this._initialProfileData = Object.assign({}, oModel.getData());
            MessageToast.show("Reviewer 1 Profile changes saved successfully.");
        },

        onResetProfile: function () {
            if (this._initialProfileData) {
                var oModel = this.getView().getModel("profileModel");
                oModel.setData(Object.assign({}, this._initialProfileData));
                MessageToast.show("Profile fields reset to saved values.");
            }
        }

    });

});

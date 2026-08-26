sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "xyraweb/model/GlobalLoading"
], function (
    Controller,
    UIComponent,
    JSONModel,
    MessageToast,
    MessageBox,
    GlobalLoading
) {
    "use strict";

    return Controller.extend("xyraweb.controller.Reviewer2Profile", {

        onInit: function () {
            this._loadProfileData();
        },

        _loadProfileData: function () {
            var oData = {
                fullName: "Sarah Manager",
                email: "basis.manager@xyra.ai",
                phone: "+1 555-019-8821",
                department: "Security / Compliance",
                organization: "XYRA Security & Compliance Operations",
                reviewerId: "REV2",
                employeeId: "MGR-99021",
                persona: "Manager Exception Reviewer",
                subdomain: "xyra.ai",
                accountStatus: "ACTIVE",
                lastLogin: "14-Aug-2026 10:30 IST"
            };

            this._initialProfileData = Object.assign({}, oData);
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "profileModel");
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("reviewer2ProfileToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
            }
        },

        onQueue: function () {
            UIComponent.getRouterFor(this).navTo("Reviewer2Queue");
        },

        onAnalysis: function () {
            UIComponent.getRouterFor(this).navTo("Reviewer2DetailedReview", { reportId: "REP-102" });
        },

        onHistory: function () {
            UIComponent.getRouterFor(this).navTo("Reviewer2History");
        },

        onProfile: function () {
            // Already on Profile page
        },

        onBackToDashboard: function () {
            UIComponent.getRouterFor(this).navTo("Reviewer2Queue");
        },

        onQuickAction: function () {
            MessageToast.show("Edit Profile Picture clicked.");
        },

        onNotificationPress: function () {
            MessageToast.show("No new notifications for Reviewer 2.");
        },

        onLogout: function () {
            GlobalLoading.logout(this);
        },

        onSavePassword: function () {
            var sCurrentPass = this.byId("profCurrentPass2") ? this.byId("profCurrentPass2").getValue() : "";
            var sNewPass = this.byId("profNewPass2") ? this.byId("profNewPass2").getValue() : "";
            var sConfirmPass = this.byId("profConfirmPass2") ? this.byId("profConfirmPass2").getValue() : "";

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

            this.byId("profCurrentPass2").setValue("");
            this.byId("profNewPass2").setValue("");
            this.byId("profConfirmPass2").setValue("");

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
            MessageToast.show("Reviewer 2 Profile changes saved successfully.");
        },

        onResetProfile: function () {
            if (this._initialProfileData) {
                var d = this._initialProfileData;
                var oModel = this.getView().getModel("profileModel");
                if (oModel) {
                    oModel.setData(Object.assign({}, d));
                }
                if (this.byId("profFullName2")) { this.byId("profFullName2").setValue(d.fullName || ""); }
                if (this.byId("profEmail2")) { this.byId("profEmail2").setValue(d.email || ""); }
                if (this.byId("profPhone2")) { this.byId("profPhone2").setValue(d.phone || ""); }
                if (this.byId("profDepartment2")) { this.byId("profDepartment2").setValue(d.department || ""); }
                if (this.byId("profOrg2")) { this.byId("profOrg2").setValue(d.organization || ""); }
                MessageToast.show("Personal & Account details reset to original values.");
            } else {
                this._loadProfileData();
            }
        }

    });

});

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationPopover"
], function (
    Controller,
    UIComponent,
    JSONModel,
    MessageToast,
    MessageBox,
    GlobalLoading,
    NotificationPopover
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

            this._initialProfileData = Object.assign({}, oProfileData);
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

            if (this._initialProfileData) {
                this._initialProfileData.fullName = sName;
                this._initialProfileData.email = sEmail;
                this._initialProfileData.phone = this.byId("profPhoneEsc") ? this.byId("profPhoneEsc").getValue() : this._initialProfileData.phone;
                this._initialProfileData.department = this.byId("profDepartmentEsc") ? this.byId("profDepartmentEsc").getValue() : this._initialProfileData.department;
                this._initialProfileData.organization = this.byId("profOrgEsc") ? this.byId("profOrgEsc").getValue() : this._initialProfileData.organization;
            }

            MessageToast.show("Escalation Manager profile changes saved successfully!");
        },

        onResetProfile: function () {
            if (this._initialProfileData) {
                var oModel = this.getView().getModel("profileModel");
                if (oModel) {
                    oModel.setData(Object.assign({}, this._initialProfileData));
                }
                var d = this._initialProfileData;
                if (this.byId("profFullNameEsc")) { this.byId("profFullNameEsc").setValue(d.fullName || ""); }
                if (this.byId("profEmailEsc")) { this.byId("profEmailEsc").setValue(d.email || ""); }
                if (this.byId("profPhoneEsc")) { this.byId("profPhoneEsc").setValue(d.phone || ""); }
                if (this.byId("profDepartmentEsc")) { this.byId("profDepartmentEsc").setValue(d.department || ""); }
                if (this.byId("profOrgEsc")) { this.byId("profOrgEsc").setValue(d.organization || ""); }
            } else {
                this.onInit();
            }
            MessageToast.show("Personal & Account details reset to original values.");
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

        onNotificationPress: function (oEvent) {
            NotificationPopover.toggle(oEvent, this);
        },

        onLogout: function () {
            GlobalLoading.logout(this);
        },

        onQuickAction: function () {
            MessageToast.show("Profile picture update feature enabled.");
        }

    });

});

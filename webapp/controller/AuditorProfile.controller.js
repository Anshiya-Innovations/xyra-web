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

    return Controller.extend("xyraweb.controller.AuditorProfile", {

        onInit: function () {
            var oProfileData = {
                fullName: "Alex Auditor",
                email: "auditor@xyra.ai",
                phone: "+1 (555) 018-9943",
                department: "Internal Audit & Compliance Governance",
                organization: "Forte Innovations Inc.",
                auditorId: "AUD001",
                persona: "Internal Auditor",
                role: "Senior Internal Auditor & Compliance Specialist",
                subdomain: "xyra.ai",
                accountStatus: "ACTIVE",
                lastLogin: "17-Aug-2026 12:30:45 UTC"
            };

            this._initialProfileData = Object.assign({}, oProfileData);
            var oModel = new JSONModel(oProfileData);
            this.getView().setModel(oModel, "profileModel");
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("auditorProfileToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
            }
        },

        onAuditRecords: function () {
            UIComponent.getRouterFor(this).navTo("Auditor");
        },

        onAuditAnalysis: function () {
            UIComponent.getRouterFor(this).navTo("Auditor");
        },

        onRemediationReview: function () {
            UIComponent.getRouterFor(this).navTo("Auditor");
        },

        onAuditHistory: function () {
            UIComponent.getRouterFor(this).navTo("Auditor");
        },

        onProfile: function () {
            // Already on Profile page
        },

        onSideNavItemSelect: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            if (sKey === "Profile") {
                this.onProfile();
            } else {
                UIComponent.getRouterFor(this).navTo("Auditor");
            }
        },

        onSaveProfile: function () {
            var sName = this.byId("profFullNameAud").getValue();
            var sEmail = this.byId("profEmailAud").getValue();

            if (!sName || !sEmail) {
                MessageBox.error("Name and Email are required fields.");
                return;
            }

            if (this._initialProfileData) {
                this._initialProfileData.fullName = sName;
                this._initialProfileData.email = sEmail;
                this._initialProfileData.phone = this.byId("profPhoneAud") ? this.byId("profPhoneAud").getValue() : this._initialProfileData.phone;
                this._initialProfileData.department = this.byId("profDepartmentAud") ? this.byId("profDepartmentAud").getValue() : this._initialProfileData.department;
                this._initialProfileData.organization = this.byId("profOrgAud") ? this.byId("profOrgAud").getValue() : this._initialProfileData.organization;
            }

            MessageToast.show("Auditor profile changes saved successfully!");
        },

        onResetProfile: function () {
            if (this._initialProfileData) {
                var oModel = this.getView().getModel("profileModel");
                if (oModel) {
                    oModel.setData(Object.assign({}, this._initialProfileData));
                }
                var d = this._initialProfileData;
                if (this.byId("profFullNameAud")) { this.byId("profFullNameAud").setValue(d.fullName || ""); }
                if (this.byId("profEmailAud")) { this.byId("profEmailAud").setValue(d.email || ""); }
                if (this.byId("profPhoneAud")) { this.byId("profPhoneAud").setValue(d.phone || ""); }
                if (this.byId("profDepartmentAud")) { this.byId("profDepartmentAud").setValue(d.department || ""); }
                if (this.byId("profOrgAud")) { this.byId("profOrgAud").setValue(d.organization || ""); }
            } else {
                this.onInit();
            }
            MessageToast.show("Personal & Account details reset to original values.");
        },

        onSavePassword: function () {
            var sCurrent = this.byId("profCurrentPassAud").getValue();
            var sNew = this.byId("profNewPassAud").getValue();
            var sConfirm = this.byId("profConfirmPassAud").getValue();

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

            this.byId("profCurrentPassAud").setValue("");
            this.byId("profNewPassAud").setValue("");
            this.byId("profConfirmPassAud").setValue("");

            MessageToast.show("Security password updated successfully!");
        },

        onBackToDashboard: function () {
            UIComponent.getRouterFor(this).navTo("Auditor");
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

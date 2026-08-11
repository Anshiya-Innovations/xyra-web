sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "xyraweb/model/config",
    "xyraweb/model/session",
    "xyraweb/model/sidebarState"
], function (Controller, MessageToast, MessageBox, BusyIndicator, Config, Session, SidebarState) {
    "use strict";

    var ROLE_LABELS = {
        ADMIN: "Global Administrator",
        ESCALATION_MANAGER: "Escalation Manager",
        REVIEWER: "Reviewer",
        AUDITOR: "Auditor"
    };

    return Controller.extend("xyraweb.controller.Profile", {

        onInit: function () {
            this._loadProfile();
        },

        onAfterRendering: function () {
            var oToolPage = this.byId("profileToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(SidebarState.get());
            }
        },

        _loadProfile: function () {
            var oSession = Session.get();
            if (!oSession || !oSession.userId) {
                MessageBox.error("No active session. Please log in again.");
                this.getOwnerComponent().getRouter().navTo("Login");
                return;
            }

            BusyIndicator.show(0);

            fetch(Config.AUTH_BASE_URL + "/api/profile/getProfile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: oSession.subdomain, userId: oSession.userId })
            })
                .then(function (oResponse) { return oResponse.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();

                    if (!oData.success) {
                        MessageBox.error(oData.message || "Could not load profile.");
                        return;
                    }

                    if (this.byId("profFullName")) { this.byId("profFullName").setValue(oData.name || ""); }
                    if (this.byId("profEmail")) { this.byId("profEmail").setValue(oData.email || ""); }
                    if (this.byId("profPhone")) { this.byId("profPhone").setValue(oData.phone || ""); }
                    if (this.byId("profDepartment")) { this.byId("profDepartment").setValue(oData.department || ""); }
                    if (this.byId("profOrg")) { this.byId("profOrg").setValue(oData.organization || ""); }
                    if (this.byId("profAdminId")) { this.byId("profAdminId").setValue((oData.id || "").slice(0, 8).toUpperCase()); }
                    if (this.byId("profPersona")) { this.byId("profPersona").setValue(ROLE_LABELS[oData.role] || oData.role || ""); }
                    if (this.byId("profSubdomain")) { this.byId("profSubdomain").setValue(oSession.subdomain || ""); }
                }.bind(this))
                .catch(function () {
                    BusyIndicator.hide();
                    MessageBox.error("Could not reach the server. Is xyra-core running?");
                });
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("profileToolPage");
            if (oToolPage) {
                var bExpanded = !oToolPage.getSideExpanded();
                oToolPage.setSideExpanded(bExpanded);
                SidebarState.save(bExpanded);
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

            var oSession = Session.get();
            if (!oSession) {
                MessageBox.error("No active session. Please log in again.");
                return;
            }

            BusyIndicator.show(0);

            fetch(Config.AUTH_BASE_URL + "/api/profile/changePassword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subdomain: oSession.subdomain,
                    userId: oSession.userId,
                    currentPassword: sCurrent,
                    newPassword: sNew
                })
            })
                .then(function (oResponse) { return oResponse.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();

                    if (!oData.success) {
                        MessageToast.show(oData.message || "Could not change password.");
                        return;
                    }

                    MessageToast.show("Password updated successfully!");
                    if (oCurrentPass) { oCurrentPass.setValue(""); }
                    if (oNewPass) { oNewPass.setValue(""); }
                    if (oConfirmPass) { oConfirmPass.setValue(""); }
                })
                .catch(function () {
                    BusyIndicator.hide();
                    MessageToast.show("Could not reach the server. Is xyra-core running?");
                });
        },

        onSaveProfile: function () {
            var oSession = Session.get();
            if (!oSession) {
                MessageBox.error("No active session. Please log in again.");
                return;
            }

            var sName = this.byId("profFullName") ? this.byId("profFullName").getValue().trim() : "";
            if (!sName) {
                MessageToast.show("Full Name is required.");
                return;
            }

            BusyIndicator.show(0);

            fetch(Config.AUTH_BASE_URL + "/api/profile/updateProfile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subdomain: oSession.subdomain,
                    userId: oSession.userId,
                    name: sName,
                    phone: this.byId("profPhone") ? this.byId("profPhone").getValue() : "",
                    department: this.byId("profDepartment") ? this.byId("profDepartment").getValue() : "",
                    organization: this.byId("profOrg") ? this.byId("profOrg").getValue() : ""
                })
            })
                .then(function (oResponse) { return oResponse.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();

                    if (!oData.success) {
                        MessageToast.show(oData.message || "Could not save profile.");
                        return;
                    }

                    MessageToast.show("Personal & Account details saved successfully.");
                }.bind(this))
                .catch(function () {
                    BusyIndicator.hide();
                    MessageToast.show("Could not reach the server. Is xyra-core running?");
                });
        },

        onResetProfile: function () {
            var aPasswordIds = ["profCurrentPass", "profNewPass", "profConfirmPass"];
            aPasswordIds.forEach(function (sId) {
                var oInput = this.byId(sId);
                if (oInput) {
                    oInput.setValue("");
                }
            }.bind(this));
            this._loadProfile();
            MessageToast.show("Changes discarded — reloaded from server.");
        },

        onNotificationPress: function () {
            MessageToast.show("System Notifications: Account operational.");
        },

        onQuickAction: function (oEvent) {
            var sText = oEvent.getSource().getText();
            MessageToast.show("Action triggered: " + sText);
        },

        onLogout: function () {
            Session.clear();
            MessageToast.show("Logged Out Successfully");
            this.getOwnerComponent().getRouter().navTo("Login");
        }

    });

});

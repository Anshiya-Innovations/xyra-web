sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "xyraweb/model/config",
    "xyraweb/model/sidebarState"
], function (Controller, MessageToast, MessageBox, JSONModel, BusyIndicator, Config, SidebarState) {
    "use strict";

    var PERSONA_TO_ROLE = {
        "Escalation Manager": "ESCALATION_MANAGER",
        "Reviewer 1": "REVIEWER",
        "Reviewer 2": "REVIEWER",
        "Auditor": "AUDITOR"
    };

    var ROLE_TO_PERSONA = {
        ADMIN: "Admin",
        ESCALATION_MANAGER: "Escalation Manager",
        REVIEWER: "Reviewer",
        AUDITOR: "Auditor"
    };

    return Controller.extend("xyraweb.controller.AccessManagement", {

        onInit: function () {
            this.getView().setModel(new JSONModel({ users: [], busy: false }), "userModel");
            this._loadUsers();
        },

        onAfterRendering: function () {
            var oToolPage = this.byId("accessToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(SidebarState.get());
            }
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("accessToolPage");
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

        onDeviationReport: function () {
            this.getOwnerComponent().getRouter().navTo("DeviationReport");
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

        onLogout: function () {
            MessageToast.show("Logged Out Successfully");
            this.getOwnerComponent().getRouter().navTo("Login");
        },

        _loadUsers: function () {
            var oModel = this.getView().getModel("userModel");
            oModel.setProperty("/busy", true);

            return fetch(Config.AUTH_BASE_URL + "/api/admin/listUsers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: Config.TEST_SUBDOMAIN })
            })
                .then(function (oResponse) { return oResponse.json(); })
                .then(function (oData) {
                    var aUsers = (oData.value || []).map(function (oUser) {
                        return {
                            id: oUser.id,
                            userId: oUser.id,
                            name: oUser.name,
                            email: oUser.email,
                            persona: ROLE_TO_PERSONA[oUser.role] || oUser.role,
                            role: oUser.role,
                            status: oUser.status,
                            createdDate: (oUser.createdAt || "").slice(0, 10)
                        };
                    });
                    oModel.setProperty("/users", aUsers);
                })
                .catch(function () {
                    MessageBox.error("Could not reach the server. Is xyra-core running?");
                })
                .finally(function () {
                    oModel.setProperty("/busy", false);
                });
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("Admin");
        },

        onOpenCreateUserDialog: function () {
            var oNameInput = this.byId("createNameInput");
            var oEmailInput = this.byId("createEmailInput");
            var oPasswordInput = this.byId("createPasswordInput");
            var oPersonaSelect = this.byId("createPersonaSelect");
            if (oNameInput) { oNameInput.setValue(""); }
            if (oEmailInput) { oEmailInput.setValue(""); }
            if (oPasswordInput) { oPasswordInput.setValue(""); }
            if (oPersonaSelect) { oPersonaSelect.setSelectedKey(""); }

            var oDialog = this.byId("createUserDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseCreateUserDialog: function () {
            var oDialog = this.byId("createUserDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onSubmitCreateUser: function () {
            var oNameInput = this.byId("createNameInput");
            var oEmailInput = this.byId("createEmailInput");
            var oPasswordInput = this.byId("createPasswordInput");
            var oPersonaSelect = this.byId("createPersonaSelect");

            var sName = oNameInput ? oNameInput.getValue().trim() : "";
            var sEmail = oEmailInput ? oEmailInput.getValue().trim() : "";
            var sPassword = oPasswordInput ? oPasswordInput.getValue().trim() : "";
            var sPersona = oPersonaSelect ? oPersonaSelect.getSelectedKey() : "";

            if (!sName || !sEmail || !sPassword || !sPersona) {
                MessageBox.error("Please fill in Name, Email, Password, and select a Persona.");
                return;
            }

            var sRoleCode = PERSONA_TO_ROLE[sPersona];
            if (!sRoleCode) {
                MessageBox.error("Admin role creation is restricted.");
                return;
            }

            BusyIndicator.show(0);

            fetch(Config.AUTH_BASE_URL + "/api/admin/createUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subdomain: Config.TEST_SUBDOMAIN,
                    name: sName,
                    email: sEmail,
                    password: sPassword,
                    roleCode: sRoleCode
                })
            })
                .then(function (oResponse) { return oResponse.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();

                    if (!oData.success) {
                        MessageBox.error(oData.message || "Could not create user.");
                        return;
                    }

                    if (oNameInput) { oNameInput.setValue(""); }
                    if (oEmailInput) { oEmailInput.setValue(""); }
                    if (oPasswordInput) { oPasswordInput.setValue(""); }
                    if (oPersonaSelect) { oPersonaSelect.setSelectedKey(""); }

                    MessageToast.show("User provisioned successfully: " + sEmail + " as " + sPersona);
                    this.onCloseCreateUserDialog();
                    this._loadUsers();
                }.bind(this))
                .catch(function () {
                    BusyIndicator.hide();
                    MessageBox.error("Could not reach the server. Is xyra-core running?");
                });
        },

        onRowResetPassword: function (oEvent) {
            var oItem = oEvent.getSource().getParent().getParent();
            var oContext = oItem.getBindingContext("userModel");
            var sEmail = oContext ? oContext.getProperty("email") : "";
            var sUserId = oContext ? oContext.getProperty("userId") : "";
            this._openResetDialog(sEmail, sUserId);
        },

        onRowRemoveUser: function (oEvent) {
            var oItem = oEvent.getSource().getParent().getParent();
            var oContext = oItem.getBindingContext("userModel");
            var sEmail = oContext ? oContext.getProperty("email") : "";
            var sUserId = oContext ? oContext.getProperty("userId") : "";

            MessageBox.confirm("Are you sure you want to remove user access for " + sEmail + "?", {
                title: "Confirm Removal",
                onClose: function (oAction) {
                    if (oAction !== MessageBox.Action.OK) {
                        return;
                    }

                    BusyIndicator.show(0);

                    fetch(Config.AUTH_BASE_URL + "/api/admin/removeUser", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ subdomain: Config.TEST_SUBDOMAIN, userId: sUserId })
                    })
                        .then(function (oResponse) { return oResponse.json(); })
                        .then(function (oData) {
                            BusyIndicator.hide();

                            if (!oData.success) {
                                MessageBox.error(oData.message || "Could not remove user.");
                                return;
                            }

                            MessageToast.show("User access removed for " + sEmail);
                            this._loadUsers();
                        }.bind(this))
                        .catch(function () {
                            BusyIndicator.hide();
                            MessageBox.error("Could not reach the server. Is xyra-core running?");
                        });
                }.bind(this)
            });
        },

        _openResetDialog: function (sEmail, sUserId) {
            var oDialog = this.byId("resetPasswordDialog");
            var oText = this.byId("resetUserEmailText");
            if (oText) {
                oText.setText(sEmail);
            }
            this._sResetUserId = sUserId;
            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseResetPasswordDialog: function () {
            var oDialog = this.byId("resetPasswordDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onSubmitResetPassword: function () {
            var oNewPass = this.byId("newPasswordInput");
            var oConfPass = this.byId("confirmPasswordInput");

            var sNew = oNewPass ? oNewPass.getValue() : "";
            var sConf = oConfPass ? oConfPass.getValue() : "";

            if (!sNew || !sConf) {
                MessageBox.error("Please enter and confirm the new password.");
                return;
            }

            if (sNew !== sConf) {
                MessageBox.error("Passwords do not match.");
                return;
            }

            var oText = this.byId("resetUserEmailText");
            var sEmail = oText ? oText.getText() : "User";
            var sUserId = this._sResetUserId;

            BusyIndicator.show(0);

            fetch(Config.AUTH_BASE_URL + "/api/admin/resetPassword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: Config.TEST_SUBDOMAIN, userId: sUserId, newPassword: sNew })
            })
                .then(function (oResponse) { return oResponse.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();

                    if (!oData.success) {
                        MessageBox.error(oData.message || "Could not reset password.");
                        return;
                    }

                    MessageToast.show("Password successfully reset for " + sEmail);

                    if (oNewPass) { oNewPass.setValue(""); }
                    if (oConfPass) { oConfPass.setValue(""); }

                    this.onCloseResetPasswordDialog();
                }.bind(this))
                .catch(function () {
                    BusyIndicator.hide();
                    MessageBox.error("Could not reach the server. Is xyra-core running?");
                });
        }

    });

});

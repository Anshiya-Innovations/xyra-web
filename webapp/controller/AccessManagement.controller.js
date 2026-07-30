sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("xyraweb.controller.AccessManagement", {

        onInit: function () {
            var oData = {
                users: [
                    { userId: "USR001", email: "manager@xyra.ai", persona: "Escalation Manager", status: "Active", createdDate: "2026-07-28" },
                    { userId: "USR002", email: "reviewer1@xyra.ai", persona: "Reviewer 1", status: "Active", createdDate: "2026-07-29" },
                    { userId: "USR003", email: "reviewer2@xyra.ai", persona: "Reviewer 2", status: "Active", createdDate: "2026-07-29" },
                    { userId: "USR004", email: "auditor@xyra.ai", persona: "Auditor", status: "Active", createdDate: "2026-07-30" }
                ]
            };
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "userModel");
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("Admin");
        },

        onOpenCreateUserDialog: function () {
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
            var oEmailInput = this.byId("createEmailInput");
            var oPasswordInput = this.byId("createPasswordInput");
            var oPersonaSelect = this.byId("createPersonaSelect");

            var sEmail = oEmailInput ? oEmailInput.getValue().trim() : "";
            var sPassword = oPasswordInput ? oPasswordInput.getValue().trim() : "";
            var sPersona = oPersonaSelect ? oPersonaSelect.getSelectedKey() : "";

            if (!sEmail || !sPassword || !sPersona) {
                MessageBox.error("Please fill in User Email, Password, and select a Persona.");
                return;
            }

            if (sPersona === "Admin") {
                MessageBox.error("Admin role creation is restricted.");
                return;
            }

            var oModel = this.getView().getModel("userModel");
            var aUsers = oModel.getProperty("/users");
            var sNewId = "USR00" + (aUsers.length + 1);

            aUsers.push({
                userId: sNewId,
                email: sEmail,
                persona: sPersona,
                status: "Active",
                createdDate: new Date().toISOString().slice(0, 10)
            });

            oModel.setProperty("/users", aUsers);

            if (oEmailInput) { oEmailInput.setValue(""); }
            if (oPasswordInput) { oPasswordInput.setValue(""); }
            if (oPersonaSelect) { oPersonaSelect.setSelectedKey(""); }

            MessageToast.show("User provisioned successfully: " + sEmail + " as " + sPersona);
            this.onCloseCreateUserDialog();
        },

        onRowResetPassword: function (oEvent) {
            var oItem = oEvent.getSource().getParent().getParent();
            var oContext = oItem.getBindingContext("userModel");
            var sEmail = oContext ? oContext.getProperty("email") : "user@xyra.ai";
            this._openResetDialog(sEmail);
        },

        onRowRemoveUser: function (oEvent) {
            var oItem = oEvent.getSource().getParent().getParent();
            var oContext = oItem.getBindingContext("userModel");
            var sPath = oContext.getPath();
            var sEmail = oContext ? oContext.getProperty("email") : "user@xyra.ai";
            var oModel = this.getView().getModel("userModel");

            MessageBox.confirm("Are you sure you want to remove user access for " + sEmail + "?", {
                title: "Confirm Removal",
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        var aUsers = oModel.getProperty("/users");
                        var iIndex = parseInt(sPath.split("/").pop(), 10);
                        if (iIndex >= 0 && iIndex < aUsers.length) {
                            aUsers.splice(iIndex, 1);
                            oModel.setProperty("/users", aUsers);
                            MessageToast.show("User access removed for " + sEmail);
                        }
                    }
                }
            });
        },

        _openResetDialog: function (sEmail) {
            var oDialog = this.byId("resetPasswordDialog");
            var oText = this.byId("resetUserEmailText");
            if (oText) {
                oText.setText(sEmail);
            }
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

            MessageToast.show("Password successfully reset for " + sEmail);

            if (oNewPass) { oNewPass.setValue(""); }
            if (oConfPass) { oConfPass.setValue(""); }

            this.onCloseResetPasswordDialog();
        }

    });

});

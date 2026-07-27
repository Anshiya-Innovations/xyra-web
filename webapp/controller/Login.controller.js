sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/ValueState"
], function (
    Controller,
    UIComponent,
    MessageBox,
    BusyIndicator,
    ValueState
) {
    "use strict";

    return Controller.extend("xyraweb.controller.Login", {

        onInit: function () {

        },

        onLogin: function () {

            var oRole = this.byId("role");
            var oUser = this.byId("username");
            var oPass = this.byId("password");

            var sRole = oRole.getSelectedKey();
            var sUser = oUser.getValue().trim();
            var sPass = oPass.getValue().trim();

            // Reset Value States
            oUser.setValueState(ValueState.None);
            oPass.setValueState(ValueState.None);

            // Validation
            if (!sRole) {
                MessageBox.error("Please select your role.");
                return;
            }

            if (!sUser) {
                oUser.setValueState(ValueState.Error);
                oUser.setValueStateText("Username is required");
                MessageBox.error("Please enter your username.");
                return;
            }

            if (!sPass) {
                oPass.setValueState(ValueState.Error);
                oPass.setValueStateText("Password is required");
                MessageBox.error("Please enter your password.");
                return;
            }
            if (sRole === "ADMIN") {
            UIComponent.getRouterFor(this).navTo("Admin");
            }
    

            BusyIndicator.show(0);

            // Simulate Login
            setTimeout(function () {

                BusyIndicator.hide();

                var oRouter = UIComponent.getRouterFor(this);

                switch (sRole) {

                    case "ADMIN":
                        oRouter.navTo("Admin");
                        break;

                    case "ACM":
                        oRouter.navTo("EXCollectionManager");
                        break;

                    case "REV1":
                        oRouter.navTo("Reviewer1");
                        break;

                    case "REV2":
                        oRouter.navTo("Reviewer2");
                        break;

                    case "FF":
                        oRouter.navTo("Firefighter");
                        break;

                    case "AUDITOR":
                        oRouter.navTo("Auditor");
                        break;

                    default:
                        MessageBox.error("Invalid role selected.");
                }

            }.bind(this), 1000);

        },

        onLiveChange: function (oEvent) {

            oEvent.getSource().setValueState(ValueState.None);

        }

    });

});
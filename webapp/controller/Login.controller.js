sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/library",
    "xyraweb/model/config",
    "xyraweb/model/session",
    "xyraweb/model/focusRing"
], function (
    Controller,
    UIComponent,
    MessageBox,
    BusyIndicator,
    coreLibrary,
    Config,
    Session,
    killFocusRing
) {
    "use strict";

    var ValueState = coreLibrary.ValueState;

    // Maps each dropdown selection to what a successful login response must look
    // like for that selection to be accepted. Role alone tells ADMIN / ACM /
    // AUDITOR apart (one account each); REV1 vs REV2 share the same REVIEWER role,
    // so those two also require an exact email match to tell them apart.
    var ROLE_EXPECTATIONS = {
        ADMIN: { role: "ADMIN" },
        ACM: { role: "ESCALATION_MANAGER" },
        AUDITOR: { role: "AUDITOR" },
        REV1: { role: "REVIEWER", email: "reviewer1@xyrademo.test" },
        REV2: { role: "REVIEWER", email: "reviewer2@xyrademo.test" }
    };

    var ROUTE_FOR_ROLE = {
        ADMIN: "Admin",
        ACM: "EscalationManager",
        REV1: "Reviewer1",
        REV2: "Reviewer2",
        AUDITOR: "Auditor"
    };

    // .trim() only strips actual whitespace — zero-width characters (U+200B etc.)
    // are Unicode "format" characters, not whitespace, so they survive it silently.
    // Real-world case: copy-pasting a password out of a rendered markdown table
    // brought one along invisibly, and the login kept failing with no visible cause.
    function stripInvisible(sValue) {
        return sValue.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "").trim();
    }

    return Controller.extend("xyraweb.controller.Login", {

        onInit: function () {

        },

        onAfterRendering: function () {
            killFocusRing(this.getView());
        },

        onRoleChange: function (oEvent) {
            var oItem = oEvent.getParameter("selectedItem");
            if (!oItem) { return; }
            var sRole = oItem.getKey();
            var oUser = this.byId("username");
            var oPass = this.byId("password");

            var mDefaults = {
                ADMIN: { email: "admin@xyrademo.test", pass: "Password@123" },
                ACM: { email: "manager@xyrademo.test", pass: "Password@123" },
                REV1: { email: "reviewer1@xyrademo.test", pass: "Password@123" },
                REV2: { email: "reviewer2@xyrademo.test", pass: "Password@123" },
                AUDITOR: { email: "auditor@xyrademo.test", pass: "Password@123" }
            };

            if (mDefaults[sRole]) {
                if (oUser) { oUser.setValue(mDefaults[sRole].email); oUser.setValueState(ValueState.None); }
                if (oPass) { oPass.setValue(mDefaults[sRole].pass); oPass.setValueState(ValueState.None); }
            }
        },

        onLogin: function () {

            var oRole = this.byId("role");
            var oUser = this.byId("username");
            var oPass = this.byId("password");

            var sRole = oRole.getSelectedKey();
            var sEmail = stripInvisible(oUser.getValue());
            var sPass = stripInvisible(oPass.getValue());

            // Reset Value States
            oUser.setValueState(ValueState.None);
            oPass.setValueState(ValueState.None);

            // Validation
            if (!sRole) {
                MessageBox.error("Please select your persona.");
                return;
            }

            if (!sEmail) {
                oUser.setValueState(ValueState.Error);
                oUser.setValueStateText("Email is required");
                MessageBox.error("Please enter your email.");
                return;
            }

            if (!sPass) {
                oPass.setValueState(ValueState.Error);
                oPass.setValueStateText("Password is required");
                MessageBox.error("Please enter your password.");
                return;
            }

            BusyIndicator.show(0);

            var sTargetRoute = ROUTE_FOR_ROLE[sRole] || "Admin";

            fetch(Config.AUTH_BASE_URL + "/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: Config.TEST_SUBDOMAIN, email: sEmail, password: sPass })
            })
                .then(function (oResponse) { return oResponse.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();

                    if (!oData.success) {
                        Session.save({
                            userId: "demo-" + sRole.toLowerCase(),
                            tenantId: "demo-tenant",
                            subdomain: Config.TEST_SUBDOMAIN,
                            role: sRole,
                            name: sRole + " User",
                            email: sEmail
                        });
                        UIComponent.getRouterFor(this).navTo(sTargetRoute);
                        return;
                    }

                    var oExpected = ROLE_EXPECTATIONS[sRole];
                    var bRoleMatches = oExpected && oData.role === oExpected.role;
                    var bEmailMatches = !oExpected || !oExpected.email || oData.email === oExpected.email;

                    if (!bRoleMatches || !bEmailMatches) {
                        Session.save({
                            userId: "demo-" + sRole.toLowerCase(),
                            tenantId: "demo-tenant",
                            subdomain: Config.TEST_SUBDOMAIN,
                            role: sRole,
                            name: sRole + " User",
                            email: sEmail
                        });
                        UIComponent.getRouterFor(this).navTo(sTargetRoute);
                        return;
                    }

                    Session.save({
                        userId: oData.userId,
                        tenantId: oData.tenantId,
                        subdomain: Config.TEST_SUBDOMAIN,
                        role: oData.role,
                        name: oData.name,
                        email: oData.email
                    });

                    UIComponent.getRouterFor(this).navTo(sTargetRoute);
                }.bind(this))
                .catch(function () {
                    BusyIndicator.hide();
                    Session.save({
                        userId: "demo-" + sRole.toLowerCase(),
                        tenantId: "demo-tenant",
                        subdomain: Config.TEST_SUBDOMAIN,
                        role: sRole,
                        name: sRole + " User",
                        email: sEmail
                    });
                    UIComponent.getRouterFor(this).navTo(sTargetRoute);
                }.bind(this));

        },

        onLiveChange: function (oEvent) {

            oEvent.getSource().setValueState(ValueState.None);

        },

        onEmailLiveChange: function (oEvent) {
            var oInput = oEvent.getSource();
            oInput.setValueState(ValueState.None);

            var sValue = oEvent.getParameter("value") || oInput.getValue() || "";
            var sLower = sValue.toLowerCase();

            if (sValue !== sLower) {
                var oDomRef = oInput.getDomRef("inner") || oInput.getFocusDomRef();
                var iStart = oDomRef ? oDomRef.selectionStart : null;
                var iEnd = oDomRef ? oDomRef.selectionEnd : null;

                oInput.setValue(sLower);

                if (oDomRef && iStart !== null && iEnd !== null) {
                    setTimeout(function () {
                        try {
                            oDomRef.setSelectionRange(iStart, iEnd);
                        } catch (e) {
                            // ignore setSelectionRange errors on unmapped input types
                        }
                    }, 0);
                }
            }
        }

    });

});

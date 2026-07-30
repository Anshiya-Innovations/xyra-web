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

    // xyra-core runs as its own separate server/module — not bundled with this
    // UI5 app — so this is a plain cross-origin fetch() call, not an OData model
    // binding. Point this at wherever `cds watch` is actually serving xyra-core.
    var AUTH_BASE_URL = "http://localhost:4004";

    // ponytail: hardcoded to the one fixed test tenant for now — there's no
    // Host-header-based Tenant Resolver yet, so the frontend can't discover the
    // subdomain any other way. Replace with real tenant resolution once that
    // exists (e.g. reading it from the browser's own hostname).
    var TEST_SUBDOMAIN = "xyrademo";

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
                MessageBox.error("Please select your role.");
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

            fetch(AUTH_BASE_URL + "/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: TEST_SUBDOMAIN, email: sEmail, password: sPass })
            })
                .then(function (oResponse) { return oResponse.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();

                    if (!oData.success) {
                        MessageBox.error(oData.message || "Login failed.");
                        return;
                    }

                    var oExpected = ROLE_EXPECTATIONS[sRole];
                    var bRoleMatches = oExpected && oData.role === oExpected.role;
                    var bEmailMatches = !oExpected || !oExpected.email || oData.email === oExpected.email;

                    if (!bRoleMatches || !bEmailMatches) {
                        MessageBox.error("This account does not match the selected role.");
                        return;
                    }

                    UIComponent.getRouterFor(this).navTo(ROUTE_FOR_ROLE[sRole]);
                }.bind(this))
                .catch(function () {
                    BusyIndicator.hide();
                    MessageBox.error("Could not reach the server. Is xyra-core running?");
                });

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

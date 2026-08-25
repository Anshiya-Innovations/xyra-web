sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/library",
    "xyraweb/model/config",
    "xyraweb/model/session",
    "xyraweb/model/focusRing",
    "xyraweb/model/GlobalLoading"
], function (
    Controller,
    UIComponent,
    MessageBox,
    BusyIndicator,
    coreLibrary,
    Config,
    Session,
    killFocusRing,
    GlobalLoading
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

    // Demo-account emails, auto-filled per persona so the dropdown stays a
    // quick way to try each role without memorizing addresses.
    var DEMO_EMAIL_FOR_ROLE = {
        ADMIN: "admin@xyrademo.test",
        ACM: "manager@xyrademo.test",
        REV1: "reviewer1@xyrademo.test",
        REV2: "reviewer2@xyrademo.test",
        AUDITOR: "auditor@xyrademo.test"
    };

    // .trim() only strips actual whitespace — zero-width characters (U+200B etc.)
    // are Unicode "format" characters, not whitespace, so they survive it silently.
    // Real-world case: copy-pasting an email out of a rendered markdown table
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

            if (DEMO_EMAIL_FOR_ROLE[sRole] && oUser) {
                oUser.setValue(DEMO_EMAIL_FOR_ROLE[sRole]);
                oUser.setValueState(ValueState.None);
            }
        },

        // Email-only login, pending SSO integration — no password field at all.
        // The backend is the actual gate: this only navigates on a real
        // success from AuthService.login (an active user with this email in
        // this tenant), it doesn't let anyone through on a failed/unreachable
        // request the way an earlier "demo fallback" version of this used to.
        onLogin: function () {

            var oRole = this.byId("role");
            var oUser = this.byId("username");

            var sRole = oRole.getSelectedKey();
            var sEmail = stripInvisible(oUser.getValue());

            oUser.setValueState(ValueState.None);

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

            GlobalLoading.show("Signing in...", 3000, true);

            var sTargetRoute = ROUTE_FOR_ROLE[sRole] || "Admin";

            fetch(Config.AUTH_BASE_URL + "/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: Config.TEST_SUBDOMAIN, email: sEmail })
            })
                .then(function (oResponse) { return oResponse.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();

                    if (!oData.success) {
                        oUser.setValueState(ValueState.Error);
                        oUser.setValueStateText(oData.message || "Email not found.");
                        MessageBox.error(oData.message || "Could not sign in with that email.");
                        return;
                    }

                    var oExpected = ROLE_EXPECTATIONS[sRole];
                    var bRoleMatches = oExpected && oData.role === oExpected.role;
                    var bEmailMatches = !oExpected || !oExpected.email || oData.email === oExpected.email;

                    if (!bRoleMatches || !bEmailMatches) {
                        MessageBox.error("This email doesn't match the selected persona.");
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

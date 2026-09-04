sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/library",
    "xyraweb/model/config",
    "xyraweb/model/session",
    "xyraweb/model/focusRing",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/mockData"
], function (
    Controller,
    UIComponent,
    MessageBox,
    MessageToast,
    BusyIndicator,
    coreLibrary,
    Config,
    Session,
    killFocusRing,
    GlobalLoading,
    MockData
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
        ACM: "escalationmanager@xyrademo.test",
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
            this._iCurrentSlide = 1;
            this._startSlideTimer();
        },

        onAfterRendering: function () {
            killFocusRing(this.getView());
            if (!this._iSlideInterval) {
                this._startSlideTimer();
            }
            this._bindIndicatorEvents();
        },

        _bindIndicatorEvents: function () {
            var bar1 = document.getElementById("xyraHeroBar1");
            var bar2 = document.getElementById("xyraHeroBar2");
            var bar3 = document.getElementById("xyraHeroBar3");
            if (bar1) {
                bar1.onclick = function () {
                    this.onSlideSelect(1);
                }.bind(this);
            }
            if (bar2) {
                bar2.onclick = function () {
                    this.onSlideSelect(2);
                }.bind(this);
            }
            if (bar3) {
                bar3.onclick = function () {
                    this.onSlideSelect(3);
                }.bind(this);
            }
        },

        onExit: function () {
            this._stopSlideTimer();
        },

        _startSlideTimer: function () {
            this._stopSlideTimer();
            this._iSlideInterval = setInterval(function () {
                this._toggleSlide();
            }.bind(this), 5000);
        },

        _stopSlideTimer: function () {
            if (this._iSlideInterval) {
                clearInterval(this._iSlideInterval);
                this._iSlideInterval = null;
            }
        },

        _toggleSlide: function () {
            var iNext = (this._iCurrentSlide % 3) + 1;
            this._goToSlide(iNext);
        },

        _goToSlide: function (iIndex) {
            this._iCurrentSlide = iIndex;
            var aSlides = [
                this.byId("xyraSlide1"),
                this.byId("xyraSlide2"),
                this.byId("xyraSlide3")
            ];
            var aBars = [
                document.getElementById("xyraHeroBar1"),
                document.getElementById("xyraHeroBar2"),
                document.getElementById("xyraHeroBar3")
            ];

            for (var i = 0; i < 3; i++) {
                var iSlideNum = i + 1;
                if (aSlides[i]) {
                    if (iSlideNum === iIndex) {
                        aSlides[i].addStyleClass("xyraHeroSlideActive");
                    } else {
                        aSlides[i].removeStyleClass("xyraHeroSlideActive");
                    }
                }
                if (aBars[i]) {
                    if (iSlideNum === iIndex) {
                        aBars[i].className = "xyraHeroBar xyraHeroBarActive";
                    } else {
                        aBars[i].className = "xyraHeroBar";
                    }
                }
            }
        },

        onSlideSelect: function (iIndex) {
            this._goToSlide(iIndex);
            this._startSlideTimer();
        },

        onSlideSelect1: function () {
            this.onSlideSelect(1);
        },

        onSlideSelect2: function () {
            this.onSlideSelect(2);
        },

        onSlideSelect3: function () {
            this.onSlideSelect(3);
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
        // When xyra-core actually responds, it's the real gate: this only
        // navigates on a genuine success from AuthService.login (an active user
        // with this email in this tenant). Only when the request can't reach the
        // server at all (xyra-core not running) does it fall back to a dummy
        // session for the selected persona, same "offline" pattern as
        // Configuration's MockData fallback — see onLogin's .catch below.
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

                    this._stopSlideTimer();
                    UIComponent.getRouterFor(this).navTo(sTargetRoute);
                }.bind(this))
                .catch(function () {
                    BusyIndicator.hide();

                    // xyra-core is unreachable, not just rejecting the login -
                    // let the selected persona in anyway, backed by the same
                    // dummy fixtures Configuration.controller.js falls back to,
                    // so the rest of the app has something to show.
                    var oExpected = ROLE_EXPECTATIONS[sRole];
                    var oMockUser = MockData.users.filter(function (oCandidate) {
                        return oExpected && oCandidate.role === oExpected.role &&
                            (!oExpected.email || oCandidate.email === oExpected.email);
                    })[0];

                    if (!oMockUser) {
                        MessageBox.error("Could not reach the server, and no dummy data is available for that persona.");
                        return;
                    }

                    MockData.notice(MessageToast);

                    Session.save({
                        userId: oMockUser.id,
                        tenantId: null,
                        subdomain: Config.TEST_SUBDOMAIN,
                        role: oMockUser.role,
                        name: oMockUser.name,
                        email: oMockUser.email
                    });

                    this._stopSlideTimer();
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

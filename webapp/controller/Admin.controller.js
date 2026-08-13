sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "xyraweb/model/sidebarState",
    "xyraweb/model/focusRing"
], function (Controller, MessageToast, UIComponent, JSONModel, SidebarState, killFocusRing) {
    "use strict";

    return Controller.extend("xyraweb.controller.Admin", {

        onInit: function () {
            // ponytail: mock data, same as the KPI numbers already hardcoded
            // elsewhere on this page — no live wiring was asked for here.
            // Control IDs match ones already used on Control Management.
            var oFindings = {
                findings: [
                    {
                        finding: "Segregation of Duties conflict — SOD_ADMIN role",
                        control: "XYRA-01",
                        status: "Open",
                        statusState: "Error",
                        severity: "High",
                        severityState: "Error",
                        detected: "Aug 10, 2026"
                    },
                    {
                        finding: "Excessive access granted — Finance module",
                        control: "XYRA-002",
                        status: "In Progress",
                        statusState: "Warning",
                        severity: "Medium",
                        severityState: "Warning",
                        detected: "Aug 09, 2026"
                    },
                    {
                        finding: "Missing approval workflow evidence",
                        control: "XYRA-08",
                        status: "Resolved",
                        statusState: "Success",
                        severity: "Low",
                        severityState: "Success",
                        detected: "Aug 05, 2026"
                    }
                ]
            };
            this.getView().setModel(new JSONModel(oFindings), "findingsModel");

            // Backs the two VizFrame charts — same mock-data scope as the
            // findings/KPI numbers above, not wired to a live source.
            this.getView().setModel(new JSONModel({
                data: [
                    { week: "Apr 14", score: 82 },
                    { week: "Apr 21", score: 84 },
                    { week: "Apr 28", score: 83 },
                    { week: "May 5", score: 86 },
                    { week: "May 12", score: 85 },
                    { week: "May 19", score: 88 },
                    { week: "May 26", score: 87 },
                    { week: "Jun 2", score: 90 },
                    { week: "Jun 9", score: 91.7 }
                ]
            }), "trendModel");

            this.getView().setModel(new JSONModel({
                data: [
                    { status: "Compliant", count: 143 },
                    { status: "At Risk", count: 8 },
                    { status: "Failed", count: 5 }
                ]
            }), "postureModel");

            // vizProperties is object-typed — setting it here via a real JS
            // object instead of an XML attribute, since a hand-written
            // object/array literal in an XML attribute is exactly what broke
            // the FeedItem "values" binding earlier (single quotes aren't
            // valid JSON there). This is unambiguous.
            var oNoTitle = { title: { visible: false } };
            if (this.byId("postureChart")) { this.byId("postureChart").setVizProperties(oNoTitle); }
            if (this.byId("trendChart")) { this.byId("trendChart").setVizProperties(oNoTitle); }
        },

        onAfterRendering: function () {
            var oToolPage = this.byId("adminToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(SidebarState.get());
            }
            var oNav = this.byId("sideNavigation");
            if (oNav) {
                oNav.setSelectedKey("Admin");
            }
            killFocusRing(this.getView());
        },

        navToRoute: function (sRouteName) {
            var oRouter = UIComponent.getRouterFor(this) || (this.getOwnerComponent() && this.getOwnerComponent().getRouter());
            if (oRouter) {
                oRouter.navTo(sRouteName);
            } else {
                window.location.hash = "#/" + sRouteName;
            }
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("adminToolPage");
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
                if (sKey) {
                    this.navToRoute(sKey);
                }
            }
        },

        onAdmin: function () {
            this.navToRoute("Admin");
        },

        onUserManagement: function () {
            this.navToRoute("UserManagement");
        },


        onReviewer1: function () {
            this.navToRoute("Reviewer1");
        },

        onReviewer2: function () {
            this.navToRoute("Reviewer2");
        },

        onEscalationManager: function () {
            this.navToRoute("EscalationManager");
        },

        onControlManagement: function () {
            this.navToRoute("ControlManagement");
        },

        onControlMonitoring: function () {
            this.navToRoute("ControlMonitoring");
        },

        onAIInsights: function () {
            this.navToRoute("AIInsights");
        },

        onSOXCompliance: function () {
            this.navToRoute("SOXCompliance");
        },

        onReports: function () {
            this.navToRoute("Reports");
        },

        onDeviationReport: function () {
            this.navToRoute("DeviationReport");
        },

        onAuditLogs: function () {
            this.navToRoute("AuditLogs");
        },

        onConfiguration: function () {
            this.navToRoute("Configuration");
        },

        onAccessManagement: function () {
            this.navToRoute("AccessManagement");
        },

        onRiskAnalytics: function () {
            this.navToRoute("RiskAnalytics");
        },

        onEmergencyAccess: function () {
            this.navToRoute("EmergencyAccess");
        },

        onSystemHealth: function () {
            this.navToRoute("SystemHealth");
        },

        onProfile: function () {
            this.navToRoute("Profile");
        },

        onAdminProfilePress: function (oEvent) {
            var oButton = oEvent.getSource();
            var oPopover = this.byId("adminProfilePopover");
            if (oPopover) {
                oPopover.openBy(oButton);
            }
        },

        onNotificationPress: function () {
            MessageToast.show("System Notifications: 0 Critical Alerts");
        },

        onSearchPress: function () {
            MessageToast.show("Search initiated");
        },

        onHelpPress: function () {
            MessageToast.show("SAP Build Work Zone Help Documentation loaded");
        },

        onQuickAction: function (oEvent) {
            var sText = oEvent.getSource().getText();
            if (sText === "Create Control") {
                this.onControlManagement();
            } else if (sText === "Generate Report") {
                this.onReports();
            } else {
                MessageToast.show("Action triggered: " + sText);
            }
        },

        onLogout: function () {
            MessageToast.show("Logged Out Successfully");
            this.navToRoute("Login");
        }

    });

});
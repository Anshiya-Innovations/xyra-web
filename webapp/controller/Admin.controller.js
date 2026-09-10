sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "xyraweb/model/sidebarState",
    "xyraweb/model/focusRing",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationPopover",
    "xyraweb/service/AdminClient"
], function (Controller, MessageToast, UIComponent, JSONModel, SidebarState, killFocusRing, GlobalLoading, NotificationPopover, AdminClient) {
    "use strict";

    return Controller.extend("xyraweb.controller.Admin", {

        onInit: function () {
            var oModel = new JSONModel({
                busy: true,
                controlsTotal: 0, controlsEnabled: 0,
                openDeviations: 0, resolvedDeviations: 0, complianceRatePct: 0,
                systemsTotal: 0, systemsOnline: 0,
                alertBreakdown: [], reviewPipeline: [],
                controls: [], recentFindings: []
            });
            this.getView().setModel(oModel, "adminModel");

            AdminClient.loadDashboard().then(function (oData) {
                oData.busy = false;
                oModel.setData(oData);
            }).catch(function () {
                // Every source in AdminClient already falls back on its own -
                // this only guards against something unexpected slipping
                // through, so the page never stays stuck in a busy state.
                oModel.setProperty("/busy", false);
            });
        },

        onAfterRendering: function () {
            var oToolPage = this.byId("adminToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(SidebarState.get());
            }
            var oNav = this.byId("sideNavigation");
            if (oNav) {
                oNav.setSelectedKey("Admin");
                var oList = oNav.getItem();
                if (oList && oList.setSelectedKey) {
                    oList.setSelectedKey("Admin");
                }
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

        onNavToAiInsights: function () {
            this.navToRoute("AIInsights");
        },

        onNavToControlMgmt: function () {
            this.navToRoute("ControlManagement");
        },

        onNavToSox: function () {
            this.navToRoute("SOXCompliance");
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

        onOrganization: function () {
            this.navToRoute("Organization");
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

        onNotificationPress: function (oEvent) {
            NotificationPopover.toggle(oEvent, this);
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
            GlobalLoading.logout(this);
        }

    });

});
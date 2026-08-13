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

            var sSvg = this._generateAdminPosturePieChartSvg(143, 8, 5);
            this.getView().setModel(new JSONModel({
                postureSvgHtml: sSvg
            }), "adminModel");

            var oNoTitle = { title: { visible: false } };
            if (this.byId("trendChart")) { this.byId("trendChart").setVizProperties(oNoTitle); }
        },

        _generateAdminPosturePieChartSvg: function (iCompliant, iAtRisk, iFailed) {
            var iTotal = iCompliant + iAtRisk + iFailed;
            if (iTotal === 0) {
                return '<svg width="170" height="170" viewBox="0 0 170 170"><circle cx="85" cy="85" r="56" fill="none" stroke="#e2e8f0" stroke-width="18"/><text x="85" y="90" text-anchor="middle" fill="#94a3b8" font-size="14">0 Items</text></svg>';
            }

            var pComp = iCompliant / iTotal;
            var pRisk = iAtRisk / iTotal;
            var pFail = iFailed / iTotal;

            var pctCompText = (pComp * 100).toFixed(1) + "%";
            var pctRiskText = (pRisk * 100).toFixed(1) + "%";
            var pctFailText = (pFail * 100).toFixed(1) + "%";

            var a1 = pComp * 360;
            var a2 = a1 + (pRisk * 360);

            function getCoords(angle) {
                var rad = (angle - 90) * Math.PI / 180;
                return {
                    x: 85 + 56 * Math.cos(rad),
                    y: 85 + 56 * Math.sin(rad)
                };
            }

            var pt1 = getCoords(a1);
            var pt2 = getCoords(a2);

            var dComp = "M 85 29 A 56 56 0 " + (a1 > 180 ? 1 : 0) + " 1 " + pt1.x + " " + pt1.y;
            var dRisk = "M " + pt1.x + " " + pt1.y + " A 56 56 0 " + ((a2 - a1) > 180 ? 1 : 0) + " 1 " + pt2.x + " " + pt2.y;
            var dFail = "M " + pt2.x + " " + pt2.y + " A 56 56 0 " + ((360 - a2) > 180 ? 1 : 0) + " 1 85 29";

            var sUid = "adm_pie_" + Math.floor(Math.random() * 100000);

            var html = '<div class="donut-chart-wrapper" style="position:relative; width:170px; height:170px; display:inline-block;">';
            html += '<svg width="170" height="170" viewBox="0 0 170 170" style="overflow:visible;">';
            html += '<style>' +
                '.adm-donut-path { transition: all 0.25s ease-in-out; cursor: pointer; transform-origin: 85px 85px; }' +
                '.adm-donut-path:hover { stroke-width: 25px !important; filter: drop-shadow(0px 4px 10px rgba(0,0,0,0.35)); opacity: 1 !important; }' +
                '</style>';

            html += '<circle cx="85" cy="85" r="56" fill="none" stroke="#f1f5f9" stroke-width="18"/>';

            // Compliant (Blue #3b82f6)
            if (iCompliant > 0) {
                html += '<path d="' + dComp + '" fill="none" stroke="#3b82f6" stroke-width="18" class="adm-donut-path"' +
                    ' onmouseenter="document.getElementById(\'' + sUid + '_val\').textContent=\'' + iCompliant + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#3b82f6\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Compliant\';"' +
                    ' onmouseleave="document.getElementById(\'' + sUid + '_val\').textContent=\'' + iTotal + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#0f172a\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Total\';">' +
                    '<title>Status: Compliant\nCount: ' + iCompliant + ' (' + pctCompText + ')</title></path>';
            }
            // At Risk (Amber #d97706)
            if (iAtRisk > 0) {
                html += '<path d="' + dRisk + '" fill="none" stroke="#d97706" stroke-width="18" class="adm-donut-path"' +
                    ' onmouseenter="document.getElementById(\'' + sUid + '_val\').textContent=\'' + iAtRisk + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#d97706\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'At Risk\';"' +
                    ' onmouseleave="document.getElementById(\'' + sUid + '_val\').textContent=\'' + iTotal + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#0f172a\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Total\';">' +
                    '<title>Status: At Risk\nCount: ' + iAtRisk + ' (' + pctRiskText + ')</title></path>';
            }
            // Failed (Lime/Green #65a30d)
            if (iFailed > 0) {
                html += '<path d="' + dFail + '" fill="none" stroke="#65a30d" stroke-width="18" class="adm-donut-path"' +
                    ' onmouseenter="document.getElementById(\'' + sUid + '_val\').textContent=\'' + iFailed + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#65a30d\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Failed\';"' +
                    ' onmouseleave="document.getElementById(\'' + sUid + '_val\').textContent=\'' + iTotal + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#0f172a\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Total\';">' +
                    '<title>Status: Failed\nCount: ' + iFailed + ' (' + pctFailText + ')</title></path>';
            }

            html += '<text id="' + sUid + '_val" x="85" y="81" text-anchor="middle" fill="#0f172a" font-size="22" font-weight="bold" style="transition: all 0.2s ease;">' + iTotal + '</text>';
            html += '<text id="' + sUid + '_lbl" x="85" y="97" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600" style="transition: all 0.2s ease;">Total</text>';
            html += '</svg>';
            html += '</div>';

            return html;
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
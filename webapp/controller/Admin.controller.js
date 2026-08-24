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
                        finding: "User access not reviewed",
                        control: "ITGC-01",
                        severity: "High",
                        severityState: "Error",
                        status: "Open",
                        statusClass: "xyraPillChip xyraPillRed",
                        detected: "May 12, 2024"
                    },
                    {
                        finding: "Segregation of duties conflict",
                        control: "FIN-03",
                        severity: "Medium",
                        severityState: "Warning",
                        status: "In Progress",
                        statusClass: "xyraPillChip xyraPillAmber",
                        detected: "May 11, 2024"
                    },
                    {
                        finding: "Missing control evidence",
                        control: "APP-07",
                        severity: "Low",
                        severityState: "Success",
                        status: "Open",
                        statusClass: "xyraPillChip xyraPillRed",
                        detected: "May 10, 2024"
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

            var aTrendData = [
                { week: "Apr 14", score: 82 },
                { week: "Apr 21", score: 84 },
                { week: "Apr 28", score: 83 },
                { week: "May 5", score: 86 },
                { week: "May 12", score: 85 },
                { week: "May 19", score: 88 },
                { week: "May 26", score: 87 },
                { week: "Jun 2", score: 90 },
                { week: "Jun 9", score: 91.7 }
            ];

            var sPieSvg = this._generateAdminPosturePieChartSvg(143, 8, 5);
            var sTrendSvg = this._generateAdminTrendLineChartSvg(aTrendData);

            this.getView().setModel(new JSONModel({
                postureSvgHtml: sPieSvg,
                trendSvgHtml: sTrendSvg
            }), "adminModel");
        },

        _generateAdminTrendLineChartSvg: function (aTrendData) {
            var aData = aTrendData || [];
            var width = 960;
            var height = 230;
            var padL = 45;
            var padR = 25;
            var padT = 30;
            var padB = 40;

            var chartW = width - padL - padR;
            var chartH = height - padT - padB;

            var minY = 75;
            var maxY = 100;

            function getX(i) {
                return padL + (i * (chartW / (aData.length - 1)));
            }
            function getY(val) {
                return padT + chartH * (1 - (val - minY) / (maxY - minY));
            }

            var aPoints = aData.map(function (d, i) {
                return { x: getX(i), y: getY(d.score), week: d.week, score: d.score };
            });

            // Build smooth cubic Bezier path
            var dLine = "M " + aPoints[0].x.toFixed(1) + " " + aPoints[0].y.toFixed(1);
            for (var i = 0; i < aPoints.length - 1; i++) {
                var p0 = aPoints[i];
                var p1 = aPoints[i + 1];
                var cx1 = (p0.x + (p1.x - p0.x) / 2).toFixed(1);
                var cy1 = p0.y.toFixed(1);
                var cx2 = (p0.x + (p1.x - p0.x) / 2).toFixed(1);
                var cy2 = p1.y.toFixed(1);
                dLine += " C " + cx1 + " " + cy1 + ", " + cx2 + " " + cy2 + ", " + p1.x.toFixed(1) + " " + p1.y.toFixed(1);
            }

            var dArea = dLine + " L " + aPoints[aPoints.length - 1].x.toFixed(1) + " " + (padT + chartH) + " L " + aPoints[0].x.toFixed(1) + " " + (padT + chartH) + " Z";

            var sUid = "trend_svg_" + Math.floor(Math.random() * 100000);

            var html = '<div class="trend-chart-wrapper" style="position:relative; width:100%; max-width:100%; display:block;">';
            html += '<svg width="100%" height="230" viewBox="0 0 960 230" preserveAspectRatio="none" style="overflow:visible; width:100%;">';
            html += '<defs>' +
                '<linearGradient id="' + sUid + '_grad" x1="0%" y1="0%" x2="0%" y2="100%">' +
                    '<stop offset="0%" stop-color="#3b82f6" stop-opacity="0.38"/>' +
                    '<stop offset="80%" stop-color="#3b82f6" stop-opacity="0.03"/>' +
                    '<stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0"/>' +
                '</linearGradient>' +
                '<filter id="' + sUid + '_glow" x="-20%" y="-20%" width="140%" height="140%">' +
                    '<feGaussianBlur stdDeviation="2.5" result="blur"/>' +
                    '<feComposite in="SourceGraphic" in2="blur" operator="over"/>' +
                '</filter>' +
                '</defs>';

            html += '<style>' +
                '.trend-path { stroke-dasharray: 1000; stroke-dashoffset: 0; transition: all 0.3s ease; }' +
                '.trend-dot { transition: all 0.25s ease; cursor: pointer; }' +
                '.trend-dot:hover { r: 7.5px !important; stroke-width: 3.5px !important; fill: #2563eb !important; filter: drop-shadow(0 0 8px rgba(59,130,246,0.7)); }' +
                '</style>';

            // Horizontal Grid Lines
            var aGridVals = [100, 90, 80];
            aGridVals.forEach(function (v) {
                var gy = getY(v);
                html += '<line x1="' + padL + '" y1="' + gy + '" x2="' + (padL + chartW) + '" y2="' + gy + '" stroke="#f1f5f9" stroke-width="1.5"/>';
                html += '<text x="' + (padL - 10) + '" y="' + (gy + 4) + '" text-anchor="end" fill="#94a3b8" font-size="11" font-weight="500">' + v + '%</text>';
            });

            // Baseline (Y=75%)
            var baseY = padT + chartH;
            html += '<line x1="' + padL + '" y1="' + baseY + '" x2="' + (padL + chartW) + '" y2="' + baseY + '" stroke="#cbd5e1" stroke-width="1.5"/>';

            // Area Fill
            html += '<path d="' + dArea + '" fill="url(#' + sUid + '_grad)"/>';

            // Smooth Line
            html += '<path d="' + dLine + '" fill="none" stroke="#3b82f6" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="trend-path" filter="url(#' + sUid + '_glow)"/>';

            // Data Nodes & X-Axis Labels
            aPoints.forEach(function (pt) {
                // X-axis label
                html += '<text x="' + pt.x.toFixed(1) + '" y="' + (baseY + 20) + '" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600">' + pt.week + '</text>';

                // Data point circle node
                html += '<circle cx="' + pt.x.toFixed(1) + '" cy="' + pt.y.toFixed(1) + '" r="4.5" fill="#ffffff" stroke="#3b82f6" stroke-width="2.5" class="trend-dot">' +
                    '<title>Week: ' + pt.week + '\nCompliance Score: ' + pt.score + '%</title>' +
                    '</circle>';
            });

            html += '</svg>';
            html += '</div>';

            return html;
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
            // Failed (Red #ef4444)
            if (iFailed > 0) {
                html += '<path d="' + dFail + '" fill="none" stroke="#ef4444" stroke-width="18" class="adm-donut-path"' +
                    ' onmouseenter="document.getElementById(\'' + sUid + '_val\').textContent=\'' + iFailed + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#ef4444\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Failed\';"' +
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
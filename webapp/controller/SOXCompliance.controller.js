sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "xyraweb/model/soxComplianceService",
    "xyraweb/model/sidebarState",
    "xyraweb/model/focusRing"
], function (Controller, JSONModel, MessageToast, UIComponent, Filter, FilterOperator, SOXComplianceService, SidebarState, killFocusRing) {
    "use strict";

    return Controller.extend("xyraweb.controller.SOXCompliance", {

        onInit: function () {
            var oModel = SOXComplianceService.getModel();
            this.getView().setModel(oModel, "soxModel");

            var sSvg = this._generatePieChartSvg(20, 3, 1);
            oModel.setProperty("/statusSvgHtml", sSvg);

            var oRouter = UIComponent.getRouterFor(this) || (this.getOwnerComponent() && this.getOwnerComponent().getRouter());
            if (oRouter) {
                var oRoute = oRouter.getRoute("SOXCompliance");
                if (oRoute) {
                    oRoute.attachPatternMatched(this._onRouteMatched, this);
                }
            }
        },

        _generatePieChartSvg: function (iCompliant, iNonCompliant, iPending) {
            var iTotal = iCompliant + iNonCompliant + iPending;
            if (iTotal === 0) {
                return '<svg width="170" height="170" viewBox="0 0 170 170"><circle cx="85" cy="85" r="56" fill="none" stroke="#e2e8f0" stroke-width="18"/><text x="85" y="90" text-anchor="middle" fill="#94a3b8" font-size="14">0 Controls</text></svg>';
            }

            var pComp = iCompliant / iTotal;
            var pNonComp = iNonCompliant / iTotal;
            var pPend = iPending / iTotal;

            var pctCompText = (pComp * 100).toFixed(1) + "%";
            var pctNonCompText = (pNonComp * 100).toFixed(1) + "%";
            var pctPendText = (pPend * 100).toFixed(1) + "%";

            var a1 = pComp * 360;
            var a2 = a1 + (pNonComp * 360);

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
            var dNonComp = "M " + pt1.x + " " + pt1.y + " A 56 56 0 " + ((a2 - a1) > 180 ? 1 : 0) + " 1 " + pt2.x + " " + pt2.y;
            var dPend = "M " + pt2.x + " " + pt2.y + " A 56 56 0 " + ((360 - a2) > 180 ? 1 : 0) + " 1 85 29";

            var sUid = "sox_pie_" + Math.floor(Math.random() * 100000);

            var html = '<div class="donut-chart-wrapper" style="position:relative; width:170px; height:170px; display:inline-block;">';
            html += '<svg width="170" height="170" viewBox="0 0 170 170" style="overflow:visible;">';
            html += '<style>' +
                '.sox-donut-path { transition: all 0.25s ease-in-out; cursor: pointer; transform-origin: 85px 85px; }' +
                '.sox-donut-path:hover { stroke-width: 25px !important; filter: drop-shadow(0px 4px 10px rgba(0,0,0,0.35)); opacity: 1 !important; }' +
                '</style>';

            html += '<circle cx="85" cy="85" r="56" fill="none" stroke="#f1f5f9" stroke-width="18"/>';

            if (iCompliant > 0) {
                html += '<path d="' + dComp + '" fill="none" stroke="#10b981" stroke-width="18" class="sox-donut-path"' +
                    ' onmouseenter="document.getElementById(\'' + sUid + '_val\').textContent=\'' + pctCompText + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#10b981\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Compliant\';"' +
                    ' onmouseleave="document.getElementById(\'' + sUid + '_val\').textContent=\'' + iTotal + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#0f172a\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Total\';">' +
                    '<title>Compliant: ' + iCompliant + ' (' + pctCompText + ')</title></path>';
            }
            if (iNonCompliant > 0) {
                html += '<path d="' + dNonComp + '" fill="none" stroke="#ef4444" stroke-width="18" class="sox-donut-path"' +
                    ' onmouseenter="document.getElementById(\'' + sUid + '_val\').textContent=\'' + pctNonCompText + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#ef4444\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Non-Compliant\';"' +
                    ' onmouseleave="document.getElementById(\'' + sUid + '_val\').textContent=\'' + iTotal + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#0f172a\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Total\';">' +
                    '<title>Non-Compliant: ' + iNonCompliant + ' (' + pctNonCompText + ')</title></path>';
            }
            if (iPending > 0) {
                html += '<path d="' + dPend + '" fill="none" stroke="#f59e0b" stroke-width="18" class="sox-donut-path"' +
                    ' onmouseenter="document.getElementById(\'' + sUid + '_val\').textContent=\'' + pctPendText + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#f59e0b\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Pending\';"' +
                    ' onmouseleave="document.getElementById(\'' + sUid + '_val\').textContent=\'' + iTotal + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#0f172a\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Total\';">' +
                    '<title>Pending Review: ' + iPending + ' (' + pctPendText + ')</title></path>';
            }

            html += '<text id="' + sUid + '_val" x="85" y="81" text-anchor="middle" fill="#0f172a" font-size="20" font-weight="bold" style="transition: all 0.2s ease;">' + iTotal + '</text>';
            html += '<text id="' + sUid + '_lbl" x="85" y="97" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600" style="transition: all 0.2s ease;">Total</text>';
            html += '</svg>';
            html += '</div>';

            return html;
        },

        _onRouteMatched: function () {
            var oNav = this.byId("sideNavigation");
            if (oNav) {
                oNav.setSelectedKey("SOXCompliance");
            }
        },

        onAfterRendering: function () {
            var oToolPage = this.byId("soxToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(SidebarState.get());
            }
            var oNav = this.byId("sideNavigation");
            if (oNav) {
                oNav.setSelectedKey("SOXCompliance");
                var oList = oNav.getItem();
                if (oList && oList.setSelectedKey) {
                    oList.setSelectedKey("SOXCompliance");
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
            var oToolPage = this.byId("soxToolPage");
            if (oToolPage) {
                var bExpanded = !oToolPage.getSideExpanded();
                oToolPage.setSideExpanded(bExpanded);
                SidebarState.save(bExpanded);
            }
        },

        // PROCESS NAVIGATION HANDLERS
        onSOXControlsNav: function () {
            this.navToRoute("ControlManagement");
        },

        onControlMonitoringNav: function () {
            this.navToRoute("AutomationMonitoring");
        },

        onDeviationsNav: function () {
            this.navToRoute("DeviationReport");
        },

        onExceptionReviewNav: function () {
            this.navToRoute("Reviewer1");
        },

        onEvidenceNav: function () {
            this.navToRoute("AuditLogs");
        },

        onSOXReportsNav: function () {
            this.navToRoute("Reports");
        },

        // VIEW DETAILS MODAL HANDLERS
        onViewDetailsPress: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("soxModel").getObject();
            var oDetailModel = new JSONModel(JSON.parse(JSON.stringify(oItem)));
            this.getView().setModel(oDetailModel, "soxDetailModel");

            var oDialog = this.byId("soxControlDetailsDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onControlIdPress: function (oEvent) {
            this.onViewDetailsPress(oEvent);
        },

        onCloseSoxDetailsDialog: function () {
            var oDialog = this.byId("soxControlDetailsDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onViewExceptionWorkflow: function () {
            var oDialog = this.byId("soxControlDetailsDialog");
            if (oDialog) {
                oDialog.close();
            }
            MessageToast.show("Navigating to Exception Review Workflow...");
            this.navToRoute("Reviewer1");
        },

        // SIDEBAR NAVIGATION HANDLERS
        onSideNavItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            if (oItem) {
                var sKey = oItem.getKey();
                if (sKey) {
                    this.navToRoute(sKey);
                }
            }
        },

        onAdmin: function () { this.navToRoute("Admin"); },
        onControlManagement: function () { this.navToRoute("ControlManagement"); },
        onAIInsights: function () { this.navToRoute("Admin"); },
        onSOXCompliance: function () { this.navToRoute("SOXCompliance"); },
        onReports: function () { this.navToRoute("Reports"); },
        onAuditLogs: function () { this.navToRoute("AuditLogs"); },
        onConfiguration: function () { this.navToRoute("Configuration"); },
        onAccessManagement: function () { this.navToRoute("AccessManagement"); },
        onOrganization: function () { this.navToRoute("Organization"); },
        onRiskAnalytics: function () { this.navToRoute("Admin"); },
        onSystemHealth: function () { this.navToRoute("Admin"); },
        onProfile: function () { this.navToRoute("Profile"); },

        // SEARCH & FILTER LOGIC
        onSearchControls: function (oEvent) {
            this._applyTableFilters();
        },

        onStatusFilterChange: function () {
            this._applyTableFilters();
        },

        onSystemFilterChange: function () {
            this._applyTableFilters();
        },

        _applyTableFilters: function () {
            var aFilters = [];

            var sQuery = this.byId("soxControlTable").getParent().getHeaderToolbar().getContent()[2].getValue();
            var sStatusKey = this.byId("soxControlTable").getParent().getHeaderToolbar().getContent()[3].getSelectedKey();
            var sSystemKey = this.byId("soxControlTable").getParent().getHeaderToolbar().getContent()[4].getSelectedKey();

            if (sQuery && sQuery.trim() !== "") {
                var oSearchFilter = new Filter({
                    filters: [
                        new Filter("controlId", FilterOperator.Contains, sQuery),
                        new Filter("description", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                });
                aFilters.push(oSearchFilter);
            }

            if (sStatusKey && sStatusKey !== "All") {
                aFilters.push(new Filter("status", FilterOperator.EQ, sStatusKey));
            }

            if (sSystemKey && sSystemKey !== "All") {
                aFilters.push(new Filter("system", FilterOperator.EQ, sSystemKey));
            }

            var oBinding = this.byId("soxControlTable").getBinding("items");
            if (oBinding) {
                oBinding.filter(aFilters);
            }
        },

        // EXPORT TO CSV
        onExportCSV: function () {
            var oModel = this.getView().getModel("soxModel");
            var aControls = oModel ? oModel.getProperty("/controls") : [];
            if (!aControls || aControls.length === 0) {
                MessageToast.show("No SOX Controls available to export.");
                return;
            }

            var sCsvContent = "data:text/csv;charset=utf-8,";
            sCsvContent += "Control ID,Description,System,Client,Frequency,Status,Deviations,Risk,Last Run\n";

            aControls.forEach(function (c) {
                sCsvContent += '"' + c.controlId + '","' + c.description.replace(/"/g, '""') + '","' + c.system + '","' + c.client + '","' + c.frequency + '","' + c.status + '","' + c.deviationCount + '","' + c.risk + '","' + c.lastRun + '"\n';
            });

            var encodedUri = encodeURI(sCsvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "XYRA_SOX_Control_Monitoring_" + new Date().toISOString().slice(0, 10) + ".csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            MessageToast.show("SOX Controls exported successfully.");
        },

        onRefresh: function () {
            SOXComplianceService.refreshData();
            this._applyTableFilters();
            MessageToast.show("SOX Compliance Data Refreshed");
        },

        onNotificationPress: function () {
            MessageToast.show("SOX Alert: 1 Critical SOD Conflict Pending Sign-off");
        },

        onLogout: function () {
            MessageToast.show("Logged Out Successfully");
            this.navToRoute("Login");
        }

    });
});

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "xyraweb/service/DeviationClient",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationPopover",
    "xyraweb/model/config",
    "xyraweb/model/session"
], function (Controller, MessageToast, MessageBox, JSONModel, DeviationService, GlobalLoading, NotificationPopover, Config, Session) {
    "use strict";

    return Controller.extend("xyraweb.controller.DeviationReport", {

        onInit: function () {
            var oInitialData = {
                filters: {
                    sector: "All",
                    region: "All",
                    platform: "All",
                    system: "All",
                    client: "All",
                    control: "All",
                    status: "All",
                    startDate: "",
                    endDate: ""
                },
                options: {
                    regions: [
                        { key: "All", text: "All Regions" },
                        { key: "North America", text: "North America" },
                        { key: "EMEA", text: "EMEA" },
                        { key: "APAC", text: "APAC" },
                        { key: "LATAM", text: "LATAM" }
                    ],
                    platforms: [
                        { key: "All", text: "All Platforms" },
                        { key: "USROTC", text: "USROTC" },
                        { key: "EUROTC", text: "EUROTC" },
                        { key: "APROTC", text: "APROTC" },
                        { key: "GLOBAL", text: "GLOBAL" }
                    ],
                    systems: [
                        { key: "All", text: "All Systems" },
                        { key: "MY8", text: "MY8" },
                        { key: "DEV", text: "DEV" },
                        { key: "QAS", text: "QAS" },
                        { key: "PRD", text: "PRD" },
                        { key: "MP8", text: "MP8" },
                        { key: "asmy0801", text: "asmy0801" },
                        { key: "MQ8", text: "MQ8" }
                    ],
                    clients: [
                        { key: "All", text: "All Clients" },
                        { key: "000", text: "000" },
                        { key: "001", text: "001" },
                        { key: "066", text: "066" },
                        { key: "100", text: "100" },
                        { key: "200", text: "200" },
                        { key: "300", text: "300" }
                    ],
                    controls: [
                        { key: "All", text: "All Controls" },
                        { key: "NLG08", text: "NLG08 - Basis Kernel Audit Logging" },
                        { key: "NLG01", text: "NLG01 - SAP Security Baseline" },
                        { key: "XYRA-08", text: "XYRA-08 - SAP Java Audit Log" },
                        { key: "XYRA-28", text: "XYRA-28 - SAP HANA Security Audit" },
                        { key: "XYRA-01", text: "XYRA-01 - SoD Conflict Scan" },
                        { key: "XYRA-002", text: "XYRA-002 - Financial PO Limit" },
                        { key: "XYRA-003", text: "XYRA-003 - Automated Kernel Audit" }
                    ]
                },
                headers: [],
                totalRecords: 0,
                kpi: {
                    totalIncidents: 0,
                    openItems: 0,
                    resolvedItems: 0,
                    auditedControls: 0,
                    complianceRate: "0%"
                },
                statusSummary: {
                    pending: 0
                },
                severitySummary: {
                    critical: 0,
                    high: 0,
                    medium: 0,
                    low: 0
                },
                statusSvgHtml: ""
            };

            var oModel = new JSONModel(oInitialData);
            this.getView().setModel(oModel, "reportModel");

            this._loadFilterOptions();
            this._runQuery();
        },

        // Populates the System/Control filter dropdowns from real data - on
        // failure, the hardcoded lists already seeded in onInit's oInitialData
        // stay in place as the fallback. Sector/Region/Platform/Client stay
        // hardcoded/decorative either way (known cosmetic mismatch, not real
        // System associations - out of scope for this pass).
        _loadFilterOptions: function () {
            var oModel = this.getView().getModel("reportModel");
            var sSubdomain = (Session.get() && Session.get().subdomain) || Config.TEST_SUBDOMAIN;

            fetch(Config.AUTH_BASE_URL + "/api/system-config/listSystems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: sSubdomain })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { throw new Error(oData.message || "listSystems failed"); }
                    oModel.setProperty("/options/systems", [{ key: "All", text: "All Systems" }].concat(
                        (oData.systems || []).map(function (s) { return { key: s.sysId, text: s.sysId }; })
                    ));
                })
                .catch(function () { /* keep the hardcoded fallback already in the model */ });

            fetch(Config.AUTH_BASE_URL + "/api/control/listControls", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: sSubdomain })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { throw new Error(oData.message || "listControls failed"); }
                    oModel.setProperty("/options/controls", [{ key: "All", text: "All Controls" }].concat(
                        (oData.controls || []).map(function (c) { return { key: c.code, text: c.code + " - " + c.description }; })
                    ));
                })
                .catch(function () { /* keep the hardcoded fallback already in the model */ });
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("deviationToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
            }
        },

        onSideNavItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            if (oItem) {
                var sKey = oItem.getKey();
                if (sKey) {
                    this.getOwnerComponent().getRouter().navTo(sKey);
                }
            }
        },

        // Cascading Filter Handlers
        onSectorChange: function (oEvent) {
            var sSector = oEvent.getParameter("selectedItem").getKey();
            var oModel = this.getView().getModel("reportModel");

            if (sSector === "MedTech") {
                oModel.setProperty("/options/regions", [
                    { key: "All", text: "All Regions" },
                    { key: "North America", text: "North America" }
                ]);
                oModel.setProperty("/options/platforms", [
                    { key: "All", text: "All Platforms" },
                    { key: "USROTC", text: "USROTC" }
                ]);
            } else if (sSector === "Pharma") {
                oModel.setProperty("/options/regions", [
                    { key: "All", text: "All Regions" },
                    { key: "EMEA", text: "EMEA" }
                ]);
                oModel.setProperty("/options/platforms", [
                    { key: "All", text: "All Platforms" },
                    { key: "EUROTC", text: "EUROTC" }
                ]);
            } else if (sSector === "Consumer Health") {
                oModel.setProperty("/options/regions", [
                    { key: "All", text: "All Regions" },
                    { key: "APAC", text: "APAC" }
                ]);
                oModel.setProperty("/options/platforms", [
                    { key: "All", text: "All Platforms" },
                    { key: "APROTC", text: "APROTC" }
                ]);
            } else {
                oModel.setProperty("/options/regions", [
                    { key: "All", text: "All Regions" },
                    { key: "North America", text: "North America" },
                    { key: "EMEA", text: "EMEA" },
                    { key: "APAC", text: "APAC" },
                    { key: "LATAM", text: "LATAM" }
                ]);
                oModel.setProperty("/options/platforms", [
                    { key: "All", text: "All Platforms" },
                    { key: "USROTC", text: "USROTC" },
                    { key: "EUROTC", text: "EUROTC" },
                    { key: "APROTC", text: "APROTC" },
                    { key: "GLOBAL", text: "GLOBAL" }
                ]);
            }
            this.onSearch();
        },

        onRegionChange: function () {
            this.onSearch();
        },

        onPlatformChange: function () {
            this.onSearch();
        },

        onSystemChange: function (oEvent) {
            var sSystem = oEvent.getParameter("selectedItem").getKey();
            var oModel = this.getView().getModel("reportModel");

            if (sSystem === "MY8") {
                oModel.setProperty("/options/clients", [
                    { key: "All", text: "All Clients" },
                    { key: "100", text: "100" }
                ]);
            } else if (sSystem === "DEV") {
                oModel.setProperty("/options/clients", [
                    { key: "All", text: "All Clients" },
                    { key: "000", text: "000" }
                ]);
            } else {
                oModel.setProperty("/options/clients", [
                    { key: "All", text: "All Clients" },
                    { key: "000", text: "000" },
                    { key: "001", text: "001" },
                    { key: "066", text: "066" },
                    { key: "100", text: "100" },
                    { key: "200", text: "200" },
                    { key: "300", text: "300" }
                ]);
            }
            this.onSearch();
        },

        onClientChange: function () {
            this.onSearch();
        },

        onControlChange: function () {
            this.onSearch();
        },

        onStatusChange: function () {
            this.onSearch();
        },

        onSearch: function () {
            var oModel = this.getView().getModel("reportModel");
            var oFilters = oModel.getProperty("/filters");

            // Mandatory Validation
            if (!oFilters.sector) {
                MessageBox.error("Sector filter selection is mandatory.");
                return;
            }

            this._runQuery();
            MessageToast.show("Report search completed.");
        },

        onReset: function () {
            var oModel = this.getView().getModel("reportModel");
            oModel.setProperty("/filters", {
                sector: "All",
                region: "All",
                platform: "All",
                system: "All",
                client: "All",
                control: "All",
                status: "All",
                startDate: "",
                endDate: ""
            });
            if (this.byId("filterStartingDate")) { this.byId("filterStartingDate").reset(); }
            if (this.byId("filterEndingDate")) { this.byId("filterEndingDate").reset(); }
            if (this.byId("filterDateRange")) { this.byId("filterDateRange").reset(); }
            this._runQuery();
            MessageToast.show("Filter criteria reset.");
        },

        onControlLinkPress: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("reportModel").getObject();
            var sAlertId = oItem.alertId || "ALT-1001";
            var sControlId = oItem.controlId || "NLG08";

            this.getOwnerComponent().getRouter().navTo("AlertItem", {
                alertId: sAlertId,
                controlId: sControlId
            });
        },

        onRefresh: function () {
            this._runQuery();
            MessageToast.show("Deviation Report refreshed.");
        },

        onNotificationPress: function (oEvent) {
            NotificationPopover.toggle(oEvent, this);
        },

        onLogout: function () {
            GlobalLoading.logout(this);
        },

        _runQuery: function () {
            var that = this;
            var oModel = this.getView().getModel("reportModel");
            var oFilters = oModel.getProperty("/filters");

            return DeviationService.queryDeviations(oFilters).then(function (oResult) {
                oModel.setProperty("/headers", oResult.headers);
                oModel.setProperty("/totalRecords", oResult.totalRecords);
                oModel.setProperty("/kpi", oResult.kpi);
                oModel.setProperty("/severitySummary", oResult.severitySummary);
                oModel.setProperty("/statusSummary", oResult.statusSummary);

                // Generate SVG Donut Chart HTML
                var sSvg = that._generatePieChartSvg(oResult.kpi.openItems, oResult.kpi.resolvedItems, oResult.statusSummary.pending);
                oModel.setProperty("/statusSvgHtml", sSvg);
            });
        },

        _generatePieChartSvg: function (iOpen, iResolved, iPending) {
            var iTotal = iOpen + iResolved + iPending;
            if (iTotal === 0) {
                return '<svg width="170" height="170" viewBox="0 0 170 170"><circle cx="85" cy="85" r="56" fill="none" stroke="#e2e8f0" stroke-width="18"/><text x="85" y="90" text-anchor="middle" fill="#94a3b8" font-size="14">0 Incidents</text></svg>';
            }

            var fOpenPct = (iOpen / iTotal);
            var fResolvedPct = (iResolved / iTotal);
            var fPendingPct = (iPending / iTotal);

            var pctOpenText = (fOpenPct * 100).toFixed(1) + "%";
            var pctResolvedText = (fResolvedPct * 100).toFixed(1) + "%";
            var pctPendingText = (fPendingPct * 100).toFixed(1) + "%";

            // Angles
            var a1 = fOpenPct * 360;
            var a2 = a1 + (fResolvedPct * 360);

            function getCoordinatesForAngle(angle) {
                var rad = (angle - 90) * Math.PI / 180;
                return {
                    x: 85 + 56 * Math.cos(rad),
                    y: 85 + 56 * Math.sin(rad)
                };
            }

            var p1 = getCoordinatesForAngle(a1);
            var p2 = getCoordinatesForAngle(a2);

            var d1 = "M 85 29 A 56 56 0 " + (a1 > 180 ? 1 : 0) + " 1 " + p1.x + " " + p1.y;
            var d2 = "M " + p1.x + " " + p1.y + " A 56 56 0 " + ((a2 - a1) > 180 ? 1 : 0) + " 1 " + p2.x + " " + p2.y;
            var d3 = "M " + p2.x + " " + p2.y + " A 56 56 0 " + ((360 - a2) > 180 ? 1 : 0) + " 1 85 29";

            var sUid = "dev_pie_" + Math.floor(Math.random() * 100000);

            var html = '<div class="donut-chart-wrapper" style="position:relative; width:170px; height:170px; display:inline-block;">';
            html += '<svg width="170" height="170" viewBox="0 0 170 170" style="overflow:visible;">';
            html += '<style>' +
                '.dev-donut-path { transition: all 0.25s ease-in-out; cursor: pointer; transform-origin: 85px 85px; }' +
                '.dev-donut-path:hover { stroke-width: 25px !important; filter: drop-shadow(0px 4px 10px rgba(0,0,0,0.35)); opacity: 1 !important; }' +
                '</style>';

            html += '<circle cx="85" cy="85" r="56" fill="none" stroke="#f8fafc" stroke-width="18"/>';

            if (iOpen > 0) {
                html += '<path d="' + d1 + '" fill="none" stroke="#ef4444" stroke-width="18" class="dev-donut-path"' +
                    ' onmouseenter="document.getElementById(\'' + sUid + '_val\').textContent=\'' + pctOpenText + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#ef4444\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Open\';"' +
                    ' onmouseleave="document.getElementById(\'' + sUid + '_val\').textContent=\'' + iTotal + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#0f172a\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Total\';">' +
                    '<title>Open: ' + iOpen + ' (' + pctOpenText + ')</title></path>';
            }
            if (iResolved > 0) {
                html += '<path d="' + d2 + '" fill="none" stroke="#10b981" stroke-width="18" class="dev-donut-path"' +
                    ' onmouseenter="document.getElementById(\'' + sUid + '_val\').textContent=\'' + pctResolvedText + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#10b981\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Resolved\';"' +
                    ' onmouseleave="document.getElementById(\'' + sUid + '_val\').textContent=\'' + iTotal + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#0f172a\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Total\';">' +
                    '<title>Resolved: ' + iResolved + ' (' + pctResolvedText + ')</title></path>';
            }
            if (iPending > 0) {
                html += '<path d="' + d3 + '" fill="none" stroke="#f59e0b" stroke-width="18" class="dev-donut-path"' +
                    ' onmouseenter="document.getElementById(\'' + sUid + '_val\').textContent=\'' + pctPendingText + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#f59e0b\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Pending\';"' +
                    ' onmouseleave="document.getElementById(\'' + sUid + '_val\').textContent=\'' + iTotal + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#0f172a\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Total\';">' +
                    '<title>Pending: ' + iPending + ' (' + pctPendingText + ')</title></path>';
            }

            html += '<text id="' + sUid + '_val" x="85" y="81" text-anchor="middle" fill="#0f172a" font-size="20" font-weight="bold" style="transition: all 0.2s ease;">' + iTotal + '</text>';
            html += '<text id="' + sUid + '_lbl" x="85" y="97" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600" style="transition: all 0.2s ease;">Total</text>';
            html += '</svg>';
            html += '</div>';

            return html;
        },

        onNavControlManagement: function () {
            this.getOwnerComponent().getRouter().navTo("ControlManagement");
        },

        onNavAutomationMonitoring: function () {
            this.getOwnerComponent().getRouter().navTo("AutomationMonitoring");
        },

        onSideNavItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            if (oItem) {
                var sKey = oItem.getKey();
                if (sKey && this[sKey]) {
                    this[sKey]();
                } else if (sKey) {
                    this.getOwnerComponent().getRouter().navTo(sKey);
                }
            }
        },

        onAdmin: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
        onControlManagement: function () { this.getOwnerComponent().getRouter().navTo("ControlManagement"); },
        onAIInsights: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
        onSOXCompliance: function () { this.getOwnerComponent().getRouter().navTo("SOXCompliance"); },
        onReports: function () { this.getOwnerComponent().getRouter().navTo("Reports"); },
        onAuditLogs: function () { this.getOwnerComponent().getRouter().navTo("AuditLogs"); },
        onConfiguration: function () { this.getOwnerComponent().getRouter().navTo("Configuration"); },
        onAccessManagement: function () { this.getOwnerComponent().getRouter().navTo("AccessManagement"); },
        onOrganization: function () { this.getOwnerComponent().getRouter().navTo("Organization"); },
        onProfile: function () { this.getOwnerComponent().getRouter().navTo("Profile"); }

    });
});

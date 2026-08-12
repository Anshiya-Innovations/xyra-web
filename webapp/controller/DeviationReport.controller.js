sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "xyraweb/service/DeviationService"
], function (Controller, MessageToast, MessageBox, JSONModel, DeviationService) {
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

            this._runQuery();
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
        },

        onRegionChange: function () {
            // Cascading hook for Region
        },

        onPlatformChange: function () {
            // Cascading hook for Platform
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

        onNotificationPress: function () {
            MessageToast.show("No unread system alerts.");
        },

        onLogout: function () {
            this.getOwnerComponent().getRouter().navTo("Login");
        },

        _runQuery: function () {
            var oModel = this.getView().getModel("reportModel");
            var oFilters = oModel.getProperty("/filters");

            var oResult = DeviationService.queryDeviations(oFilters);

            oModel.setProperty("/headers", oResult.headers);
            oModel.setProperty("/totalRecords", oResult.totalRecords);
            oModel.setProperty("/kpi", oResult.kpi);
            oModel.setProperty("/severitySummary", oResult.severitySummary);

            var iPending = Math.max(0, oResult.kpi.totalIncidents - oResult.kpi.openItems - oResult.kpi.resolvedItems);
            oModel.setProperty("/statusSummary", { pending: iPending });

            // Generate SVG Donut Chart HTML
            var sSvg = this._generatePieChartSvg(oResult.kpi.openItems, oResult.kpi.resolvedItems, iPending);
            oModel.setProperty("/statusSvgHtml", sSvg);
        },

        _generatePieChartSvg: function (iOpen, iResolved, iPending) {
            var iTotal = iOpen + iResolved + iPending;
            if (iTotal === 0) {
                return '<svg width="150" height="150" viewBox="0 0 150 150"><circle cx="75" cy="75" r="55" fill="none" stroke="#e2e8f0" stroke-width="22"/><text x="75" y="80" text-anchor="middle" fill="#94a3b8" font-size="14">0 Incidents</text></svg>';
            }

            var fOpenPct = (iOpen / iTotal);
            var fResolvedPct = (iResolved / iTotal);

            // Angles
            var a1 = fOpenPct * 360;
            var a2 = a1 + (fResolvedPct * 360);

            function getCoordinatesForAngle(angle) {
                var rad = (angle - 90) * Math.PI / 180;
                return {
                    x: 75 + 55 * Math.cos(rad),
                    y: 75 + 55 * Math.sin(rad)
                };
            }

            var p1 = getCoordinatesForAngle(a1);
            var p2 = getCoordinatesForAngle(a2);

            var d1 = "M 75 20 A 55 55 0 " + (a1 > 180 ? 1 : 0) + " 1 " + p1.x + " " + p1.y;
            var d2 = "M " + p1.x + " " + p1.y + " A 55 55 0 " + ((a2 - a1) > 180 ? 1 : 0) + " 1 " + p2.x + " " + p2.y;
            var d3 = "M " + p2.x + " " + p2.y + " A 55 55 0 " + ((360 - a2) > 180 ? 1 : 0) + " 1 75 20";

            var html = '<svg width="160" height="160" viewBox="0 0 150 150">';
            html += '<circle cx="75" cy="75" r="55" fill="none" stroke="#f8fafc" stroke-width="22"/>';

            if (iOpen > 0) {
                html += '<path d="' + d1 + '" fill="none" stroke="#ef4444" stroke-width="22"/>';
            }
            if (iResolved > 0) {
                html += '<path d="' + d2 + '" fill="none" stroke="#10b981" stroke-width="22"/>';
            }
            if (iPending > 0) {
                html += '<path d="' + d3 + '" fill="none" stroke="#f59e0b" stroke-width="22"/>';
            }

            html += '<text x="75" y="72" text-anchor="middle" fill="#0f172a" font-size="18" font-weight="bold">' + iTotal + '</text>';
            html += '<text x="75" y="88" text-anchor="middle" fill="#64748b" font-size="11">Total</text>';
            html += '</svg>';

            return html;
        },

        onNavControlManagement: function () {
            this.getOwnerComponent().getRouter().navTo("ControlManagement");
        },

        onNavAutomationMonitoring: function () {
            this.getOwnerComponent().getRouter().navTo("AutomationMonitoring");
        }

    });
});

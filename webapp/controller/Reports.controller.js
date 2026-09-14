sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "xyraweb/model/sidebarState",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationPopover",
    "xyraweb/model/config",
    "xyraweb/model/session"
], function (Controller, JSONModel, MessageToast, MessageBox, SidebarState, GlobalLoading, NotificationPopover, Config, Session) {
    "use strict";

    return Controller.extend("xyraweb.controller.Reports", {

        onAfterRendering: function () {
            var oToolPage = this.byId("reportsToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(SidebarState.get());
            }
            var oNav = this.byId("sideNavigation");
            if (oNav) {
                oNav.setSelectedKey("Reports");
                var oList = oNav.getItem();
                if (oList && oList.setSelectedKey) {
                    oList.setSelectedKey("Reports");
                }
            }
        },

        onInit: function () {
            var oModel = new JSONModel({
                filters: {
                    controlId: "",
                    systemId: "All",
                    client: "All",
                    region: "All",
                    platform: "All",
                    sector: "All",
                    startDate: null,
                    endDate: null
                },
                rows: [],
                summary: { total: 0, passed: 0, deviations: 0 }
            });
            this.getView().setModel(oModel, "reportModel");
            this.getView().setModel(new JSONModel({
                controls: [],
                systems: [{ key: "All", text: "All Systems" }],
                clients: [{ key: "All", text: "All Clients" }],
                regions: [{ key: "All", text: "All Regions" }],
                platforms: [{ key: "All", text: "All Platforms" }],
                sectors: [{ key: "All", text: "All Sectors" }]
            }), "reportFilterOptionsModel");

            this._loadFilterOptions();
        },

        _getSubdomain: function () {
            var oSession = Session.get();
            return (oSession && oSession.subdomain) || Config.TEST_SUBDOMAIN;
        },

        // Control/System dropdowns from real data; Region/Platform/Sector/Client
        // are derived from the same listSystems response (it already joins
        // platform/region/sector codes per system - same pattern
        // DeviationReport.controller.js's own _loadFilterOptions uses).
        _loadFilterOptions: function () {
            var oModel = this.getView().getModel("reportFilterOptionsModel");
            var sSubdomain = this._getSubdomain();

            fetch(Config.AUTH_BASE_URL + "/api/control/listControls", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: sSubdomain })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { throw new Error(oData.message || "listControls failed"); }
                    oModel.setProperty("/controls", (oData.controls || []).map(function (c) {
                        return { key: c.id, text: c.code + " - " + c.description };
                    }));
                })
                .catch(function () { /* leave empty - Control select just won't offer options */ });

            fetch(Config.AUTH_BASE_URL + "/api/system-config/listSystems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: sSubdomain })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { throw new Error(oData.message || "listSystems failed"); }
                    var aSystems = oData.systems || [];
                    var distinct = function (get) {
                        var seen = {};
                        var out = [];
                        aSystems.forEach(function (s) {
                            var v = get(s);
                            if (v && !seen[v]) { seen[v] = true; out.push(v); }
                        });
                        return out.map(function (v) { return { key: v, text: v }; });
                    };
                    oModel.setProperty("/systems", [{ key: "All", text: "All Systems" }].concat(distinct(function (s) { return s.sysId; })));
                    oModel.setProperty("/clients", [{ key: "All", text: "All Clients" }].concat(distinct(function (s) { return s.client; })));
                    oModel.setProperty("/regions", [{ key: "All", text: "All Regions" }].concat(distinct(function (s) { return s.region; })));
                    oModel.setProperty("/platforms", [{ key: "All", text: "All Platforms" }].concat(distinct(function (s) { return s.platform; })));
                    oModel.setProperty("/sectors", [{ key: "All", text: "All Sectors" }].concat(distinct(function (s) { return s.sector; })));
                })
                .catch(function () { /* leave the "All" fallbacks already in the model */ });
        },

        onGenerateHistory: function () {
            var oModel = this.getView().getModel("reportModel");
            var oFilters = oModel.getProperty("/filters");

            if (!oFilters.controlId) {
                MessageBox.error("Please select a Control.");
                return;
            }

            var oStartDatePicker = this.byId("historyStartDate");
            var oEndDatePicker = this.byId("historyEndDate");
            var oStart = oStartDatePicker ? oStartDatePicker.getDateValue() : null;
            var oEnd = oEndDatePicker ? oEndDatePicker.getDateValue() : null;

            var oBody = {
                subdomain: this._getSubdomain(),
                controlId: oFilters.controlId,
                systemId: oFilters.systemId !== "All" ? oFilters.systemId : "",
                client: oFilters.client !== "All" ? oFilters.client : "",
                region: oFilters.region !== "All" ? oFilters.region : "",
                platform: oFilters.platform !== "All" ? oFilters.platform : "",
                sector: oFilters.sector !== "All" ? oFilters.sector : "",
                startDate: oStart ? oStart.toISOString().slice(0, 10) : "",
                endDate: oEnd ? oEnd.toISOString().slice(0, 10) : ""
            };

            GlobalLoading.show("Loading Control History", 0, true, true);
            fetch(Config.AUTH_BASE_URL + "/api/control/listControlHistory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(oBody)
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) {
                        MessageBox.error(oData.message || "Could not load control history.");
                        oModel.setProperty("/rows", []);
                        oModel.setProperty("/summary", { total: 0, passed: 0, deviations: 0 });
                        return;
                    }
                    var aRows = (oData.history || []).map(function (h) {
                        return Object.assign({}, h, {
                            deviationText: h.deviationFlag ? "Deviation" : "OK",
                            deviationState: h.deviationFlag ? "Error" : "Success"
                        });
                    });
                    var iDeviations = aRows.filter(function (r) { return r.deviationFlag; }).length;
                    oModel.setProperty("/rows", aRows);
                    oModel.setProperty("/summary", { total: aRows.length, passed: aRows.length - iDeviations, deviations: iDeviations });
                })
                .catch(function () {
                    MessageBox.error("Could not reach the server. Is xyra-core running?");
                    oModel.setProperty("/rows", []);
                    oModel.setProperty("/summary", { total: 0, passed: 0, deviations: 0 });
                })
                .then(function () {
                    GlobalLoading.hide();
                });
        },

        onExportCsv: function () {
            var oModel = this.getView().getModel("reportModel");
            var aRows = oModel.getProperty("/rows") || [];

            if (aRows.length === 0) {
                MessageBox.information("No control history records available to export.");
                return;
            }

            var aCsvRows = [];
            aCsvRows.push([
                "Control ID", "Description", "System ID", "Client", "Region", "Platform", "Sector",
                "SAP Object", "Parameter", "Operator", "Actual Value", "Expected Value", "Deviation", "Message", "Captured At"
            ].join(","));

            aRows.forEach(function (r) {
                aCsvRows.push([
                    r.controlId, r.controlDescription, r.systemId, r.client, r.region, r.platform, r.sector,
                    r.sapObject, r.parameter, r.operator, r.actualValue, r.expectedValue,
                    r.deviationText, r.message, r.capturedAt
                ].map(function (v) { return '"' + String(v || "").replace(/"/g, '""') + '"'; }).join(","));
            });

            var sCsvContent = aCsvRows.join("\n");
            var blob = new Blob([sCsvContent], { type: "text/csv;charset=utf-8;" });
            var link = document.createElement("a");
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "XYRA_Control_History_" + new Date().toISOString().slice(0, 10) + ".csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            MessageToast.show("Control history exported to CSV successfully.");
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("reportsToolPage");
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
                if (sKey && this[sKey]) {
                    this[sKey]();
                } else if (sKey) {
                    this.getOwnerComponent().getRouter().navTo(sKey);
                }
            }
        },

        onAdmin: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
        onReviewer1: function () { this.getOwnerComponent().getRouter().navTo("Reviewer1"); },
        onReviewer2: function () { this.getOwnerComponent().getRouter().navTo("Reviewer2"); },
        onEscalationManager: function () { this.getOwnerComponent().getRouter().navTo("EscalationManager"); },
        onControlManagement: function () { this.getOwnerComponent().getRouter().navTo("ControlManagement"); },
        onAIInsights: function () { this.getOwnerComponent().getRouter().navTo("AIInsights"); },
        onSOXCompliance: function () { this.getOwnerComponent().getRouter().navTo("SOXCompliance"); },
        onReports: function () { this.getOwnerComponent().getRouter().navTo("Reports"); },
        onDeviationReport: function () { this.getOwnerComponent().getRouter().navTo("DeviationReport"); },
        onAuditLogs: function () { this.getOwnerComponent().getRouter().navTo("AuditLogs"); },
        onConfiguration: function () { this.getOwnerComponent().getRouter().navTo("Configuration"); },
        onAccessManagement: function () { this.getOwnerComponent().getRouter().navTo("AccessManagement"); },
        onOrganization: function () { this.getOwnerComponent().getRouter().navTo("Organization"); },
        onRiskAnalytics: function () { this.getOwnerComponent().getRouter().navTo("RiskAnalytics"); },
        onSystemHealth: function () { this.getOwnerComponent().getRouter().navTo("SystemHealth"); },
        onProfile: function () { this.getOwnerComponent().getRouter().navTo("Profile"); },

        onNotificationPress: function (oEvent) {
            NotificationPopover.toggle(oEvent, this);
        },
        onLogout: function () {
            GlobalLoading.logout(this);
        }

    });

});

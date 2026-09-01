sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/BusyIndicator",
    "xyraweb/model/sidebarState",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationPopover",
    "xyraweb/model/config",
    "xyraweb/model/session",
    "xyraweb/model/mockData"
], function (Controller, JSONModel, MessageToast, MessageBox, Filter, FilterOperator, BusyIndicator, SidebarState, GlobalLoading, NotificationPopover, Config, Session, MockData) {
    "use strict";

    // Same UI label <-> backend enum table as ControlManagement.controller.js -
    // duplicated rather than shared, not worth a module for 2 call sites.
    var FREQ_BE_TO_UI = {
        MONTHLY: "Monthly (Last day of month)", WEEKLY: "Weekly (Every Monday)",
        DAILY: "Daily", REALTIME: "Realtime", CRON: "Cron Expression"
    };

    // A generic placeholder for the still-mock "Rule" dialog and the
    // getControlLogs offline fallback - real controls won't match the old
    // hardcoded per-id mock rows, so one reasonable generic row/line stands in.
    var GENERIC_RULES = [
        { parameter: "N/A", operator: "N/A", expectedValue: "N/A", actualValue: "N/A", statusText: "Not available in this view", statusState: "Information", statusIcon: "sap-icon://information" }
    ];
    var GENERIC_LOGS = [
        { timestamp: "-", level: "INFO", levelState: "Information", message: "No execution log available." }
    ];

    function deriveDeviationBadge(sLastRunStatus) {
        if (sLastRunStatus === "PASS") { return { deviationLabel: "No Deviation", deviationState: "None", deviationClass: "badgeWhite" }; }
        if (sLastRunStatus === "FAIL") { return { deviationLabel: "Deviation", deviationState: "Error", deviationClass: "badgeRed" }; }
        if (sLastRunStatus === "ERROR") { return { deviationLabel: "Run Error", deviationState: "Error", deviationClass: "badgeRed" }; }
        return { deviationLabel: "Not Yet Run", deviationState: "None", deviationClass: "badgeWhite" };
    }

    return Controller.extend("xyraweb.controller.AutomationMonitoring", {

        onAfterRendering: function () {
            var oToolPage = this.byId("automationMonitoringToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(SidebarState.get());
            }
            var oNav = this.byId("sideNavigation");
            if (oNav) {
                oNav.setSelectedKey("AutomationMonitoring");
                var oList = oNav.getItem();
                if (oList && oList.setSelectedKey) {
                    oList.setSelectedKey("AutomationMonitoring");
                }
            }
        },

        onInit: function () {
            this.getView().setModel(new JSONModel({ controls: [] }), "automationModel");
            var that = this;
            this._loadSystemsLookup().then(function () { that._loadControls(); });
        },

        _getSubdomain: function () {
            var oSession = Session.get();
            return (oSession && oSession.subdomain) || Config.TEST_SUBDOMAIN;
        },

        // Small local duplicate of ControlManagement's system-id -> sysId lookup -
        // not worth a shared module for 2 call sites.
        _loadSystemsLookup: function () {
            var that = this;
            return fetch(Config.AUTH_BASE_URL + "/api/system-config/listSystems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: this._getSubdomain() })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { throw new Error(oData.message || "listSystems failed"); }
                    that._systemsById = {};
                    (oData.systems || []).forEach(function (s) { that._systemsById[s.id] = s.sysId; });
                })
                .catch(function () {
                    that._systemsById = {};
                    (MockData.systems || []).forEach(function (s) { that._systemsById[s.id] = s.sysId; });
                });
        },

        _sysDisplay: function (sId) {
            if (!sId) { return "None"; }
            return (this._systemsById && this._systemsById[sId]) || sId;
        },

        // Duplicated from ControlManagement.controller.js (same reasoning as
        // _loadSystemsLookup above).
        _calculateCronRunCount: function (sCron) {
            if (!sCron) { return "12"; }
            var sClean = sCron.trim().replace(/\s+/g, " ");
            if (sClean === "* * * * *" || sClean.indexOf("*/1 ") === 0) { return "Continuous"; }
            var aParts = sClean.split(" ");
            if (aParts.length < 5) { return "12"; }
            var min = aParts[0], hour = aParts[1], dom = aParts[2], mon = aParts[3], dow = aParts[4];
            if (min === "*" && hour === "*" && dom === "*" && mon === "*" && dow === "*") { return "Continuous"; }
            if ((dom === "1" || dom === "L" || dom === "28" || dom === "30" || dom === "31") && mon === "*" && dow === "*") { return "12"; }
            if (dom === "*" && (dow === "1" || dow === "MON" || dow === "mon")) { return "52"; }
            if (min !== "*" && hour !== "*" && dom === "*" && mon === "*" && dow === "*") { return "365"; }
            if (min !== "*" && hour === "*" && dom === "*") { return "8,760 Runs/Year"; }
            if (min.indexOf("*/") === 0) {
                var step = parseInt(min.replace("*/", ""), 10);
                if (!isNaN(step) && step > 0) { return Math.round((24 * 60 / step) * 365).toLocaleString() + " Runs/Year"; }
            }
            return dom !== "*" ? "12" : "365";
        },

        _calculateTotalRun: function (sFrequency, sCron) {
            switch (sFrequency) {
                case "Monthly (Last day of month)": return "12";
                case "Weekly (Every Monday)": return "52";
                case "Daily": return "365";
                case "Realtime": return "Continuous";
                case "Cron Expression": return this._calculateCronRunCount(sCron);
                default: return "365";
            }
        },

        _mapControlEntryToRow: function (c) {
            var aIds = c.systemIds || [];
            var sFreqUi = FREQ_BE_TO_UI[c.frequency] || "Daily";
            var oBadge = deriveDeviationBadge(c.lastRunStatus);
            return Object.assign({
                id: c.code,
                description: c.description,
                sysType1: this._sysDisplay(aIds[0]),
                sysType2: this._sysDisplay(aIds[1]),
                sysType3: this._sysDisplay(aIds[2]),
                frequencyRun: sFreqUi,
                cronExpr: c.cronExpression || "",
                totalRun: this._calculateTotalRun(sFreqUi, c.cronExpression),
                rules: GENERIC_RULES,
                logs: GENERIC_LOGS
            }, oBadge);
        },

        _loadControls: function () {
            var that = this;
            BusyIndicator.show(0);
            return fetch(Config.AUTH_BASE_URL + "/api/control/listControls", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: this._getSubdomain() })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();
                    if (!oData.success) { throw new Error(oData.message || "listControls failed"); }
                    var aRows = (oData.controls || []).map(that._mapControlEntryToRow, that);
                    that.getView().getModel("automationModel").setProperty("/controls", aRows);
                })
                .catch(function () {
                    BusyIndicator.hide();
                    MockData.notice(MessageToast);
                    var aRows = (MockData.controls || []).map(that._mapControlEntryToRow, that);
                    that.getView().getModel("automationModel").setProperty("/controls", aRows);
                });
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("automationMonitoringToolPage");
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

        onNavControlManagement: function () {
            this.getOwnerComponent().getRouter().navTo("ControlManagement");
        },

        onViewRule: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("automationModel").getObject();
            var oDialog = this.byId("ruleDetailsDialog");

            if (this.byId("ruleControlIdTitle")) { this.byId("ruleControlIdTitle").setText("Control ID: " + oItem.id); }
            if (this.byId("ruleControlDescText")) { this.byId("ruleControlDescText").setText(oItem.description); }

            var oOverallStatus = this.byId("ruleOverallStatus");
            var oMessageStrip = this.byId("ruleStatusMessageStrip");

            if (oOverallStatus) {
                oOverallStatus.setText(oItem.deviationLabel);
                oOverallStatus.setState(oItem.deviationState);

                // Update badge class dynamically
                oOverallStatus.removeStyleClass("badgeWhite");
                oOverallStatus.removeStyleClass("badgeYellow");
                oOverallStatus.removeStyleClass("badgeRed");
                oOverallStatus.addStyleClass(oItem.deviationClass || "badgeWhite");
            }

            if (oMessageStrip) {
                if (oItem.deviationLabel === "No Deviation") {
                    oMessageStrip.setText("Rule Satisfied: No deviations detected across evaluated system targets.");
                    oMessageStrip.setType("Success");
                } else if (oItem.deviationLabel === "Not Yet Run") {
                    oMessageStrip.setText("This control has not run yet - no evaluation results available.");
                    oMessageStrip.setType("Information");
                } else if (oItem.deviationLabel === "Run Error") {
                    oMessageStrip.setText("The last run could not complete - see the Deviation Report for details.");
                    oMessageStrip.setType("Error");
                } else {
                    oMessageStrip.setText("Deviation detected on the most recent run - see the Deviation Report for the full detail.");
                    oMessageStrip.setType("Error");
                }
            }

            var oRuleDetailsModel = new JSONModel({ rules: oItem.rules || [] });
            this.getView().setModel(oRuleDetailsModel, "ruleDetailsModel");

            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseRuleDialog: function () {
            var oDialog = this.byId("ruleDetailsDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onViewLogs: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("automationModel").getObject();
            var oDialog = this.byId("jobLogsDialog");
            var that = this;

            if (this.byId("logJobIdTitle")) { this.byId("logJobIdTitle").setText("Control ID: " + oItem.id); }
            if (this.byId("logControlNameText")) { this.byId("logControlNameText").setText(oItem.description + " (" + oItem.frequencyRun + ")"); }
            if (this.byId("logJobStatus")) {
                var bHasDev = (oItem.deviationLabel === "Deviation" || oItem.deviationLabel === "Run Error");
                this.byId("logJobStatus").setText(bHasDev ? "DEVIATION" : "SUCCESS");
                this.byId("logJobStatus").setState(bHasDev ? "Error" : "Success");
            }

            this.getView().setModel(new JSONModel({ logEntries: oItem.logs || [] }), "logsModel");

            if (oDialog) {
                oDialog.open();
            }

            var LEVEL_TO_STATE = { INFO: "Information", WARNING: "Warning", ERROR: "Error" };
            fetch(Config.AUTH_BASE_URL + "/api/deviation/getControlLogs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: this._getSubdomain(), controlId: oItem.id, limit: 50 })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { throw new Error(oData.message || "getControlLogs failed"); }
                    var aLogs = (oData.logs || []).map(function (l) {
                        return { timestamp: l.timestamp, level: l.level, levelState: LEVEL_TO_STATE[l.level] || "Information", message: l.message };
                    });
                    that.getView().getModel("logsModel").setProperty("/logEntries", aLogs.length ? aLogs : GENERIC_LOGS);
                })
                .catch(function () { /* dialog already opened with the oItem.logs fallback above */ });
        },

        onCloseLogsDialog: function () {
            var oDialog = this.byId("jobLogsDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onDownloadLogs: function () {
            MessageToast.show("Execution log file downloaded successfully.");
        },

        onSearchControls: function (oEvent) {
            var sQuery = "";
            if (oEvent && typeof oEvent.getParameter === "function") {
                var sParamQuery = oEvent.getParameter("query");
                var sParamNewVal = oEvent.getParameter("newValue");
                sQuery = (sParamQuery !== undefined && sParamQuery !== null && sParamQuery !== "") ? sParamQuery : ((sParamNewVal !== undefined && sParamNewVal !== null) ? sParamNewVal : "");
            }
            if ((!sQuery || sQuery === "") && this.byId("searchAutomationId")) {
                sQuery = this.byId("searchAutomationId").getValue();
            }
            sQuery = sQuery ? sQuery.trim() : "";

            var aFilters = [];
            if (sQuery) {
                var oFilterId = new Filter("id", FilterOperator.Contains, sQuery);
                var oFilterDesc = new Filter("description", FilterOperator.Contains, sQuery);
                var oFilterSys1 = new Filter("sysType1", FilterOperator.Contains, sQuery);
                var oFilterSys2 = new Filter("sysType2", FilterOperator.Contains, sQuery);
                var oFilterSys3 = new Filter("sysType3", FilterOperator.Contains, sQuery);
                var oFilterFreq = new Filter("frequencyRun", FilterOperator.Contains, sQuery);
                var oFilterDev = new Filter("deviationLabel", FilterOperator.Contains, sQuery);

                aFilters.push(new Filter({
                    filters: [oFilterId, oFilterDesc, oFilterSys1, oFilterSys2, oFilterSys3, oFilterFreq, oFilterDev],
                    and: false
                }));
            }

            var oTable = this.byId("automationTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },

        onNavControlManagement: function () { this.getOwnerComponent().getRouter().navTo("ControlManagement"); },
        onNavDeviationReport: function () { this.getOwnerComponent().getRouter().navTo("DeviationReport"); },
        onAdmin: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
        onControlManagement: function () { this.getOwnerComponent().getRouter().navTo("ControlManagement"); },
        onControlMonitoring: function () { this.getOwnerComponent().getRouter().navTo("ControlMonitoring"); },
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

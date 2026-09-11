sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "xyraweb/model/sidebarState",
    "xyraweb/model/auditLogService",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationPopover",
    "xyraweb/model/config",
    "xyraweb/model/session",
    "xyraweb/model/mockData",
    "xyraweb/model/controlFrequency"
], function (Controller, UIComponent, JSONModel, MessageToast, MessageBox, Filter, FilterOperator, SidebarState, AuditLogService, GlobalLoading, NotificationPopover, Config, Session, MockData, ControlFrequency) {
    "use strict";

    // Create/Edit moved to the dedicated ControlEditor page (was two modal
    // dialogs here) - this controller only lists/searches/deletes/runs
    // controls now. Rule editing, frequency/cron logic, and the create vs.
    // edit form live in ControlEditor.controller.js.

    return Controller.extend("xyraweb.controller.ControlManagement", {

        onAfterRendering: function () {
            var oToolPage = this.byId("controlManagementToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(SidebarState.get());
            }
            var oNav = this.byId("sideNavigation");
            if (oNav) {
                oNav.setSelectedKey("ControlManagement");
                var oList = oNav.getItem();
                if (oList && oList.setSelectedKey) {
                    oList.setSelectedKey("ControlManagement");
                }
            }
        },

        onInit: function () {
            this.getView().setModel(new JSONModel({ controls: [] }), "controlsModel");
            this.getView().setModel(new JSONModel({ systems: [], systemsWithNone: [] }), "systemsModel");

            // One continuous loading overlay covering both fetches - was
            // sap.ui.core.BusyIndicator before, but GlobalLoading.js patches
            // BusyIndicator.show into a no-op app-wide, so nothing was ever
            // visible here: the page just sat on an empty table until data
            // quietly arrived.
            GlobalLoading.show("Loading Controls", 0, true, true);
            var that = this;
            this._loadSystemsForDisplay()
                .then(function () { return that._loadControls(); })
                .then(function () { GlobalLoading.hide(); });
        },

        _getSubdomain: function () {
            var oSession = Session.get();
            return (oSession && oSession.subdomain) || Config.TEST_SUBDOMAIN;
        },

        // Real Systems, used to translate a Control's systemIds back into
        // display text (sysType1/2/3 columns) for the table.
        _loadSystemsForDisplay: function () {
            var that = this;
            return fetch(Config.AUTH_BASE_URL + "/api/system-config/listSystems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: this._getSubdomain() })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { throw new Error(oData.message || "listSystems failed"); }
                    that._applySystemsList(oData.systems || []);
                })
                .catch(function () {
                    MockData.notice(MessageToast);
                    that._applySystemsList((MockData.systems || []).map(function (s) { return { id: s.id, sysId: s.sysId }; }));
                });
        },

        _applySystemsList: function (aSystems) {
            this._systemsById = {};
            aSystems.forEach(function (s) { this._systemsById[s.id] = s.sysId; }.bind(this));
            var oSystemsModel = this.getView().getModel("systemsModel");
            oSystemsModel.setProperty("/systems", aSystems);
            oSystemsModel.setProperty("/systemsWithNone", [{ id: "None", sysId: "-- None --" }].concat(aSystems));
        },

        _sysDisplay: function (sId) {
            if (!sId) { return "None"; }
            return (this._systemsById && this._systemsById[sId]) || sId;
        },

        // Bridges one backend ControlEntry to a table row - carries both the
        // display-only fields the table renders (sysType1/2/3, frequencyRun,
        // totalRun) and the raw fields edit/delete/run need (dbId, code as `id`
        // for display continuity, systemIds, frequency).
        _mapControlEntryToRow: function (c) {
            var aIds = c.systemIds || [];
            var sFreqUi = ControlFrequency.FREQ_BE_TO_UI[c.frequency] || "Daily";
            return {
                id: c.code,
                dbId: c.id,
                description: c.description,
                sysType1: this._sysDisplay(aIds[0]),
                sysType2: this._sysDisplay(aIds[1]),
                sysType3: this._sysDisplay(aIds[2]),
                frequencyRun: sFreqUi,
                cronExpr: c.cronExpression || "",
                totalRun: ControlFrequency.calculateTotalRun(sFreqUi, c.cronExpression),
                category: c.category,
                controlType: c.controlType,
                critical: c.critical,
                enabled: c.enabled,
                systemIds: aIds,
                frequency: c.frequency,
                rules: c.rules || [],
                lastRunAt: c.lastRunAt,
                lastRunStatus: c.lastRunStatus,
                nextRunAt: c.nextRunAt,
                createdBy: c.createdBy,
                createdDate: c.createdAt,
                modifiedBy: c.modifiedBy,
                modifiedDate: c.modifiedAt
            };
        },

        _loadControls: function () {
            var that = this;
            return fetch(Config.AUTH_BASE_URL + "/api/control/listControls", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: this._getSubdomain() })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { throw new Error(oData.message || "listControls failed"); }
                    var aRows = (oData.controls || []).map(that._mapControlEntryToRow, that);
                    that.getView().getModel("controlsModel").setProperty("/controls", aRows);
                })
                .catch(function () {
                    MockData.notice(MessageToast);
                    var aRows = (MockData.controls || []).map(that._mapControlEntryToRow, that);
                    that.getView().getModel("controlsModel").setProperty("/controls", aRows);
                });
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("controlManagementToolPage");
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
                    UIComponent.getRouterFor(this).navTo(sKey);
                }
            }
        },

        onCreateControl: function () {
            UIComponent.getRouterFor(this).navTo("ControlEditor", {});
        },

        onEditControl: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("controlsModel");
            var oItem = oContext.getObject();
            UIComponent.getRouterFor(this).navTo("ControlEditor", { controlId: oItem.dbId });
        },

        onDeleteControl: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("controlsModel");
            var oItem = oContext.getObject();
            var that = this;

            MessageBox.confirm("Are you sure you want to delete Security Control '" + oItem.id + "'?", {
                onClose: function (oAction) {
                    if (oAction !== MessageBox.Action.OK) { return; }

                    GlobalLoading.show("Deleting Security Control", 0, true, true);
                    fetch(Config.AUTH_BASE_URL + "/api/control/deleteControl", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ subdomain: that._getSubdomain(), id: oItem.dbId })
                    })
                        .then(function (r) { return r.json(); })
                        .then(function (oData) {
                            GlobalLoading.hide();
                            if (!oData.success) {
                                MessageBox.error(oData.message || "Could not delete control.");
                                return;
                            }
                            MessageToast.show("Security Control '" + oItem.id + "' deleted.");
                            AuditLogService.addLog({
                                action: "Delete",
                                module: "Control Management",
                                objectId: oItem.id,
                                description: "Deleted Security Control Master rule '" + oItem.id + "': " + oItem.description,
                                previousValue: "Control ID: " + oItem.id + " | Desc: " + oItem.description + " | Freq: " + oItem.frequencyRun,
                                newValue: "Record Deleted",
                                result: "Success"
                            });
                            that._loadControls();
                        })
                        .catch(function () {
                            GlobalLoading.hide();
                            MockData.notice(MessageToast);
                            var aMockControls = MockData.controls || [];
                            var iIndex = -1;
                            aMockControls.forEach(function (c, idx) { if (c.id === oItem.dbId) { iIndex = idx; } });
                            if (iIndex !== -1) { aMockControls.splice(iIndex, 1); }
                            that._loadControls();
                        });
                }
            });
        },

        onRunControlNow: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("controlsModel");
            var oItem = oContext.getObject();
            var that = this;

            GlobalLoading.show("Running Security Control", 0, true, true);
            fetch(Config.AUTH_BASE_URL + "/api/control/runControlNow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: this._getSubdomain(), id: oItem.dbId })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    GlobalLoading.hide();
                    if (!oData.success) {
                        MessageBox.error(oData.message || "Run failed.");
                        return;
                    }
                    MessageToast.show("Run complete: " + oData.deviationsFound + " deviation(s) found, " + oData.alertsCreated + " alert(s) created.");
                    that._loadControls();
                })
                .catch(function () {
                    GlobalLoading.hide();
                    MessageBox.error("Could not reach the server to run this control.");
                });
        },

        onSearchControls: function (oEvent) {
            var sQuery = "";
            if (oEvent && typeof oEvent.getParameter === "function") {
                var sParamQuery = oEvent.getParameter("query");
                var sParamNewVal = oEvent.getParameter("newValue");
                sQuery = (sParamQuery !== undefined && sParamQuery !== null && sParamQuery !== "") ? sParamQuery : ((sParamNewVal !== undefined && sParamNewVal !== null) ? sParamNewVal : "");
            }
            if ((!sQuery || sQuery === "") && this.byId("searchControlId")) {
                sQuery = this.byId("searchControlId").getValue();
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

                aFilters.push(new Filter({
                    filters: [oFilterId, oFilterDesc, oFilterSys1, oFilterSys2, oFilterSys3, oFilterFreq],
                    and: false
                }));
            }

            var oTable = this.byId("controlsTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },

        onAdmin: function () { UIComponent.getRouterFor(this).navTo("Admin"); },
        onNavAutomationMonitoring: function () { UIComponent.getRouterFor(this).navTo("AutomationMonitoring"); },
        onControlManagement: function () { UIComponent.getRouterFor(this).navTo("ControlManagement"); },
        onAIInsights: function () { UIComponent.getRouterFor(this).navTo("AIInsights"); },
        onSOXCompliance: function () { UIComponent.getRouterFor(this).navTo("SOXCompliance"); },
        onReports: function () { UIComponent.getRouterFor(this).navTo("Reports"); },
        onDeviationReport: function () { UIComponent.getRouterFor(this).navTo("DeviationReport"); },
        onAuditLogs: function () { UIComponent.getRouterFor(this).navTo("AuditLogs"); },
        onConfiguration: function () { UIComponent.getRouterFor(this).navTo("Configuration"); },
        onAccessManagement: function () { UIComponent.getRouterFor(this).navTo("AccessManagement"); },
        onOrganization: function () { UIComponent.getRouterFor(this).navTo("Organization"); },
        onRiskAnalytics: function () { UIComponent.getRouterFor(this).navTo("RiskAnalytics"); },
        onSystemHealth: function () { UIComponent.getRouterFor(this).navTo("SystemHealth"); },
        onProfile: function () { UIComponent.getRouterFor(this).navTo("Profile"); },

        onNotificationPress: function (oEvent) {
            NotificationPopover.toggle(oEvent, this);
        },
        onLogout: function () {
            GlobalLoading.logout(this);
        }

    });

});

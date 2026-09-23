sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "xyraweb/model/sidebarState",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationPopover",
    "xyraweb/model/config",
    "xyraweb/model/session",
    "xyraweb/model/mockData",
    "xyraweb/model/controlFrequency"
], function (Controller, UIComponent, JSONModel, MessageToast, MessageBox, Filter, FilterOperator, SidebarState, GlobalLoading, NotificationPopover, Config, Session, MockData, ControlFrequency) {
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

            // Was sap.ui.core.BusyIndicator before, but GlobalLoading.js
            // patches BusyIndicator.show into a no-op app-wide, so nothing
            // was ever visible here: the page just sat on an empty table
            // until data quietly arrived.
            GlobalLoading.show("Loading Controls", 0, true, true);
            this._loadControls().then(function () { GlobalLoading.hide(); });
        },

        _getSubdomain: function () {
            var oSession = Session.get();
            return (oSession && oSession.subdomain) || Config.TEST_SUBDOMAIN;
        },

        _severityState: function (sSeverity) {
            if (sSeverity === "HIGH") { return "Error"; }
            if (sSeverity === "LOW") { return "Success"; }
            return "Warning";
        },

        // Bridges one backend ControlEntry to a table row - carries both the
        // display-only fields the table renders (severity, frequencyRun,
        // totalRun, systemsMapped) and the raw fields edit/delete/run need
        // (dbId, code as `id` for display continuity, frequency). System
        // mapping itself lives on the System Control Config page now -
        // systemsMapped here is just a read-only count of it.
        _mapControlEntryToRow: function (c) {
            var aIds = c.systemIds || [];
            var sFreqUi = ControlFrequency.FREQ_BE_TO_UI[c.frequency] || "Daily";
            var sSeverity = c.severity || "MEDIUM";
            return {
                id: c.code,
                dbId: c.id,
                description: c.description,
                severity: sSeverity.charAt(0) + sSeverity.slice(1).toLowerCase(),
                severityState: this._severityState(sSeverity),
                systemsMapped: aIds.length,
                systemsMappedText: aIds.length === 1 ? "1 system" : aIds.length + " systems",
                frequencyRun: sFreqUi,
                cronExpr: c.cronExpression || "",
                totalRun: ControlFrequency.calculateTotalRun(sFreqUi, c.cronExpression),
                category: c.category,
                controlType: c.controlType,
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

        // Group headers ("Control Management") have sub-items and no key of
        // their own - press="onToggleSideNavGroup" on that item handles the
        // actual toggle; this guard is defense-in-depth in case the click
        // also bubbles up here, so it can never fall through to a navTo.
        onToggleSideNavGroup: function (oEvent) {
            var oItem = oEvent.getSource();
            oItem.setExpanded(!oItem.getExpanded());
        },

        onSideNavItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            if (!oItem) { return; }
            if (oItem.getItems && oItem.getItems().length) {
                oItem.setExpanded(!oItem.getExpanded());
                return;
            }
            var sKey = oItem.getKey();
            if (sKey && this[sKey]) {
                this[sKey]();
            } else if (sKey) {
                UIComponent.getRouterFor(this).navTo(sKey);
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
                        body: JSON.stringify({
                            subdomain: that._getSubdomain(),
                            id: oItem.dbId,
                            performedBy: (Session.get() || {}).email,
                            performedByRole: (Session.get() || {}).role
                        })
                    })
                        .then(function (r) { return r.json(); })
                        .then(function (oData) {
                            GlobalLoading.hide();
                            if (!oData.success) {
                                MessageBox.error(oData.message || "Could not delete control.");
                                return;
                            }
                            MessageToast.show("Security Control '" + oItem.id + "' deleted.");
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
                body: JSON.stringify({
                    subdomain: this._getSubdomain(),
                    id: oItem.dbId,
                    performedBy: (Session.get() || {}).email,
                    performedByRole: (Session.get() || {}).role
                })
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
                var oFilterSeverity = new Filter("severity", FilterOperator.Contains, sQuery);
                var oFilterType = new Filter("controlType", FilterOperator.Contains, sQuery);
                var oFilterFreq = new Filter("frequencyRun", FilterOperator.Contains, sQuery);

                aFilters.push(new Filter({
                    filters: [oFilterId, oFilterDesc, oFilterSeverity, oFilterType, oFilterFreq],
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
        onSystemControlConfig: function () { UIComponent.getRouterFor(this).navTo("SystemControlConfig"); },
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

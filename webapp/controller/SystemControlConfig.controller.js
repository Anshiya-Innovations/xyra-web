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

    return Controller.extend("xyraweb.controller.SystemControlConfig", {

        onInit: function () {
            this.getView().setModel(new JSONModel({ mappings: [] }), "mappingsModel");
            this.getView().setModel(new JSONModel({ controls: [], systems: [], summary: {} }), "addModel");

            GlobalLoading.show("Loading System Control Config", 0, true, true);
            this._loadMappings().then(function () { GlobalLoading.hide(); });
        },

        onAfterRendering: function () {
            var oToolPage = this.byId("systemControlConfigToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(SidebarState.get());
            }
            var oNav = this.byId("sideNavigation");
            if (oNav) {
                oNav.setSelectedKey("SystemControlConfig");
                var oList = oNav.getItem();
                if (oList && oList.setSelectedKey) {
                    oList.setSelectedKey("SystemControlConfig");
                }
            }
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

        _titleCase: function (s) {
            return s ? s.charAt(0) + s.slice(1).toLowerCase() : "";
        },

        _mapConfigToRow: function (c) {
            var sFreqUi = ControlFrequency.FREQ_BE_TO_UI[c.controlFrequency] || c.controlFrequency || "Daily";
            return {
                id: c.id,
                controlId: c.controlId,
                controlCode: c.controlCode,
                controlDescription: c.controlDescription,
                systemId: c.systemId,
                systemCode: c.systemCode,
                systemClient: c.systemClient,
                severityText: this._titleCase(c.controlSeverity),
                severityState: this._severityState(c.controlSeverity),
                frequencyText: sFreqUi,
                enabled: !!c.enabled,
                statusText: c.enabled ? "Active" : "Inactive",
                statusState: c.enabled ? "Success" : "None",
                statusIcon: c.enabled ? "sap-icon://status-positive" : "sap-icon://status-inactive",
                createdAt: c.createdAt,
                deactivatedAt: c.deactivatedAt,
                runCount: c.runCount || 0,
                lastRunAt: c.lastRunAt,
                lastRunStatus: c.lastRunStatus
            };
        },

        _loadMappings: function () {
            var that = this;
            return fetch(Config.AUTH_BASE_URL + "/api/system-control-config/listSystemControlConfigs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: this._getSubdomain() })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { throw new Error(oData.message || "listSystemControlConfigs failed"); }
                    var aRows = (oData.configs || []).map(that._mapConfigToRow, that);
                    that.getView().getModel("mappingsModel").setProperty("/mappings", aRows);
                })
                .catch(function () {
                    MockData.notice(MessageToast);
                    var aRows = (MockData.systemControlConfigs || []).map(that._mapConfigToRow, that);
                    that.getView().getModel("mappingsModel").setProperty("/mappings", aRows);
                });
        },

        onSearchMappings: function (oEvent) {
            var sQuery = "";
            if (oEvent && typeof oEvent.getParameter === "function") {
                var sParamQuery = oEvent.getParameter("query");
                var sParamNewVal = oEvent.getParameter("newValue");
                sQuery = (sParamQuery !== undefined && sParamQuery !== null && sParamQuery !== "") ? sParamQuery : ((sParamNewVal !== undefined && sParamNewVal !== null) ? sParamNewVal : "");
            }
            sQuery = sQuery ? sQuery.trim() : "";

            var aFilters = [];
            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("controlCode", FilterOperator.Contains, sQuery),
                        new Filter("controlDescription", FilterOperator.Contains, sQuery),
                        new Filter("systemCode", FilterOperator.Contains, sQuery),
                        new Filter("statusText", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }

            var oTable = this.byId("mappingsTable");
            var oBinding = oTable && oTable.getBinding("items");
            if (oBinding) { oBinding.filter(aFilters); }
        },

        // --- Add mapping dialog --------------------------------------------

        onAddMapping: function () {
            var that = this;
            var oAddModel = this.getView().getModel("addModel");
            oAddModel.setProperty("/summary", {});
            if (this.byId("mappingControlSelect")) { this.byId("mappingControlSelect").setSelectedKey(""); }
            if (this.byId("mappingSystemSelect")) { this.byId("mappingSystemSelect").setSelectedKey(""); }

            GlobalLoading.show("Loading Controls & Systems", 0, true, true);
            fetch(Config.AUTH_BASE_URL + "/api/system-control-config/listMappableControlsAndSystems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: this._getSubdomain() })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    GlobalLoading.hide();
                    if (!oData.success) {
                        MessageBox.error(oData.message || "Could not load controls/systems.");
                        return;
                    }
                    oAddModel.setProperty("/controls", oData.controls || []);
                    oAddModel.setProperty("/systems", oData.systems || []);
                    var oDialog = that.byId("addMappingDialog");
                    if (oDialog) { oDialog.open(); }
                })
                .catch(function () {
                    GlobalLoading.hide();
                    MessageBox.error("Could not reach the server. Is xyra-core running?");
                });
        },

        // Recomputes the "this control will run on this system at this
        // frequency, status Active" preview as soon as both pickers have a
        // value - the whole point of showing it before Save.
        onMappingSelectionChange: function () {
            var oAddModel = this.getView().getModel("addModel");
            var sControlId = this.byId("mappingControlSelect").getSelectedKey();
            var sSystemId = this.byId("mappingSystemSelect").getSelectedKey();
            if (!sControlId || !sSystemId) {
                oAddModel.setProperty("/summary", {});
                return;
            }
            var oControl = (oAddModel.getProperty("/controls") || []).filter(function (c) { return c.id === sControlId; })[0];
            var oSystem = (oAddModel.getProperty("/systems") || []).filter(function (s) { return s.id === sSystemId; })[0];
            if (!oControl || !oSystem) {
                oAddModel.setProperty("/summary", {});
                return;
            }
            oAddModel.setProperty("/summary", {
                controlCode: oControl.code,
                systemCode: oSystem.sysId + "/" + oSystem.client,
                frequency: (ControlFrequency.FREQ_BE_TO_UI[oControl.frequency] || oControl.frequency || "Daily").toLowerCase()
            });
        },

        onCloseAddMappingDialog: function () {
            var oDialog = this.byId("addMappingDialog");
            if (oDialog) { oDialog.close(); }
        },

        onSaveMapping: function () {
            var sControlId = this.byId("mappingControlSelect").getSelectedKey();
            var sSystemId = this.byId("mappingSystemSelect").getSelectedKey();
            if (!sControlId || !sSystemId) {
                MessageBox.error("Please select both a Control and a System.");
                return;
            }

            var that = this;
            GlobalLoading.show("Saving Mapping", 0, true, true);
            fetch(Config.AUTH_BASE_URL + "/api/system-control-config/createSystemControlConfig", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subdomain: this._getSubdomain(),
                    controlId: sControlId,
                    systemId: sSystemId,
                    performedBy: (Session.get() || {}).email,
                    performedByRole: (Session.get() || {}).role
                })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    GlobalLoading.hide();
                    if (!oData.success) {
                        MessageBox.error(oData.message || "Could not save this mapping.");
                        return;
                    }
                    MessageToast.show("Control mapped to system — status Active.");
                    that.onCloseAddMappingDialog();
                    that._loadMappings();
                })
                .catch(function () {
                    GlobalLoading.hide();
                    MessageBox.error("Could not reach the server. Is xyra-core running?");
                });
        },

        onRunNow: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("mappingsModel").getObject();
            var that = this;

            GlobalLoading.show("Running Control", 0, true, true);
            fetch(Config.AUTH_BASE_URL + "/api/system-control-config/runSystemControlConfigNow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subdomain: this._getSubdomain(),
                    id: oItem.id,
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
                    that._loadMappings();
                })
                .catch(function () {
                    GlobalLoading.hide();
                    MessageBox.error("Could not reach the server to run this control.");
                });
        },

        // --- Activate / Deactivate ------------------------------------------

        _setStatus: function (oItem, bEnabled) {
            var that = this;
            GlobalLoading.show(bEnabled ? "Activating" : "Deactivating", 0, true, true);
            fetch(Config.AUTH_BASE_URL + "/api/system-control-config/setSystemControlConfigStatus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subdomain: this._getSubdomain(),
                    id: oItem.id,
                    enabled: bEnabled,
                    performedBy: (Session.get() || {}).email,
                    performedByRole: (Session.get() || {}).role
                })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    GlobalLoading.hide();
                    if (!oData.success) {
                        MessageBox.error(oData.message || "Could not update status.");
                        return;
                    }
                    MessageToast.show("Mapping " + (bEnabled ? "activated" : "deactivated") + ".");
                    that._loadMappings();
                })
                .catch(function () {
                    GlobalLoading.hide();
                    MessageBox.error("Could not reach the server. Is xyra-core running?");
                });
        },

        onActivate: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("mappingsModel").getObject();
            this._setStatus(oItem, true);
        },

        onDeactivate: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("mappingsModel").getObject();
            var that = this;
            MessageBox.confirm(
                "Stop running '" + oItem.controlCode + "' on system '" + oItem.systemCode + "'?",
                {
                    onClose: function (oAction) {
                        if (oAction !== MessageBox.Action.OK) { return; }
                        that._setStatus(oItem, false);
                    }
                }
            );
        },

        onOpenDetails: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext
                ? oEvent.getSource().getBindingContext("mappingsModel")
                : null;
            if (!oContext) { return; }
            var oItem = oContext.getObject();
            UIComponent.getRouterFor(this).navTo("SystemControlConfigDetails", { configId: oItem.id });
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("systemControlConfigToolPage");
            if (oToolPage) {
                var bExpanded = !oToolPage.getSideExpanded();
                oToolPage.setSideExpanded(bExpanded);
                SidebarState.save(bExpanded);
            }
        },

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

        onAdmin: function () { UIComponent.getRouterFor(this).navTo("Admin"); },
        onControlManagement: function () { UIComponent.getRouterFor(this).navTo("ControlManagement"); },
        onSystemControlConfig: function () { UIComponent.getRouterFor(this).navTo("SystemControlConfig"); },
        onDeviationReport: function () { UIComponent.getRouterFor(this).navTo("DeviationReport"); },
        onAIInsights: function () { UIComponent.getRouterFor(this).navTo("AIInsights"); },
        onSOXCompliance: function () { UIComponent.getRouterFor(this).navTo("SOXCompliance"); },
        onReports: function () { UIComponent.getRouterFor(this).navTo("Reports"); },
        onAuditLogs: function () { UIComponent.getRouterFor(this).navTo("AuditLogs"); },
        onConfiguration: function () { UIComponent.getRouterFor(this).navTo("Configuration"); },
        onAccessManagement: function () { UIComponent.getRouterFor(this).navTo("AccessManagement"); },
        onOrganization: function () { UIComponent.getRouterFor(this).navTo("Organization"); },
        onRiskAnalytics: function () { UIComponent.getRouterFor(this).navTo("RiskAnalytics"); },
        onProfile: function () { UIComponent.getRouterFor(this).navTo("Profile"); },

        onNotificationPress: function (oEvent) {
            NotificationPopover.toggle(oEvent, this);
        },
        onLogout: function () {
            GlobalLoading.logout(this);
        }

    });

});

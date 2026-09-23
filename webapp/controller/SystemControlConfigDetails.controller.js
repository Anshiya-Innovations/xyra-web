sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationPopover",
    "xyraweb/model/config",
    "xyraweb/model/session",
    "xyraweb/model/controlFrequency"
], function (Controller, UIComponent, JSONModel, MessageToast, MessageBox, GlobalLoading, NotificationPopover, Config, Session, ControlFrequency) {
    "use strict";

    function formatTimestamp(sIso) {
        if (!sIso) { return "—"; }
        var d = new Date(sIso);
        if (isNaN(d.getTime())) { return "—"; }
        return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0") +
            " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    }

    function levelState(sLevel) {
        if (sLevel === "ERROR") { return "Error"; }
        if (sLevel === "WARNING") { return "Warning"; }
        return "Information";
    }

    function runStatusState(sStatus) {
        if (sStatus === "PASS") { return "Success"; }
        if (sStatus === "FAIL" || sStatus === "ERROR") { return "Error"; }
        return "None";
    }

    return Controller.extend("xyraweb.controller.SystemControlConfigDetails", {

        onInit: function () {
            this.getView().setModel(new JSONModel({ logs: [] }), "detailsModel");
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("SystemControlConfigDetails").attachPatternMatched(this._onRouteMatched, this);
        },

        _getSubdomain: function () {
            var oSession = Session.get();
            return (oSession && oSession.subdomain) || Config.TEST_SUBDOMAIN;
        },

        _onRouteMatched: function (oEvent) {
            this._configId = oEvent.getParameter("arguments").configId;
            this._loadDetails();
        },

        _loadDetails: function () {
            var that = this;
            GlobalLoading.show("Loading Mapping Details", 0, true, true);
            return fetch(Config.AUTH_BASE_URL + "/api/system-control-config/getSystemControlConfigDetail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: this._getSubdomain(), id: this._configId })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    GlobalLoading.hide();
                    if (!oData.success || !oData.detail) {
                        MessageBox.error(oData.message || "Could not load this mapping.");
                        UIComponent.getRouterFor(that).navTo("SystemControlConfig");
                        return;
                    }
                    that._applyDetail(oData.detail, oData.logs || []);
                })
                .catch(function () {
                    GlobalLoading.hide();
                    MessageBox.error("Could not reach the server. Is xyra-core running?");
                    UIComponent.getRouterFor(that).navTo("SystemControlConfig");
                });
        },

        _applyDetail: function (d, aLogs) {
            var sSeverity = d.controlSeverity || "MEDIUM";
            var sFreqUi = ControlFrequency.FREQ_BE_TO_UI[d.controlFrequency] || d.controlFrequency || "Daily";
            this._raw = d;

            this.getView().getModel("detailsModel").setData({
                controlCode: d.controlCode,
                controlDescription: d.controlDescription,
                systemCode: d.systemCode,
                systemClient: d.systemClient,
                controlType: d.controlType,
                severityText: sSeverity.charAt(0) + sSeverity.slice(1).toLowerCase(),
                severityState: sSeverity === "HIGH" ? "Error" : (sSeverity === "LOW" ? "Success" : "Warning"),
                frequencyText: sFreqUi,
                enabled: !!d.enabled,
                statusText: d.enabled ? "Active" : "Inactive",
                statusState: d.enabled ? "Success" : "None",
                statusIcon: d.enabled ? "sap-icon://status-positive" : "sap-icon://status-inactive",
                createdText: formatTimestamp(d.createdAt),
                deactivatedText: d.deactivatedAt ? formatTimestamp(d.deactivatedAt) : "—",
                runCount: d.runCount || 0,
                lastRunText: d.lastRunAt ? formatTimestamp(d.lastRunAt) : "Never run yet",
                lastRunStatusText: d.lastRunStatus || "—",
                lastRunStatusState: runStatusState(d.lastRunStatus),
                logs: aLogs.map(function (l) {
                    return {
                        timestampText: formatTimestamp(l.timestamp),
                        level: l.level,
                        levelState: levelState(l.level),
                        message: l.message
                    };
                })
            });
        },

        _setStatus: function (bEnabled) {
            var that = this;
            GlobalLoading.show(bEnabled ? "Activating" : "Deactivating", 0, true, true);
            fetch(Config.AUTH_BASE_URL + "/api/system-control-config/setSystemControlConfigStatus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subdomain: this._getSubdomain(),
                    id: this._configId,
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
                    that._loadDetails();
                })
                .catch(function () {
                    GlobalLoading.hide();
                    MessageBox.error("Could not reach the server. Is xyra-core running?");
                });
        },

        onRunNow: function () {
            var that = this;
            GlobalLoading.show("Running Control", 0, true, true);
            fetch(Config.AUTH_BASE_URL + "/api/system-control-config/runSystemControlConfigNow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subdomain: this._getSubdomain(),
                    id: this._configId,
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
                    that._loadDetails();
                })
                .catch(function () {
                    GlobalLoading.hide();
                    MessageBox.error("Could not reach the server to run this control.");
                });
        },

        onActivate: function () {
            this._setStatus(true);
        },

        onDeactivate: function () {
            var that = this;
            var d = this._raw || {};
            MessageBox.confirm(
                "Stop running '" + d.controlCode + "' on system '" + d.systemCode + "'?",
                {
                    onClose: function (oAction) {
                        if (oAction !== MessageBox.Action.OK) { return; }
                        that._setStatus(false);
                    }
                }
            );
        },

        onNavBack: function () {
            UIComponent.getRouterFor(this).navTo("SystemControlConfig");
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("detailsToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
            }
        },

        onSideNavItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            if (!oItem) { return; }
            var sKey = oItem.getKey();
            if (sKey) { UIComponent.getRouterFor(this).navTo(sKey); }
        },

        onAdmin: function () { UIComponent.getRouterFor(this).navTo("Admin"); },
        onControlManagement: function () { UIComponent.getRouterFor(this).navTo("ControlManagement"); },

        onNotificationPress: function (oEvent) {
            NotificationPopover.toggle(oEvent, this);
        },
        onLogout: function () {
            GlobalLoading.logout(this);
        }

    });

});

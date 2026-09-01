sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "xyraweb/service/DeviationClient",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/config",
    "xyraweb/model/session"
], function (Controller, MessageToast, JSONModel, DeviationService, GlobalLoading, Config, Session) {
    "use strict";

    return Controller.extend("xyraweb.controller.AlertItem", {

        onInit: function () {
            var oModel = new JSONModel({
                header: {},
                items: []
            });
            this.getView().setModel(oModel, "alertModel");

            this.getOwnerComponent().getRouter().getRoute("AlertItem").attachPatternMatched(this._onPatternMatched, this);
        },

        _onPatternMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._sAlertId = oArgs.alertId;
            this._sControlId = oArgs.controlId;
            this._aCachedLogs = null; // new alert - drop any cached run logs from a previous one

            var oModel = this.getView().getModel("alertModel");
            DeviationService.getAlertDetails(this._sAlertId, this._sControlId).then(function (oDetails) {
                oModel.setProperty("/header", oDetails.header);
                oModel.setProperty("/items", oDetails.items);
            });
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("DeviationReport");
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("alertItemToolPage");
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

        // ControlRunLogs are scoped to a whole alert/run, not a single deviation
        // line item - the log rows shown here are alert-wide regardless of which
        // row's button was clicked (that's the truthful shape of the data), but
        // the dialog header/status still reflects the clicked item for context.
        onOpenItemLogs: function (oEvent) {
            var oItemContext = oEvent.getSource().getBindingContext("alertModel");
            var oItem = oItemContext ? oItemContext.getObject() : {};
            var oHeader = this.getView().getModel("alertModel").getProperty("/header") || {};
            var that = this;

            var sControlId = oHeader.controlId || "";
            var sControlName = oHeader.controlName || "";

            if (!this.getView().getModel("logsModel")) {
                this.getView().setModel(new JSONModel({ logEntries: [] }), "logsModel");
            }

            if (this.byId("logItemIdTitle")) {
                this.byId("logItemIdTitle").setText("Control ID: " + sControlId + " (" + (oItem.itemId || "") + ")");
            }
            if (this.byId("logItemDescText")) {
                this.byId("logItemDescText").setText(sControlName);
            }
            if (this.byId("logItemStatus")) {
                this.byId("logItemStatus").setText(oItem.status === "Critical" ? "FAILED" : "DEVIATION");
                this.byId("logItemStatus").setState(oItem.status === "Critical" ? "Error" : "Warning");
            }

            var oDialog = this.byId("itemLogsDialog");
            if (oDialog) {
                oDialog.open();
            }

            this._getRunLogs().then(function (aLogs) {
                that.getView().getModel("logsModel").setProperty("/logEntries", aLogs);
            });
        },

        // Cached per alertId (cleared in _onPatternMatched) so opening Logs on
        // several rows for the same alert only fetches once.
        _getRunLogs: function () {
            if (this._aCachedLogs) {
                return Promise.resolve(this._aCachedLogs);
            }
            var that = this;
            var sSubdomain = (Session.get() && Session.get().subdomain) || Config.TEST_SUBDOMAIN;
            var LEVEL_TO_STATE = { INFO: "Information", WARNING: "Warning", ERROR: "Error" };

            return fetch(Config.AUTH_BASE_URL + "/api/deviation/getRunLogs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: sSubdomain, alertId: this._sAlertId })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { throw new Error(oData.message || "getRunLogs failed"); }
                    that._aCachedLogs = (oData.logs || []).map(function (l) {
                        return { timestamp: l.timestamp, level: l.level, levelState: LEVEL_TO_STATE[l.level] || "Information", message: l.message };
                    });
                    return that._aCachedLogs;
                })
                .catch(function () {
                    return [{ timestamp: new Date().toISOString(), level: "WARNING", levelState: "Warning", message: "Could not reach the server - showing no log data." }];
                });
        },

        onCloseLogsDialog: function () {
            var oDialog = this.byId("itemLogsDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onDownloadLogs: function () {
            MessageToast.show("Downloading automation execution log trace...");
        },

        onRefresh: function () {
            if (!this._sAlertId) { return; }
            var that = this;
            var oModel = this.getView().getModel("alertModel");
            this._aCachedLogs = null;
            DeviationService.getAlertDetails(this._sAlertId, this._sControlId).then(function (oDetails) {
                oModel.setProperty("/header", oDetails.header);
                oModel.setProperty("/items", oDetails.items);
                MessageToast.show("Alert line items refreshed.");
            });
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
        onProfile: function () { this.getOwnerComponent().getRouter().navTo("Profile"); },

        onLogout: function () {
            GlobalLoading.logout(this);
        }

    });
});

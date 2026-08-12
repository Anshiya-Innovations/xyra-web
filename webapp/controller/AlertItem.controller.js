sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "xyraweb/service/DeviationService"
], function (Controller, MessageToast, JSONModel, DeviationService) {
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
            var sAlertId = oArgs.alertId;
            var sControlId = oArgs.controlId;

            var oDetails = DeviationService.getAlertDetails(sAlertId, sControlId);
            var oModel = this.getView().getModel("alertModel");

            oModel.setProperty("/header", oDetails.header);
            oModel.setProperty("/items", oDetails.items);
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

        onOpenItemLogs: function (oEvent) {
            var oItemContext = oEvent.getSource().getBindingContext("alertModel");
            var oItem = oItemContext ? oItemContext.getObject() : {};
            var oHeader = this.getView().getModel("alertModel").getProperty("/header") || {};

            var sControlId = oHeader.controlId || "NLG08";
            var sControlName = oHeader.controlName || "Basis Kernel Audit Logging";
            var sTimestamp = oItem.timestamp || "2026-08-10 14:32:05";

            var aLogs = [
                {
                    timestamp: sTimestamp,
                    level: "INFO",
                    levelState: "Information",
                    message: "Automated daily monitoring job initiated for " + sControlId + " (" + (oItem.itemId || "ITM-101") + ")."
                },
                {
                    timestamp: sTimestamp,
                    level: "INFO",
                    levelState: "Information",
                    message: "Connected to SAP S/4HANA target system node (" + (oHeader.system || "MY8") + " Client " + (oHeader.client || "100") + ")."
                },
                {
                    timestamp: sTimestamp,
                    level: oItem.status === "Critical" ? "ERROR" : "WARNING",
                    levelState: oItem.status === "Critical" ? "Error" : "Warning",
                    message: "Deviation detected for " + (oItem.sapObject || "SAP Object") + ": Expected '" + (oItem.expectedValue || "SUM") + "', Actual detected '" + (oItem.actualValue || "SWPM") + "'."
                }
            ];

            if (!this.getView().getModel("logsModel")) {
                this.getView().setModel(new JSONModel({ logEntries: [] }), "logsModel");
            }
            this.getView().getModel("logsModel").setProperty("/logEntries", aLogs);

            if (this.byId("logItemIdTitle")) {
                this.byId("logItemIdTitle").setText("Control ID: " + sControlId + " (" + (oItem.itemId || "ITM-101") + ")");
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
            MessageToast.show("Alert line items refreshed.");
        },

        onLogout: function () {
            this.getOwnerComponent().getRouter().navTo("Login");
        }

    });
});

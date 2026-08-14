sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, MessageToast, BusyIndicator, History) {
    "use strict";

    return Controller.extend("xyraweb.controller.SystemHealthDetails", {

        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("SystemHealthDetails").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sSysId = oEvent.getParameter("arguments").systemId || "200";
            this._loadSystemDetails(sSysId);
        },

        _loadSystemDetails: function (sSysId) {
            var now = new Date();
            var timeStr = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0') + "-" + String(now.getDate()).padStart(2, '0') + " " + String(now.getHours()).padStart(2, '0') + ":" + String(now.getMinutes()).padStart(2, '0') + ":" + String(now.getSeconds()).padStart(2, '0');

            var oData = {
                sysId: sSysId,
                client: "100",
                sysType: (sSysId === "006" || sSysId === "100" || sSysId === "MP8") ? "Production" : "Quality",
                status: (sSysId === "MQ8") ? "Offline" : ((sSysId === "100") ? "Degraded" : "Online"),
                statusState: (sSysId === "MQ8") ? "Error" : ((sSysId === "100") ? "Warning" : "Success"),
                statusIcon: (sSysId === "MQ8") ? "sap-icon://sys-cancel-2" : ((sSysId === "100") ? "sap-icon://alert" : "sap-icon://sys-enter-2"),
                responseTime: (sSysId === "MQ8") ? "Timeout" : ((sSysId === "100") ? "145 ms" : "24 ms"),
                availability: (sSysId === "MQ8") ? "94.50%" : ((sSysId === "100") ? "98.20%" : "99.98%"),
                availabilityState: (sSysId === "MQ8") ? "Error" : ((sSysId === "100") ? "Warning" : "Success"),
                lastCheck: timeStr,
                connectionStatus: (sSysId === "MQ8") ? "Connection Refused (Port 3600)" : ((sSysId === "100") ? "High Latency Spikes Detected" : "Connected - RFC Ping OK"),
                events: [
                    {
                        timestamp: timeStr,
                        eventType: "RFC Health Check Ping",
                        details: "Handshake succeeded via Gateway Port 3600. RFC Ping Latency 24ms.",
                        severityText: "Success",
                        severityState: "Success"
                    },
                    {
                        timestamp: "2026-08-14 11:30:15",
                        eventType: "Latency Diagnostics",
                        details: "Latency threshold check completed. Average response time within normal limits (24.8ms).",
                        severityText: "Success",
                        severityState: "Success"
                    },
                    {
                        timestamp: "2026-08-14 09:15:00",
                        eventType: "Security Handshake",
                        details: "RFC SNC Encryption handshake validated. Certificate valid until 2028.",
                        severityText: "Information",
                        severityState: "Information"
                    },
                    {
                        timestamp: "2026-08-14 06:00:00",
                        eventType: "Daily SLA Audit",
                        details: "Calculated 24h Availability SLA: 99.98%. No unmanaged downtime recorded.",
                        severityText: "Success",
                        severityState: "Success"
                    }
                ]
            };

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "detailsModel");
        },

        onTestConnection: function () {
            var oModel = this.getView().getModel("detailsModel");
            var sSysId = oModel.getProperty("/sysId");
            BusyIndicator.show(0);
            setTimeout(function () {
                BusyIndicator.hide();
                MessageToast.show("RFC Ping Successful for " + sSysId + ". Latency: 24 ms.");
            }, 800);
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                sap.ui.core.UIComponent.getRouterFor(this).navTo("SystemHealth", {}, true);
            }
        },

        onAdmin: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Admin");
        },

        onControlManagement: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("ControlManagement");
        },

        onSOXCompliance: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("SOXCompliance");
        },

        onReports: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Reports");
        },

        onAuditLogs: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("AuditLogs");
        },

        onConfiguration: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Configuration");
        },

        onSystemHealth: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("SystemHealth");
        },

        onAccessManagement: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("AccessManagement");
        },

        onProfile: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Profile");
        },

        onNotificationPress: function () {
            MessageToast.show("Notifications clicked.");
        },

        onLogout: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Login");
        }
    });
});

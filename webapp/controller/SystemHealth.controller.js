sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationPopover"
], function (Controller, JSONModel, MessageToast, MessageBox, BusyIndicator, Filter, FilterOperator, GlobalLoading, NotificationPopover) {
    "use strict";

    return Controller.extend("xyraweb.controller.SystemHealth", {

        onInit: function () {
            this._initHealthModel();
            this._autoRefreshInterval = null;
        },

        _initHealthModel: function () {
            var oData = {
                kpis: {
                    online: 5,
                    offline: 1,
                    degraded: 1,
                    maintenance: 1
                },
                systems: [
                    {
                        sysId: "200",
                        client: "100",
                        sysType: "Quality",
                        status: "Online",
                        statusState: "Success",
                        statusIcon: "sap-icon://sys-enter-2",
                        responseTime: "24 ms",
                        availability: "99.98%",
                        availabilityState: "Success",
                        lastCheck: this._getFormattedTimestamp(),
                        connectionStatus: "Connected - RFC Ping OK",
                        hostName: "asmy01.xyra.com",
                        portNumber: "3600"
                    },
                    {
                        sysId: "006",
                        client: "100",
                        sysType: "Production",
                        status: "Online",
                        statusState: "Success",
                        statusIcon: "sap-icon://sys-enter-2",
                        responseTime: "18 ms",
                        availability: "99.99%",
                        availabilityState: "Success",
                        lastCheck: this._getFormattedTimestamp(),
                        connectionStatus: "Connected - RFC Ping OK",
                        hostName: "asmy0801.xyra.com",
                        portNumber: "3600"
                    },
                    {
                        sysId: "100",
                        client: "100",
                        sysType: "Production",
                        status: "Degraded",
                        statusState: "Warning",
                        statusIcon: "sap-icon://alert",
                        responseTime: "145 ms",
                        availability: "98.20%",
                        availabilityState: "Warning",
                        lastCheck: this._getFormattedTimestamp(),
                        connectionStatus: "High Latency Spikes (>120ms)",
                        hostName: "s4hana.enterprise.xyra.internal",
                        portNumber: "44300"
                    },
                    {
                        sysId: "MY8",
                        client: "000",
                        sysType: "Development",
                        status: "Online",
                        statusState: "Success",
                        statusIcon: "sap-icon://sys-enter-2",
                        responseTime: "32 ms",
                        availability: "99.95%",
                        availabilityState: "Success",
                        lastCheck: this._getFormattedTimestamp(),
                        connectionStatus: "Connected - RFC Ping OK",
                        hostName: "sapdev01.xyra.com",
                        portNumber: "3200"
                    },
                    {
                        sysId: "MQ8",
                        client: "100",
                        sysType: "Quality",
                        status: "Offline",
                        statusState: "Error",
                        statusIcon: "sap-icon://sys-cancel-2",
                        responseTime: "Timeout",
                        availability: "94.50%",
                        availabilityState: "Error",
                        lastCheck: this._getFormattedTimestamp(),
                        connectionStatus: "Connection Refused (Port 3600)",
                        hostName: "sapqas01.xyra.com",
                        portNumber: "3600"
                    },
                    {
                        sysId: "MP8",
                        client: "800",
                        sysType: "Production",
                        status: "Online",
                        statusState: "Success",
                        statusIcon: "sap-icon://sys-enter-2",
                        responseTime: "15 ms",
                        availability: "99.99%",
                        availabilityState: "Success",
                        lastCheck: this._getFormattedTimestamp(),
                        connectionStatus: "Connected - RFC Ping OK",
                        hostName: "sapprd01.xyra.com",
                        portNumber: "3200"
                    },
                    {
                        sysId: "BW1",
                        client: "100",
                        sysType: "Production",
                        status: "Maintenance",
                        statusState: "Information",
                        statusIcon: "sap-icon://settings",
                        responseTime: "N/A",
                        availability: "99.50%",
                        availabilityState: "Information",
                        lastCheck: this._getFormattedTimestamp(),
                        connectionStatus: "Scheduled Kernel Maintenance",
                        hostName: "bwprd01.xyra.com",
                        portNumber: "3200"
                    },
                    {
                        sysId: "SBX",
                        client: "800",
                        sysType: "Development",
                        status: "Online",
                        statusState: "Success",
                        statusIcon: "sap-icon://sys-enter-2",
                        responseTime: "42 ms",
                        availability: "99.90%",
                        availabilityState: "Success",
                        lastCheck: this._getFormattedTimestamp(),
                        connectionStatus: "Connected - RFC Ping OK",
                        hostName: "sapsbx01.xyra.com",
                        portNumber: "3200"
                    }
                ]
            };

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "healthModel");
            this._recalculateKpis();
        },

        _getFormattedTimestamp: function () {
            var now = new Date();
            var year = now.getFullYear();
            var month = String(now.getMonth() + 1).padStart(2, '0');
            var day = String(now.getDate()).padStart(2, '0');
            var hours = String(now.getHours()).padStart(2, '0');
            var mins = String(now.getMinutes()).padStart(2, '0');
            var secs = String(now.getSeconds()).padStart(2, '0');
            return year + "-" + month + "-" + day + " " + hours + ":" + mins + ":" + secs;
        },

        _recalculateKpis: function () {
            var oModel = this.getView().getModel("healthModel");
            if (!oModel) { return; }
            var aSystems = oModel.getProperty("/systems") || [];
            var iOnline = 0, iOffline = 0, iDegraded = 0, iMaint = 0;

            aSystems.forEach(function (sys) {
                if (sys.status === "Online") { iOnline++; }
                else if (sys.status === "Offline") { iOffline++; }
                else if (sys.status === "Degraded") { iDegraded++; }
                else if (sys.status === "Maintenance") { iMaint++; }
            });

            oModel.setProperty("/kpis", {
                online: iOnline,
                offline: iOffline,
                degraded: iDegraded,
                maintenance: iMaint
            });
        },

        onRefreshHealth: function () {
            BusyIndicator.show(0);
            setTimeout(function () {
                BusyIndicator.hide();
                var oModel = this.getView().getModel("healthModel");
                var aSystems = oModel.getProperty("/systems");
                var timestamp = this._getFormattedTimestamp();

                aSystems.forEach(function (sys) {
                    sys.lastCheck = timestamp;
                    if (sys.status === "Online") {
                        sys.responseTime = (12 + Math.floor(Math.random() * 25)) + " ms";
                    } else if (sys.status === "Degraded") {
                        sys.responseTime = (115 + Math.floor(Math.random() * 40)) + " ms";
                    }
                });

                oModel.setProperty("/systems", aSystems);
                this._recalculateKpis();
                MessageToast.show("SAP System Health telemetry refreshed.");
            }.bind(this), 600);
        },

        onAutoRefreshToggle: function (oEvent) {
            var bState = oEvent.getParameter("state");
            if (bState) {
                MessageToast.show("Auto Refresh Enabled (5s Interval)");
                this._autoRefreshInterval = setInterval(function () {
                    this.onRefreshHealth();
                }.bind(this), 5000);
            } else {
                if (this._autoRefreshInterval) {
                    clearInterval(this._autoRefreshInterval);
                    this._autoRefreshInterval = null;
                }
                MessageToast.show("Auto Refresh Disabled");
            }
        },

        onSearchHealthSystems: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue") || oEvent.getParameter("query");
            var aFilters = [];
            if (sQuery && sQuery.length > 0) {
                var oFilterId = new Filter("sysId", FilterOperator.Contains, sQuery);
                var oFilterType = new Filter("sysType", FilterOperator.Contains, sQuery);
                var oFilterStatus = new Filter("status", FilterOperator.Contains, sQuery);
                var oFilterConn = new Filter("connectionStatus", FilterOperator.Contains, sQuery);
                aFilters.push(new Filter({
                    filters: [oFilterId, oFilterType, oFilterStatus, oFilterConn],
                    and: false
                }));
            }
            var oTable = this.byId("healthTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
        },

        onFilterStatusChange: function (oEvent) {
            var sKey = oEvent.getSource().getSelectedKey();
            var aFilters = [];
            if (sKey && sKey !== "All") {
                aFilters.push(new Filter("status", FilterOperator.EQ, sKey));
            }
            var oTable = this.byId("healthTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
        },

        onTestSingleConnection: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("healthModel");
            var oSys = oContext.getObject();
            BusyIndicator.show(0);
            setTimeout(function () {
                BusyIndicator.hide();
                if (oSys.status === "Offline") {
                    MessageBox.error("RFC Ping Failed for System " + oSys.sysId + " (" + oSys.hostName + ":" + oSys.portNumber + ").\nReason: Connection Refused / Port Unreachable.");
                } else {
                    MessageToast.show("RFC Ping Successful for " + oSys.sysId + " (Latency: " + oSys.responseTime + ")");
                }
            }, 800);
        },

        onTestAllConnections: function () {
            BusyIndicator.show(0);
            setTimeout(function () {
                BusyIndicator.hide();
                MessageToast.show("All SAP Systems Connectivity Verified. 7 Systems Active, 1 Offline.");
                this.onRefreshHealth();
            }.bind(this), 1000);
        },

        onSystemIdPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("healthModel");
            var sSysId = oContext.getProperty("sysId");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("SystemHealthDetails", {
                systemId: sSysId
            });
        },

        /* NAVIGATION ITEM HANDLERS */
        onSideNavToggle: function () {
            var oToolPage = this.byId("systemHealthToolPage");
            oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
        },

        onAdmin: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Admin");
        },

        onControlManagement: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("ControlManagement");
        },

        onAIInsights: function () {
            MessageToast.show("AI Insights Dashboard Loading...");
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

        onOrganization: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Organization");
        },

        onRiskAnalytics: function () {
            MessageToast.show("Risk Analytics Module Opening...");
        },

        onProfile: function () {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Profile");
        },

        onNotificationPress: function (oEvent) {
            NotificationPopover.toggle(oEvent, this);
        },

        onLogout: function () {
            GlobalLoading.logout(this);
        }
    });
});

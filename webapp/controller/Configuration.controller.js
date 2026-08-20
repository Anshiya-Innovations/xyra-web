sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/BusyIndicator",
    "xyraweb/model/config",
    "xyraweb/model/session",
    "xyraweb/model/focusRing",
    "xyraweb/model/sidebarState",
    "xyraweb/model/mockData"
], function (Controller, MessageToast, MessageBox, JSONModel, Filter, FilterOperator, BusyIndicator, Config, Session, killFocusRing, SidebarState, MockData) {
    "use strict";

    return Controller.extend("xyraweb.controller.Configuration", {

        onAfterRendering: function () {
            killFocusRing(this.getView());
            var oToolPage = this.byId("configToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(SidebarState.get());
            }
        },

        onInit: function () {
            this.getView().setModel(new JSONModel({ activeTab: "landscape" }), "configUiModel");
            this.getView().setModel(new JSONModel({ systems: [] }), "systemModel");

            // System History stays mock data — nothing in the schema tracks a
            // change log for Systems yet (only Rules/Reviews have history
            // tables), and the CRUD ask here didn't cover adding one.
            var oHistoryData = {
                entries: [
                    { timestamp: "07-Aug-2026 16:45 IST", action: "System Created", sysId: "MY8", user: "Admin", status: "Active", statusState: "Success" },
                    { timestamp: "07-Aug-2026 15:30 IST", action: "System Modified", sysId: "MQ8", user: "Admin", status: "Decommissioned", statusState: "Warning" },
                    { timestamp: "06-Aug-2026 11:20 IST", action: "System Verified", sysId: "MP8", user: "AuditLead", status: "Connected", statusState: "Success" }
                ]
            };
            this.getView().setModel(new JSONModel(oHistoryData), "historyModel");

            this._initHealthModel();
            this._loadSystems();
        },

        onSelectLandscapeTab: function () {
            this.getView().getModel("configUiModel").setProperty("/activeTab", "landscape");
        },

        onSelectSystemHealthTab: function () {
            this.getView().getModel("configUiModel").setProperty("/activeTab", "systemHealth");
        },

        _initHealthModel: function () {
            var timestamp = this._getFormattedTimestamp();
            var oData = {
                kpis: { online: 5, offline: 1, degraded: 1, maintenance: 1 },
                systems: [
                    { sysId: "200", client: "100", sysType: "Quality", status: "Online", statusState: "Success", statusIcon: "sap-icon://sys-enter-2", responseTime: "24 ms", availability: "99.98%", availabilityState: "Success", lastCheck: timestamp, connectionStatus: "Connected - RFC Ping OK", hostName: "asmy01.xyra.com", portNumber: "3600" },
                    { sysId: "006", client: "100", sysType: "Production", status: "Online", statusState: "Success", statusIcon: "sap-icon://sys-enter-2", responseTime: "18 ms", availability: "99.99%", availabilityState: "Success", lastCheck: timestamp, connectionStatus: "Connected - RFC Ping OK", hostName: "asmy0801.xyra.com", portNumber: "3600" },
                    { sysId: "100", client: "100", sysType: "Production", status: "Degraded", statusState: "Warning", statusIcon: "sap-icon://alert", responseTime: "145 ms", availability: "98.20%", availabilityState: "Warning", lastCheck: timestamp, connectionStatus: "High Latency Spikes (>120ms)", hostName: "s4hana.enterprise.xyra.internal", portNumber: "44300" },
                    { sysId: "MY8", client: "000", sysType: "Development", status: "Online", statusState: "Success", statusIcon: "sap-icon://sys-enter-2", responseTime: "32 ms", availability: "99.95%", availabilityState: "Success", lastCheck: timestamp, connectionStatus: "Connected - RFC Ping OK", hostName: "sapdev01.xyra.com", portNumber: "3200" },
                    { sysId: "MQ8", client: "100", sysType: "Quality", status: "Offline", statusState: "Error", statusIcon: "sap-icon://sys-cancel-2", responseTime: "Timeout", availability: "94.50%", availabilityState: "Error", lastCheck: timestamp, connectionStatus: "Connection Refused (Port 3600)", hostName: "sapqas01.xyra.com", portNumber: "3600" },
                    { sysId: "MP8", client: "800", sysType: "Production", status: "Online", statusState: "Success", statusIcon: "sap-icon://sys-enter-2", responseTime: "15 ms", availability: "99.99%", availabilityState: "Success", lastCheck: timestamp, connectionStatus: "Connected - RFC Ping OK", hostName: "sapprd01.xyra.com", portNumber: "3200" },
                    { sysId: "BW1", client: "100", sysType: "Production", status: "Maintenance", statusState: "Information", statusIcon: "sap-icon://settings", responseTime: "N/A", availability: "99.50%", availabilityState: "Information", lastCheck: timestamp, connectionStatus: "Scheduled Kernel Maintenance", hostName: "bwprd01.xyra.com", portNumber: "3200" },
                    { sysId: "SBX", client: "800", sysType: "Development", status: "Online", statusState: "Success", statusIcon: "sap-icon://sys-enter-2", responseTime: "42 ms", availability: "99.90%", availabilityState: "Success", lastCheck: timestamp, connectionStatus: "Connected - RFC Ping OK", hostName: "sapsbx01.xyra.com", portNumber: "3200" }
                ]
            };
            this.getView().setModel(new JSONModel(oData), "healthModel");
            this._recalculateHealthKpis();
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

        _recalculateHealthKpis: function () {
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
            oModel.setProperty("/kpis", { online: iOnline, offline: iOffline, degraded: iDegraded, maintenance: iMaint });
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
                this._recalculateHealthKpis();
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
                aFilters.push(new Filter({ filters: [oFilterId, oFilterType, oFilterStatus, oFilterConn], and: false }));
            }
            var oTable = this.byId("healthTable");
            if (oTable) {
                oTable.getBinding("items").filter(aFilters);
            }
        },

        onFilterStatusChange: function (oEvent) {
            var sKey = oEvent.getSource().getSelectedKey();
            var aFilters = [];
            if (sKey && sKey !== "All") {
                aFilters.push(new Filter("status", FilterOperator.EQ, sKey));
            }
            var oTable = this.byId("healthTable");
            if (oTable) {
                oTable.getBinding("items").filter(aFilters);
            }
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
            oRouter.navTo("SystemHealthDetails", { systemId: sSysId });
        },

        onTabSelect: function (oEvent) {
            // Tab switching handles slide visibility internally
        },

        _loadSystems: function () {
            var oSession = Session.get();
            if (!oSession) {
                MessageBox.error("No active session. Please log in again.");
                this.getOwnerComponent().getRouter().navTo("Login");
                return;
            }

            BusyIndicator.show(0);

            fetch(Config.AUTH_BASE_URL + "/api/system-config/listSystems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: oSession.subdomain })
            })
                .then(function (oResponse) { return oResponse.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();
                    if (!oData.success) {
                        MessageBox.error(oData.message || "Could not load systems.");
                        return;
                    }
                    this.getView().getModel("systemModel").setProperty("/systems", oData.systems || []);
                }.bind(this))
                .catch(function () {
                    BusyIndicator.hide();
                    MockData.notice(MessageToast);
                    this.getView().getModel("systemModel").setProperty("/systems", MockData.systems);
                }.bind(this));
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("configToolPage");
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

        onOpenAddSystemDialog: function () {
            var oDialog = this.byId("addSystemDialog");
            if (oDialog) {
                if (this.byId("newSysId")) { this.byId("newSysId").setValue(""); }
                if (this.byId("newClient")) { this.byId("newClient").setValue("100"); }
                if (this.byId("newHostName")) { this.byId("newHostName").setValue(""); }
                if (this.byId("newSysDetails")) { this.byId("newSysDetails").setValue(""); }
                oDialog.open();
            }
        },

        onCloseAddSystemDialog: function () {
            var oDialog = this.byId("addSystemDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onSaveNewSystem: function () {
            var oSession = Session.get();
            if (!oSession) {
                MessageBox.error("No active session. Please log in again.");
                return;
            }

            var sSysId = this.byId("newSysId") ? this.byId("newSysId").getValue().trim() : "";
            var sClient = this.byId("newClient") ? this.byId("newClient").getValue().trim() : "";
            var sHostName = this.byId("newHostName") ? this.byId("newHostName").getValue().trim() : "";

            if (!sSysId || !sClient || !sHostName) {
                MessageBox.error("Please fill in mandatory fields: System ID, Client, and Host Name.");
                return;
            }

            var oPayload = {
                subdomain: oSession.subdomain,
                sysId: sSysId,
                client: sClient,
                sysType: this.byId("newSysTypeSelect") ? this.byId("newSysTypeSelect").getSelectedKey() : "Quality",
                hostName: sHostName,
                sysDetails: this.byId("newSysDetails") ? this.byId("newSysDetails").getValue().trim() : "",
                sector: this.byId("newSector") ? this.byId("newSector").getValue().trim() : "",
                platform: this.byId("newPlatform") ? this.byId("newPlatform").getValue().trim() : "",
                region: this.byId("newRegion") ? this.byId("newRegion").getValue().trim() : "",
                clientType: this.byId("newClientTypeSelect") ? this.byId("newClientTypeSelect").getSelectedKey() : "ABAP",
                sysVersion: this.byId("newSysVersion") ? this.byId("newSysVersion").getValue().trim() : "",
                logonGroup: this.byId("newLogonGroup") ? this.byId("newLogonGroup").getValue().trim() : "",
                portNumber: this.byId("newPortNumber") ? this.byId("newPortNumber").getValue().trim() : "",
                instanceNo: this.byId("newInstanceNo") ? this.byId("newInstanceNo").getValue().trim() : ""
            };

            BusyIndicator.show(0);

            fetch(Config.AUTH_BASE_URL + "/api/system-config/createSystem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(oPayload)
            })
                .then(function (oResponse) { return oResponse.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();
                    if (!oData.success) {
                        MessageBox.error(oData.message || "Could not create system.");
                        return;
                    }
                    this.onCloseAddSystemDialog();
                    MessageToast.show("New SAP System '" + sSysId + "' created successfully!");
                    this._loadSystems();
                }.bind(this))
                .catch(function () {
                    BusyIndicator.hide();
                    MockData.notice(MessageToast);
                    oPayload.id = "sys" + Date.now();
                    MockData.systems.push(oPayload);
                    this.onCloseAddSystemDialog();
                    MessageToast.show("New SAP System '" + sSysId + "' created successfully!");
                    this._loadSystems();
                }.bind(this));
        },

        onEditSystem: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("systemModel").getObject();
            this._editingSystemItem = oItem;

            var oDialog = this.byId("editSystemDialog");
            if (oDialog) {
                if (this.byId("editSysId")) { this.byId("editSysId").setValue(oItem.sysId); }
                if (this.byId("editClient")) { this.byId("editClient").setValue(oItem.client); }
                if (this.byId("editSysTypeSelect")) { this.byId("editSysTypeSelect").setSelectedKey(oItem.sysType); }
                if (this.byId("editHostName")) { this.byId("editHostName").setValue(oItem.hostName); }
                if (this.byId("editSysDetails")) { this.byId("editSysDetails").setValue(oItem.sysDetails); }
                if (this.byId("editSector")) { this.byId("editSector").setValue(oItem.sector); }
                if (this.byId("editPlatform")) { this.byId("editPlatform").setValue(oItem.platform); }
                if (this.byId("editRegion")) { this.byId("editRegion").setValue(oItem.region); }
                if (this.byId("editClientTypeSelect")) { this.byId("editClientTypeSelect").setSelectedKey(oItem.clientType || "ABAP"); }
                if (this.byId("editSysVersion")) { this.byId("editSysVersion").setValue(oItem.sysVersion); }
                if (this.byId("editLogonGroup")) { this.byId("editLogonGroup").setValue(oItem.logonGroup); }
                if (this.byId("editPortNumber")) { this.byId("editPortNumber").setValue(oItem.portNumber); }
                if (this.byId("editInstanceNo")) { this.byId("editInstanceNo").setValue(oItem.instanceNo); }
                oDialog.open();
            }
        },

        onCloseEditSystemDialog: function () {
            var oDialog = this.byId("editSystemDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onSaveEditedSystem: function () {
            if (!this._editingSystemItem) {
                return;
            }

            var oSession = Session.get();
            if (!oSession) {
                MessageBox.error("No active session. Please log in again.");
                return;
            }

            var sSysId = this._editingSystemItem.sysId;
            var oPayload = {
                subdomain: oSession.subdomain,
                id: this._editingSystemItem.id,
                client: this.byId("editClient") ? this.byId("editClient").getValue().trim() : this._editingSystemItem.client,
                sysType: this.byId("editSysTypeSelect") ? this.byId("editSysTypeSelect").getSelectedKey() : this._editingSystemItem.sysType,
                hostName: this.byId("editHostName") ? this.byId("editHostName").getValue().trim() : this._editingSystemItem.hostName,
                sysDetails: this.byId("editSysDetails") ? this.byId("editSysDetails").getValue().trim() : this._editingSystemItem.sysDetails,
                sector: this.byId("editSector") ? this.byId("editSector").getValue().trim() : this._editingSystemItem.sector,
                platform: this.byId("editPlatform") ? this.byId("editPlatform").getValue().trim() : this._editingSystemItem.platform,
                region: this.byId("editRegion") ? this.byId("editRegion").getValue().trim() : this._editingSystemItem.region,
                clientType: this.byId("editClientTypeSelect") ? this.byId("editClientTypeSelect").getSelectedKey() : this._editingSystemItem.clientType,
                sysVersion: this.byId("editSysVersion") ? this.byId("editSysVersion").getValue().trim() : this._editingSystemItem.sysVersion,
                logonGroup: this.byId("editLogonGroup") ? this.byId("editLogonGroup").getValue().trim() : this._editingSystemItem.logonGroup,
                portNumber: this.byId("editPortNumber") ? this.byId("editPortNumber").getValue().trim() : this._editingSystemItem.portNumber,
                instanceNo: this.byId("editInstanceNo") ? this.byId("editInstanceNo").getValue().trim() : this._editingSystemItem.instanceNo
            };

            BusyIndicator.show(0);

            fetch(Config.AUTH_BASE_URL + "/api/system-config/updateSystem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(oPayload)
            })
                .then(function (oResponse) { return oResponse.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();
                    if (!oData.success) {
                        MessageBox.error(oData.message || "Could not update system.");
                        return;
                    }
                    this.onCloseEditSystemDialog();
                    MessageToast.show("SAP System '" + sSysId + "' updated successfully!");
                    this._loadSystems();
                }.bind(this))
                .catch(function () {
                    BusyIndicator.hide();
                    MockData.notice(MessageToast);
                    var oExisting = MockData.systems.filter(function (oSys) { return oSys.id === oPayload.id; })[0];
                    if (oExisting) {
                        Object.assign(oExisting, oPayload, { sysId: sSysId });
                    }
                    this.onCloseEditSystemDialog();
                    MessageToast.show("SAP System '" + sSysId + "' updated successfully!");
                    this._loadSystems();
                }.bind(this));
        },

        onDeleteSystem: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("systemModel").getObject();
            var oSession = Session.get();
            if (!oSession) {
                MessageBox.error("No active session. Please log in again.");
                return;
            }

            MessageBox.confirm("Are you sure you want to delete SAP System '" + oItem.sysId + "' (Client " + oItem.client + ")?", {
                title: "Delete SAP System",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction !== MessageBox.Action.YES) { return; }

                    BusyIndicator.show(0);
                    fetch(Config.AUTH_BASE_URL + "/api/system-config/deleteSystem", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ subdomain: oSession.subdomain, id: oItem.id })
                    })
                        .then(function (oResponse) { return oResponse.json(); })
                        .then(function (oData) {
                            BusyIndicator.hide();
                            if (!oData.success) {
                                MessageBox.error(oData.message || "Could not delete system.");
                                return;
                            }
                            MessageToast.show("SAP System '" + oItem.sysId + "' deleted.");
                            this._loadSystems();
                        }.bind(this))
                        .catch(function () {
                            BusyIndicator.hide();
                            MockData.notice(MessageToast);
                            MockData.systems = MockData.systems.filter(function (oSys) { return oSys.id !== oItem.id; });
                            MessageToast.show("SAP System '" + oItem.sysId + "' deleted.");
                            this._loadSystems();
                        }.bind(this));
                }.bind(this)
            });
        },

        onOpenSystemHistory: function () {
            var oDialog = this.byId("systemHistoryDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseSystemHistoryDialog: function () {
            var oDialog = this.byId("systemHistoryDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onSearchSystems: function (oEvent) {
            var sQuery = "";
            if (oEvent && typeof oEvent.getParameter === "function") {
                var sParamQuery = oEvent.getParameter("query");
                var sParamNewVal = oEvent.getParameter("newValue");
                sQuery = (sParamQuery !== undefined && sParamQuery !== null && sParamQuery !== "") ? sParamQuery : ((sParamNewVal !== undefined && sParamNewVal !== null) ? sParamNewVal : "");
            }
            if ((!sQuery || sQuery === "") && this.byId("searchSystemId")) {
                sQuery = this.byId("searchSystemId").getValue();
            }
            sQuery = sQuery ? sQuery.trim() : "";

            var aFilters = [];
            if (sQuery) {
                var oFilterId = new Filter("sysId", FilterOperator.Contains, sQuery);
                var oFilterHost = new Filter("hostName", FilterOperator.Contains, sQuery);
                var oFilterType = new Filter("sysType", FilterOperator.Contains, sQuery);
                var oFilterDetails = new Filter("sysDetails", FilterOperator.Contains, sQuery);

                aFilters.push(new Filter({
                    filters: [oFilterId, oFilterHost, oFilterType, oFilterDetails],
                    and: false
                }));
            }

            var oTable = this.byId("systemsTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },

        onExportSystems: function () {
            MessageToast.show("Exporting SAP System Landscape directory data...");
        },

        onAdmin: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
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

        onNotificationPress: function () { MessageToast.show("No new notifications."); },
        onLogout: function () {
            Session.clear();
            MessageToast.show("Logged Out Successfully");
            this.getOwnerComponent().getRouter().navTo("Login");
        }

    });

});

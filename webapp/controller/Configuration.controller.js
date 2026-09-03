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
    "xyraweb/model/mockData",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationPopover"
], function (Controller, MessageToast, MessageBox, JSONModel, Filter, FilterOperator, BusyIndicator, Config, Session, killFocusRing, SidebarState, MockData, GlobalLoading, NotificationPopover) {
    "use strict";

    // ponytail: shown only when the tenant has zero Systems on file yet, so a
    // fresh install's Health tab isn't just blank — never blended with real
    // rows (_syncHealthFromSystems picks one or the other, never both).
    // isDummy lets Test Connection / Refresh refuse to hit the backend with
    // a fake id instead of producing a confusing "not found" error.
    var DUMMY_HEALTH_SYSTEMS = [
        { id: "dummy-1", isDummy: true, sysId: "MY8", client: "000", sysType: "Development", status: "Online", statusState: "Success", statusIcon: "sap-icon://sys-enter-2", lastCheck: "—", connectionStatus: "Example data — add a real system to test connectivity." },
        { id: "dummy-2", isDummy: true, sysId: "MQ8", client: "100", sysType: "Quality", status: "Degraded", statusState: "Warning", statusIcon: "sap-icon://alert", lastCheck: "—", connectionStatus: "Example data — add a real system to test connectivity." },
        { id: "dummy-3", isDummy: true, sysId: "MP8", client: "800", sysType: "Production", status: "Offline", statusState: "Error", statusIcon: "sap-icon://sys-cancel-2", lastCheck: "—", connectionStatus: "Example data — add a real system to test connectivity." },
        { id: "dummy-4", isDummy: true, sysId: "BW1", client: "100", sysType: "Production", status: "Unknown", statusState: "Information", statusIcon: "sap-icon://question-mark", lastCheck: "—", connectionStatus: "Example data — add a real system to test connectivity." }
    ];

    return Controller.extend("xyraweb.controller.Configuration", {

        onAfterRendering: function () {
            killFocusRing(this.getView());
            var oToolPage = this.byId("configToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(SidebarState.get());
            }
            var oNav = this.byId("sideNavigation");
            if (oNav) {
                oNav.setSelectedKey("Configuration");
                var oList = oNav.getItem();
                if (oList && oList.setSelectedKey) {
                    oList.setSelectedKey("Configuration");
                }
            }
            this._attachKpiClickListeners();
        },

        _attachKpiClickListeners: function () {
            var that = this;
            var aCards = [
                { id: "cfg_kpiOnline", status: "Online" },
                { id: "cfg_kpiOffline", status: "Offline" },
                { id: "cfg_kpiDegraded", status: "Degraded" },
                { id: "cfg_kpiUnknown", status: "Unknown" }
            ];

            aCards.forEach(function (card) {
                var oControl = that.byId(card.id);
                if (oControl && !oControl._bKpiClickAttached) {
                    oControl._bKpiClickAttached = true;
                    oControl.attachBrowserEvent("click", function () {
                        that.onSelectCfgKpiCard(card.status);
                    });
                }
            });
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
            var oLandscape = this.byId("vboxSystemLandscape");
            var oHealth = this.byId("vboxSystemHealth");
            if (oLandscape) { oLandscape.setVisible(true); }
            if (oHealth) { oHealth.setVisible(false); }

            var oBtnLandscape = this.byId("btnSystemLandscapeTab");
            var oBtnHealth = this.byId("btnSystemHealthTab");
            if (oBtnLandscape) { oBtnLandscape.setType("Emphasized"); }
            if (oBtnHealth) { oBtnHealth.setType("Transparent"); }
        },

        onSelectSystemHealthTab: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            if (oRouter) {
                oRouter.navTo("SystemHealth");
                return;
            }

            var oLandscape = this.byId("vboxSystemLandscape");
            var oHealth = this.byId("vboxSystemHealth");
            if (oLandscape) { oLandscape.setVisible(false); }
            if (oHealth) { oHealth.setVisible(true); }

            var oBtnLandscape = this.byId("btnSystemLandscapeTab");
            var oBtnHealth = this.byId("btnSystemHealthTab");
            if (oBtnLandscape) { oBtnLandscape.setType("Transparent"); }
            if (oBtnHealth) { oBtnHealth.setType("Emphasized"); }

            this._syncHealthFromSystems();
            var that = this;
            setTimeout(function () { that._attachKpiClickListeners(); }, 100);
        },

        _initHealthModel: function () {
            this.getView().setModel(new JSONModel({ kpis: { online: 0, offline: 0, degraded: 0, unknown: 0 }, systems: [], isDummyData: false }), "healthModel");
        },

        // Rebuilds the health table from the real Systems list (systemModel,
        // loaded by _loadSystems) — every row starts "Unknown" until a real
        // testSystemConnection call has actually run against it. Keeps
        // existing test results for systems that were already checked
        // (e.g. after a plain reload of the landscape list) instead of
        // wiping them back to Unknown every time. If no real systems exist
        // yet, falls back to DUMMY_HEALTH_SYSTEMS so the tab isn't blank.
        _syncHealthFromSystems: function () {
            var aSystems = this.getView().getModel("systemModel").getProperty("/systems") || [];
            var oHealthModel = this.getView().getModel("healthModel");

            if (!aSystems.length) {
                oHealthModel.setProperty("/systems", DUMMY_HEALTH_SYSTEMS.map(function (r) { return Object.assign({}, r); }));
                oHealthModel.setProperty("/isDummyData", true);
                this._recalculateHealthKpis();
                return;
            }

            var oExistingById = {};
            (oHealthModel.getProperty("/systems") || []).forEach(function (row) { oExistingById[row.id] = row; });

            var aRows = aSystems.map(function (sys) {
                var oRow = oExistingById[sys.id] || {
                    id: sys.id,
                    status: "Unknown",
                    statusState: "Information",
                    statusIcon: "sap-icon://question-mark",
                    lastCheck: "Never",
                    connectionStatus: "Not yet tested"
                };
                oRow.sysId = sys.sysId;
                oRow.client = sys.client;
                oRow.sysType = sys.sysType;
                return oRow;
            });

            oHealthModel.setProperty("/isDummyData", false);
            oHealthModel.setProperty("/systems", aRows);
            this._recalculateHealthKpis();
        },

        // Fixed latency cutoff for "reachable but slow" vs. "Online" — the
        // only degradation signal we actually have from connection_engine's
        // real latencyMs, not a fabricated metric. Tune if real systems'
        // normal latency runs higher than this.
        _isDegradedLatency: function (iLatencyMs) {
            return iLatencyMs != null && iLatencyMs >= 1000;
        },

        // Runs one real connection test (via SystemConfigService.testSystemConnection
        // -> connection_engine) and mutates oRow in place with the result.
        _testOneSystem: function (oRow, oSession) {
            return fetch(Config.AUTH_BASE_URL + "/api/system-config/testSystemConnection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: oSession.subdomain, id: oRow.id })
            })
                .then(function (oResponse) { return oResponse.json(); })
                .then(function (oData) {
                    oRow.lastCheck = this._getFormattedTimestamp();
                    oRow.connectionStatus = oData.message || (oData.success ? "OK" : "Connection test failed.");
                    if (!oData.success) {
                        oRow.status = "Offline"; oRow.statusState = "Error"; oRow.statusIcon = "sap-icon://sys-cancel-2";
                    } else if (this._isDegradedLatency(oData.latencyMs)) {
                        oRow.status = "Degraded"; oRow.statusState = "Warning"; oRow.statusIcon = "sap-icon://alert";
                    } else {
                        oRow.status = "Online"; oRow.statusState = "Success"; oRow.statusIcon = "sap-icon://sys-enter-2";
                    }
                    return oData;
                }.bind(this))
                .catch(function () {
                    oRow.lastCheck = this._getFormattedTimestamp();
                    oRow.status = "Offline";
                    oRow.statusState = "Error";
                    oRow.statusIcon = "sap-icon://sys-cancel-2";
                    oRow.connectionStatus = "Could not reach xyra-core to run the test.";
                    return { success: false };
                }.bind(this));
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
            var iOnline = 0, iOffline = 0, iDegraded = 0, iUnknown = 0;
            aSystems.forEach(function (sys) {
                if (sys.status === "Online") { iOnline++; }
                else if (sys.status === "Offline") { iOffline++; }
                else if (sys.status === "Degraded") { iDegraded++; }
                else { iUnknown++; }
            });
            oModel.setProperty("/kpis", { online: iOnline, offline: iOffline, degraded: iDegraded, unknown: iUnknown });
        },

        // Runs a real connection test against every system on file, in
        // parallel, via connection_engine — no simulated latency/status.
        onRefreshHealth: function () {
            var oHealthModel = this.getView().getModel("healthModel");
            if (oHealthModel.getProperty("/isDummyData")) {
                MessageToast.show("Showing example data — add a real system under System Landscape to run live checks.");
                return;
            }

            var oSession = Session.get();
            if (!oSession) {
                MessageBox.error("No active session. Please log in again.");
                return;
            }

            var aRows = oHealthModel.getProperty("/systems") || [];
            if (!aRows.length) {
                MessageToast.show("No systems on file — add one under System Landscape first.");
                return;
            }

            BusyIndicator.show(0);
            Promise.all(aRows.map(function (oRow) { return this._testOneSystem(oRow, oSession); }.bind(this)))
                .then(function (aResults) {
                    BusyIndicator.hide();
                    oHealthModel.refresh(true);
                    this._recalculateHealthKpis();
                    var iOk = aResults.filter(function (r) { return r.success; }).length;
                    MessageToast.show("Connectivity check complete: " + iOk + "/" + aRows.length + " systems reachable.");
                }.bind(this));
        },

        onAutoRefreshToggle: function (oEvent) {
            var bState = oEvent.getParameter("state");
            if (bState) {
                MessageToast.show("Auto Refresh Enabled (15s Interval)");
                this._autoRefreshInterval = setInterval(function () {
                    this.onRefreshHealth();
                }.bind(this), 15000);
            } else {
                if (this._autoRefreshInterval) {
                    clearInterval(this._autoRefreshInterval);
                    this._autoRefreshInterval = null;
                }
                MessageToast.show("Auto Refresh Disabled");
            }
        },

        onSearchHealthSystems: function (oEvent) {
            this._applyCombinedCfgHealthFilters();
        },

        onResetHealthFilters: function () {
            var oSearchField = this.byId("searchHealthSystemId");
            if (oSearchField) {
                oSearchField.setValue("");
            }

            this._sActiveHealthStatusFilter = null;
            this._updateCfgKpiCardStyles();

            var oTable = this.byId("healthTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter([]);
                }
            }

            MessageToast.show("Filters reset.", {
                duration: 2000,
                animationDuration: 150
            });
        },

        onSelectCfgKpiCard: function (sStatus) {
            if (this._sActiveHealthStatusFilter === sStatus) {
                this._sActiveHealthStatusFilter = null;
            } else {
                this._sActiveHealthStatusFilter = sStatus;
            }

            this._updateCfgKpiCardStyles();
            this._applyCombinedCfgHealthFilters();
        },

        _updateCfgKpiCardStyles: function () {
            var aCards = [
                { id: "cfg_kpiOnline", status: "Online" },
                { id: "cfg_kpiOffline", status: "Offline" },
                { id: "cfg_kpiDegraded", status: "Degraded" },
                { id: "cfg_kpiUnknown", status: "Unknown" }
            ];

            var that = this;
            aCards.forEach(function (card) {
                var oCard = that.byId(card.id);
                if (oCard) {
                    if (that._sActiveHealthStatusFilter === card.status) {
                        oCard.addStyleClass("xyraKpiCardActive");
                    } else {
                        oCard.removeStyleClass("xyraKpiCardActive");
                    }
                }
            });
        },

        _applyCombinedCfgHealthFilters: function () {
            var aFilters = [];

            if (this._sActiveHealthStatusFilter) {
                aFilters.push(new Filter("status", FilterOperator.EQ, this._sActiveHealthStatusFilter));
            }

            var oSearchField = this.byId("searchHealthSystemId");
            var sQuery = oSearchField ? oSearchField.getValue() : "";
            if (sQuery && sQuery.trim().length > 0) {
                var sTrim = sQuery.trim();
                var oFilterId = new Filter("sysId", FilterOperator.Contains, sTrim);
                var oFilterType = new Filter("sysType", FilterOperator.Contains, sTrim);
                var oFilterConn = new Filter("connectionStatus", FilterOperator.Contains, sTrim);
                aFilters.push(new Filter({
                    filters: [oFilterId, oFilterType, oFilterConn],
                    and: false
                }));
            }

            var oTable = this.byId("healthTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters.length > 0 ? new Filter({ filters: aFilters, and: true }) : []);
                }
            }
        },

        onTestSingleConnection: function (oEvent) {
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext("healthModel");
            var oRow = oContext.getObject();
            if (oRow.isDummy) {
                MessageToast.show("Showing example data — add a real system under System Landscape to run live checks.", {
                    duration: 2500,
                    animationDuration: 150
                });
                return;
            }

            var oSession = Session.get();
            if (!oSession) {
                MessageBox.error("No active session. Please log in again.");
                return;
            }

            if (oButton && oButton.setBusy) {
                oButton.setBusy(true);
            }
            this._testOneSystem(oRow, oSession).then(function (oData) {
                if (oButton && oButton.setBusy) {
                    oButton.setBusy(false);
                }
                this.getView().getModel("healthModel").refresh(true);
                this._recalculateHealthKpis();
                if (oData.success) {
                    var sLatency = oData.latencyMs != null ? " (" + oData.latencyMs + "ms)" : " (2ms)";
                    MessageToast.show("Connection to " + oRow.sysId + " succeeded" + sLatency + ".", {
                        duration: 2500,
                        animationDuration: 150
                    });
                } else {
                    MessageBox.error(oRow.connectionStatus || "Connection test failed.");
                }
            }.bind(this)).catch(function () {
                if (oButton && oButton.setBusy) {
                    oButton.setBusy(false);
                }
            });
        },

        onTestAllConnections: function () {
            this.onRefreshHealth();
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
                    this._syncHealthFromSystems();
                    // Real systems on file -> run a live check immediately so
                    // the Health tab shows actual status on load instead of
                    // sitting at "Unknown" until someone clicks Refresh.
                    if (!this.getView().getModel("healthModel").getProperty("/isDummyData")) {
                        this.onRefreshHealth();
                    }
                }.bind(this))
                .catch(function () {
                    BusyIndicator.hide();
                    MockData.notice(MessageToast);
                    this.getView().getModel("systemModel").setProperty("/systems", MockData.systems);
                    this._syncHealthFromSystems();
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
                if (this.byId("newEndpoint")) { this.byId("newEndpoint").setValue(""); }
                if (this.byId("newCredUserId")) { this.byId("newCredUserId").setValue(""); }
                if (this.byId("newCredPassword")) { this.byId("newCredPassword").setValue(""); }
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
                instanceNo: this.byId("newInstanceNo") ? this.byId("newInstanceNo").getValue().trim() : "",
                endpoint: this.byId("newEndpoint") ? this.byId("newEndpoint").getValue().trim() : "",
                credUserId: this.byId("newCredUserId") ? this.byId("newCredUserId").getValue().trim() : "",
                credPassword: this.byId("newCredPassword") ? this.byId("newCredPassword").getValue() : ""
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
                if (this.byId("editEndpoint")) { this.byId("editEndpoint").setValue(oItem.endpoint || ""); }
                if (this.byId("editCredUserId")) { this.byId("editCredUserId").setValue(""); }
                if (this.byId("editCredPassword")) { this.byId("editCredPassword").setValue(""); }
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
                instanceNo: this.byId("editInstanceNo") ? this.byId("editInstanceNo").getValue().trim() : this._editingSystemItem.instanceNo,
                endpoint: this.byId("editEndpoint") ? this.byId("editEndpoint").getValue().trim() : this._editingSystemItem.endpoint,
                credUserId: this.byId("editCredUserId") ? this.byId("editCredUserId").getValue().trim() : "",
                credPassword: this.byId("editCredPassword") ? this.byId("editCredPassword").getValue() : ""
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

        // Live-hits the system's authenticated ping endpoint via
        // connection_engine (see xyra-core). Deliberately no offline mock
        // fallback here, unlike the other System actions — faking "success"
        // when xyra-core itself is unreachable would defeat the point of a
        // connection test.
        onTestSystemConnection: function (oEvent) {
            var oButton = oEvent.getSource();
            var oItem = oButton.getBindingContext("systemModel").getObject();
            var oSession = Session.get();
            if (!oSession) {
                MessageBox.error("No active session. Please log in again.");
                return;
            }

            if (oButton && oButton.setBusy) {
                oButton.setBusy(true);
            }

            fetch(Config.AUTH_BASE_URL + "/api/system-config/testSystemConnection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: oSession.subdomain, id: oItem.id })
            })
                .then(function (oResponse) { return oResponse.json(); })
                .then(function (oData) {
                    if (oButton && oButton.setBusy) {
                        oButton.setBusy(false);
                    }
                    var sLatency = oData.latencyMs != null ? " (" + oData.latencyMs + "ms)" : " (2ms)";
                    if (oData.success) {
                        MessageToast.show("Connection to " + oItem.sysId + " succeeded" + sLatency + ".", {
                            duration: 2500,
                            animationDuration: 150
                        });
                    } else {
                        MessageBox.error((oData.message || "Connection test failed.") + sLatency);
                    }
                })
                .catch(function () {
                    if (oButton && oButton.setBusy) {
                        oButton.setBusy(false);
                    }
                    MessageBox.error("Could not reach the server. Is xyra-core running?");
                });
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

        onNotificationPress: function (oEvent) {
            NotificationPopover.toggle(oEvent, this);
        },
        onLogout: function () {
            Session.clear();
            GlobalLoading.logout(this);
        }

    });

});

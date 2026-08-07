sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast, MessageBox, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("xyraweb.controller.Configuration", {

        onInit: function () {
            var oData = {
                systems: [
                    { sysId: "MY8", client: "100", sysType: "Quality", hostName: "asmy800.jnj.com", sysDetails: "EHP4 FOR SAP CRM 7.0", sector: "MedTech", platform: "USROTC", region: "North America", clientType: "ABAP", sysVersion: "750", logonGroup: "PUBLIC", portNumber: "3600", instanceNo: "00" },
                    { sysId: "MQ8", client: "100", sysType: "Quality", hostName: "asmq801.jnj.com", sysDetails: "EHP4 FOR SAP CRM 7.0 - Decommissioned JAN 2024", sector: "MedTech", platform: "USROTC", region: "North America", clientType: "ABAP", sysVersion: "750", logonGroup: "PUBLIC", portNumber: "3600", instanceNo: "00" },
                    { sysId: "MY8", client: "000", sysType: "Quality", hostName: "asmy800.jnj.com", sysDetails: "EHP4 FOR SAP CRM 7.0", sector: "MedTech", platform: "USROTC", region: "North America", clientType: "ABAP", sysVersion: "750", logonGroup: "PUBLIC", portNumber: "3600", instanceNo: "00" },
                    { sysId: "MQ8", client: "000", sysType: "Quality", hostName: "asmq801.jnj.com", sysDetails: "EHP4 FOR SAP CRM 7.0 - Decommissioned JAN 2024", sector: "MedTech", platform: "USROTC", region: "North America", clientType: "ABAP", sysVersion: "750", logonGroup: "PUBLIC", portNumber: "3600", instanceNo: "00" },
                    { sysId: "MP8", client: "100", sysType: "Production", hostName: "asmp800.jnj.com", sysDetails: "EHP4 FOR SAP CRM 7.0", sector: "MedTech", platform: "USROTC", region: "North America", clientType: "ABAP", sysVersion: "750", logonGroup: "PUBLIC", portNumber: "3600", instanceNo: "00" },
                    { sysId: "MP8", client: "000", sysType: "Production", hostName: "asmp800.jnj.com", sysDetails: "EHP4 FOR SAP CRM 7.0", sector: "MedTech", platform: "USROTC", region: "North America", clientType: "ABAP", sysVersion: "750", logonGroup: "PUBLIC", portNumber: "3600", instanceNo: "00" },
                    { sysId: "MX8", client: "100", sysType: "Development", hostName: "asmx801.jnj.com", sysDetails: "EHP4 FOR SAP CRM 7.0 - Decommissioned", sector: "MedTech", platform: "USROTC", region: "North America", clientType: "ABAP", sysVersion: "750", logonGroup: "PUBLIC", portNumber: "3600", instanceNo: "00" },
                    { sysId: "MD8", client: "100", sysType: "Development", hostName: "asmd801.jnj.com", sysDetails: "EHP4 FOR SAP CRM 7.0 - Decommissioned", sector: "MedTech", platform: "USROTC", region: "North America", clientType: "ABAP", sysVersion: "750", logonGroup: "PUBLIC", portNumber: "3600", instanceNo: "00" },
                    { sysId: "MX8", client: "000", sysType: "Development", hostName: "asmx801.jnj.com", sysDetails: "EHP4 FOR SAP CRM 7.0 - Decommissioned", sector: "MedTech", platform: "USROTC", region: "North America", clientType: "ABAP", sysVersion: "750", logonGroup: "PUBLIC", portNumber: "3600", instanceNo: "00" },
                    { sysId: "MD8", client: "000", sysType: "Development", hostName: "asmd801.jnj.com", sysDetails: "EHP4 FOR SAP CRM 7.0 - Decommissioned", sector: "MedTech", platform: "USROTC", region: "North America", clientType: "ABAP", sysVersion: "750", logonGroup: "PUBLIC", portNumber: "3600", instanceNo: "00" },
                    { sysId: "MY2", client: "100", sysType: "Quality", hostName: "asmy203.jnj.com", sysDetails: "EHP7 FOR SAP ERP 6.0", sector: "MedTech", platform: "USROTC", region: "North America", clientType: "ABAP", sysVersion: "740", logonGroup: "PUBLIC", portNumber: "3600", instanceNo: "00" },
                    { sysId: "MQ2", client: "100", sysType: "Quality", hostName: "asmq200.jnj.com", sysDetails: "EHP7 FOR SAP ERP 6.0 - Decommissioned JAN 2024", sector: "MedTech", platform: "USROTC", region: "North America", clientType: "ABAP", sysVersion: "740", logonGroup: "PUBLIC", portNumber: "3600", instanceNo: "00" }
                ]
            };
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "systemModel");

            var oHistoryData = {
                entries: [
                    { timestamp: "07-Aug-2026 16:45 IST", action: "System Created", sysId: "MY8", user: "Admin", status: "Active", statusState: "Success" },
                    { timestamp: "07-Aug-2026 15:30 IST", action: "System Modified", sysId: "MQ8", user: "Admin", status: "Decommissioned", statusState: "Warning" },
                    { timestamp: "06-Aug-2026 11:20 IST", action: "System Verified", sysId: "MP8", user: "AuditLead", status: "Connected", statusState: "Success" }
                ]
            };
            var oHistoryModel = new JSONModel(oHistoryData);
            this.getView().setModel(oHistoryModel, "historyModel");
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("configToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
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
            var sSysId = this.byId("newSysId") ? this.byId("newSysId").getValue().trim() : "";
            var sClient = this.byId("newClient") ? this.byId("newClient").getValue().trim() : "";
            var sSysType = this.byId("newSysTypeSelect") ? this.byId("newSysTypeSelect").getSelectedKey() : "Quality";
            var sHostName = this.byId("newHostName") ? this.byId("newHostName").getValue().trim() : "";
            var sSysDetails = this.byId("newSysDetails") ? this.byId("newSysDetails").getValue().trim() : "";
            var sSector = this.byId("newSector") ? this.byId("newSector").getValue().trim() : "MedTech";
            var sPlatform = this.byId("newPlatform") ? this.byId("newPlatform").getValue().trim() : "USROTC";
            var sRegion = this.byId("newRegion") ? this.byId("newRegion").getValue().trim() : "North America";
            var sClientType = this.byId("newClientTypeSelect") ? this.byId("newClientTypeSelect").getSelectedKey() : "ABAP";
            var sSysVersion = this.byId("newSysVersion") ? this.byId("newSysVersion").getValue().trim() : "750";
            var sLogonGroup = this.byId("newLogonGroup") ? this.byId("newLogonGroup").getValue().trim() : "PUBLIC";
            var sPortNumber = this.byId("newPortNumber") ? this.byId("newPortNumber").getValue().trim() : "3600";
            var sInstanceNo = this.byId("newInstanceNo") ? this.byId("newInstanceNo").getValue().trim() : "00";

            if (!sSysId || !sClient || !sHostName) {
                MessageBox.error("Please fill in mandatory fields: System ID, Client, and Host Name.");
                return;
            }

            var oModel = this.getView().getModel("systemModel");
            var aSystems = oModel.getProperty("/systems") || [];

            aSystems.unshift({
                sysId: sSysId,
                client: sClient,
                sysType: sSysType,
                hostName: sHostName,
                sysDetails: sSysDetails || ("EHP4 FOR SAP CRM 7.0"),
                sector: sSector,
                platform: sPlatform,
                region: sRegion,
                clientType: sClientType,
                sysVersion: sSysVersion,
                logonGroup: sLogonGroup,
                portNumber: sPortNumber,
                instanceNo: sInstanceNo
            });

            oModel.setProperty("/systems", aSystems);
            this.onCloseAddSystemDialog();

            MessageToast.show("New SAP System '" + sSysId + "' created successfully!");
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

            this._editingSystemItem.client = this.byId("editClient") ? this.byId("editClient").getValue().trim() : this._editingSystemItem.client;
            this._editingSystemItem.sysType = this.byId("editSysTypeSelect") ? this.byId("editSysTypeSelect").getSelectedKey() : this._editingSystemItem.sysType;
            this._editingSystemItem.hostName = this.byId("editHostName") ? this.byId("editHostName").getValue().trim() : this._editingSystemItem.hostName;
            this._editingSystemItem.sysDetails = this.byId("editSysDetails") ? this.byId("editSysDetails").getValue().trim() : this._editingSystemItem.sysDetails;
            this._editingSystemItem.sector = this.byId("editSector") ? this.byId("editSector").getValue().trim() : this._editingSystemItem.sector;
            this._editingSystemItem.platform = this.byId("editPlatform") ? this.byId("editPlatform").getValue().trim() : this._editingSystemItem.platform;
            this._editingSystemItem.region = this.byId("editRegion") ? this.byId("editRegion").getValue().trim() : this._editingSystemItem.region;
            this._editingSystemItem.clientType = this.byId("editClientTypeSelect") ? this.byId("editClientTypeSelect").getSelectedKey() : this._editingSystemItem.clientType;
            this._editingSystemItem.sysVersion = this.byId("editSysVersion") ? this.byId("editSysVersion").getValue().trim() : this._editingSystemItem.sysVersion;
            this._editingSystemItem.logonGroup = this.byId("editLogonGroup") ? this.byId("editLogonGroup").getValue().trim() : this._editingSystemItem.logonGroup;
            this._editingSystemItem.portNumber = this.byId("editPortNumber") ? this.byId("editPortNumber").getValue().trim() : this._editingSystemItem.portNumber;
            this._editingSystemItem.instanceNo = this.byId("editInstanceNo") ? this.byId("editInstanceNo").getValue().trim() : this._editingSystemItem.instanceNo;

            this.getView().getModel("systemModel").refresh(true);
            this.onCloseEditSystemDialog();

            MessageToast.show("SAP System '" + this._editingSystemItem.sysId + "' updated successfully!");
        },

        onDeleteSystem: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("systemModel").getObject();
            var oModel = this.getView().getModel("systemModel");
            var aSystems = oModel.getProperty("/systems") || [];

            MessageBox.confirm("Are you sure you want to delete SAP System '" + oItem.sysId + "' (Client " + oItem.client + ")?", {
                title: "Delete SAP System",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        var iIndex = aSystems.indexOf(oItem);
                        if (iIndex !== -1) {
                            aSystems.splice(iIndex, 1);
                            oModel.setProperty("/systems", aSystems);
                            MessageToast.show("SAP System '" + oItem.sysId + "' deleted.");
                        }
                    }
                }
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
        onAuditLogs: function () { this.getOwnerComponent().getRouter().navTo("AuditLogs"); },
        onConfiguration: function () { this.getOwnerComponent().getRouter().navTo("Configuration"); },
        onAccessManagement: function () { this.getOwnerComponent().getRouter().navTo("AccessManagement"); },
        onRiskAnalytics: function () { this.getOwnerComponent().getRouter().navTo("RiskAnalytics"); },
        onSystemHealth: function () { this.getOwnerComponent().getRouter().navTo("SystemHealth"); },
        onProfile: function () { this.getOwnerComponent().getRouter().navTo("Profile"); },

        onNotificationPress: function () { MessageToast.show("No new notifications."); },
        onLogout: function () {
            MessageToast.show("Logged Out Successfully");
            this.getOwnerComponent().getRouter().navTo("Login");
        }

    });

});

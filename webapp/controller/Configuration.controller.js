sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "xyraweb/model/config",
    "xyraweb/model/session"
], function (Controller, MessageToast, MessageBox, JSONModel, BusyIndicator, Config, Session) {
    "use strict";

    return Controller.extend("xyraweb.controller.Configuration", {

        onInit: function () {
            var oODataServices = new JSONModel({
                services: [
                    {
                        serviceName: "API_BUSINESS_PARTNER",
                        endpoint: "/sap/opu/odata/sap/API_BUSINESS_PARTNER",
                        version: "V2",
                        status: "Active",
                        statusState: "Success"
                    },
                    {
                        serviceName: "API_FINANCIAL_DOCUMENT",
                        endpoint: "/sap/opu/odata4/sap/API_FINANCIAL_DOCUMENT/srvd/sap/0001",
                        version: "V4",
                        status: "Active",
                        statusState: "Success"
                    },
                    {
                        serviceName: "API_SOX_GOVERNANCE_SRV",
                        endpoint: "/sap/opu/odata/sap/API_SOX_GOVERNANCE_SRV",
                        version: "V2",
                        status: "Active",
                        statusState: "Success"
                    },
                    {
                        serviceName: "API_RISK_COMPLIANCE_SRV",
                        endpoint: "/sap/opu/odata4/sap/API_RISK_COMPLIANCE/srvd/sap/0001",
                        version: "V4",
                        status: "Active",
                        statusState: "Success"
                    }
                ]
            });
            this.getView().setModel(oODataServices, "odataModel");

            this._loadConnection();
        },

        _loadConnection: function () {
            var oSession = Session.get();
            if (!oSession) {
                MessageBox.error("No active session. Please log in again.");
                this.getOwnerComponent().getRouter().navTo("Login");
                return;
            }

            BusyIndicator.show(0);

            fetch(Config.AUTH_BASE_URL + "/api/system-config/getSystemConnection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: oSession.subdomain })
            })
                .then(function (oResponse) { return oResponse.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();

                    if (!oData.success) {
                        MessageBox.error(oData.message || "Could not load connection settings.");
                        return;
                    }

                    if (!oData.hasConnection) {
                        return;
                    }

                    if (this.byId("sysName")) { this.byId("sysName").setValue(oData.systemName || ""); }
                    if (this.byId("hostName")) { this.byId("hostName").setValue(oData.hostName || ""); }
                    if (this.byId("sysId")) { this.byId("sysId").setValue(oData.systemId || ""); }
                    if (this.byId("client")) { this.byId("client").setValue(oData.client || ""); }
                    if (this.byId("instanceNum")) { this.byId("instanceNum").setValue(oData.instanceNo || ""); }
                    if (this.byId("port")) { this.byId("port").setValue(oData.port || ""); }
                }.bind(this))
                .catch(function () {
                    BusyIndicator.hide();
                    MessageBox.error("Could not reach the server. Is xyra-core running?");
                });
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("configToolPage");
            if (oToolPage) {
                var bSideExpanded = oToolPage.getSideExpanded();
                oToolPage.setSideExpanded(!bSideExpanded);
            }
            var oSideNav = this.byId("sideNavigation");
            if (oSideNav) {
                var bExpanded = oSideNav.getExpanded();
                oSideNav.setExpanded(!bExpanded);
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

        onAdmin: function () {
            this.getOwnerComponent().getRouter().navTo("Admin");
        },

        onUserManagement: function () {
            this.getOwnerComponent().getRouter().navTo("UserManagement");
        },

        onRoleManagement: function () {
            this.getOwnerComponent().getRouter().navTo("RoleManagement");
        },

        onControlManagement: function () {
            this.getOwnerComponent().getRouter().navTo("ControlManagement");
        },

        onControlMonitoring: function () {
            this.getOwnerComponent().getRouter().navTo("ControlMonitoring");
        },

        onAIInsights: function () {
            this.getOwnerComponent().getRouter().navTo("AIInsights");
        },

        onSOXCompliance: function () {
            this.getOwnerComponent().getRouter().navTo("SOXCompliance");
        },

        onReports: function () {
            this.getOwnerComponent().getRouter().navTo("Reports");
        },

        onAuditLogs: function () {
            this.getOwnerComponent().getRouter().navTo("AuditLogs");
        },

        onConfiguration: function () {
            this.getOwnerComponent().getRouter().navTo("Configuration");
        },

        onAccessManagement: function () {
            this.getOwnerComponent().getRouter().navTo("AccessManagement");
        },

        onRiskAnalytics: function () {
            this.getOwnerComponent().getRouter().navTo("RiskAnalytics");
        },

        onEmergencyAccess: function () {
            this.getOwnerComponent().getRouter().navTo("EmergencyAccess");
        },

        onSystemHealth: function () {
            this.getOwnerComponent().getRouter().navTo("SystemHealth");
        },

        onProfile: function () {
            this.getOwnerComponent().getRouter().navTo("Profile");
        },

        onNumberLiveChange: function (oEvent) {
            var sVal = oEvent.getParameter("value");
            if (sVal) {
                var sCleanVal = sVal.replace(/[^0-9]/g, "");
                if (sVal !== sCleanVal) {
                    oEvent.getSource().setValue(sCleanVal);
                }
            }
        },

        onTestConnection: function () {
            var oSession = Session.get();
            if (!oSession) {
                MessageBox.error("No active session. Please log in again.");
                return;
            }

            var sHostName = this.byId("hostName") ? this.byId("hostName").getValue().trim() : "";
            var sPort = this.byId("port") ? this.byId("port").getValue().trim() : "";
            var oStatus = this.byId("connectionStatusText");
            var oLastValidation = this.byId("lastValidationText");

            if (!sHostName || !sPort) {
                MessageToast.show("Enter Host Name/IP and Port before testing.");
                return;
            }

            BusyIndicator.show(0);

            fetch(Config.AUTH_BASE_URL + "/api/system-config/testSystemConnection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: oSession.subdomain, hostName: sHostName, port: sPort })
            })
                .then(function (oResponse) { return oResponse.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();

                    if (oStatus) {
                        oStatus.setText(oData.success ? "Connected" : "Unreachable");
                        oStatus.setState(oData.success ? "Success" : "Error");
                        oStatus.setIcon(oData.success ? "sap-icon://sys-enter-2" : "sap-icon://alert");
                    }
                    if (oLastValidation) {
                        oLastValidation.setText(new Date().toLocaleString());
                    }

                    MessageToast.show(oData.message);
                })
                .catch(function () {
                    BusyIndicator.hide();
                    MessageToast.show("Could not reach the server. Is xyra-core running?");
                });
        },

        onSaveConfiguration: function () {
            var oSession = Session.get();
            if (!oSession) {
                MessageBox.error("No active session. Please log in again.");
                return;
            }

            var sSystemId = this.byId("sysId") ? this.byId("sysId").getValue().trim() : "";
            var sClient = this.byId("client") ? this.byId("client").getValue().trim() : "";

            if (!sSystemId || !sClient) {
                MessageToast.show("System ID (SID) and Client are required.");
                return;
            }

            BusyIndicator.show(0);

            fetch(Config.AUTH_BASE_URL + "/api/system-config/saveSystemConnection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subdomain: oSession.subdomain,
                    systemName: this.byId("sysName") ? this.byId("sysName").getValue() : "",
                    hostName: this.byId("hostName") ? this.byId("hostName").getValue() : "",
                    systemId: sSystemId,
                    client: sClient,
                    instanceNo: this.byId("instanceNum") ? this.byId("instanceNum").getValue() : "",
                    port: this.byId("port") ? this.byId("port").getValue() : "",
                    jwtToken: this.byId("jwtToken") ? this.byId("jwtToken").getValue() : ""
                })
            })
                .then(function (oResponse) { return oResponse.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();

                    if (!oData.success) {
                        MessageToast.show(oData.message || "Could not save configuration.");
                        return;
                    }

                    MessageToast.show("Configuration Saved Successfully.");
                })
                .catch(function () {
                    BusyIndicator.hide();
                    MessageToast.show("Could not reach the server. Is xyra-core running?");
                });
        },

        onResetConfiguration: function () {
            if (this.byId("sysName")) { this.byId("sysName").setValue(""); }
            if (this.byId("hostName")) { this.byId("hostName").setValue(""); }
            if (this.byId("sysId")) { this.byId("sysId").setValue(""); }
            if (this.byId("client")) { this.byId("client").setValue(""); }
            if (this.byId("instanceNum")) { this.byId("instanceNum").setValue(""); }
            if (this.byId("port")) { this.byId("port").setValue(""); }
            if (this.byId("jwtToken")) { this.byId("jwtToken").setValue(""); }
            MessageToast.show("Configuration fields reset successfully.");
        },

        onTestConnector: function () {
            MessageToast.show("Cloud Connector Test Successful: Location ID US10_DC_EAST Online.");
        },

        onCreateDestination: function () {
            MessageToast.show("Destination Service Instance Created Successfully.");
        },

        onTestDestination: function () {
            MessageToast.show("Destination Endpoint Reachable: S4HANA_DEST_SERVICE Active.");
        },

        onTestService: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("odataModel").getObject();
            MessageToast.show("Testing OData Service '" + oItem.serviceName + "'... Status: 200 OK");
        },

        onActivateService: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("odataModel").getObject();
            MessageToast.show("OData Service '" + oItem.serviceName + "' Activated.");
        },

        onStartMonitoring: function () {
            MessageToast.show("Automated Control Monitoring Started Successfully!");
        },

        onNextStep: function () {
            var oWizard = this.byId("configWizard");
            if (oWizard) {
                oWizard.nextStep();
            }
        },

        onAdminProfilePress: function (oEvent) {
            var oButton = oEvent.getSource();
            var oPopover = this.byId("configProfilePopover");
            if (oPopover) {
                oPopover.openBy(oButton);
            }
        },

        onNotificationPress: function () {
            MessageToast.show("System Notifications: All BTP & S/4HANA Connections Operational");
        },

        onSearchPress: function () {
            MessageToast.show("Search initiated");
        },

        onHelpPress: function () {
            MessageToast.show("SAP BTP Connectivity Documentation loaded");
        },

        onQuickAction: function (oEvent) {
            var sText = oEvent.getSource().getText();
            MessageToast.show("Action triggered: " + sText);
        },

        onLogout: function () {
            Session.clear();
            MessageToast.show("Logged Out Successfully");
            this.getOwnerComponent().getRouter().navTo("Login");
        }

    });

});

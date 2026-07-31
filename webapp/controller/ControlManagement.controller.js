sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("xyraweb.controller.ControlManagement", {

        onInit: function () {
            var oData = {
                controls: [
                    {
                        id: "CTRL-FIN-001",
                        name: "Financial Journal Entry Threshold Audit",
                        owner: "Sarah Jenkins (Finance Lead)",
                        riskLevel: "Critical",
                        riskState: "Error",
                        category: "Financial",
                        frequency: "Real-time",
                        status: "Active",
                        statusState: "Success"
                    },
                    {
                        id: "CTRL-SOX-002",
                        name: "Segregation of Duties (SoD) Conflict Scan",
                        owner: "Michael Chang (GRC Officer)",
                        riskLevel: "High",
                        riskState: "Warning",
                        category: "SOX",
                        frequency: "Daily",
                        status: "Active",
                        statusState: "Success"
                    },
                    {
                        id: "CTRL-ITGC-003",
                        name: "SAP Superuser Privilege Escalation Check",
                        owner: "Alex Rivera (Security Admin)",
                        riskLevel: "Critical",
                        riskState: "Error",
                        category: "ITGC",
                        frequency: "Real-time",
                        status: "Under Review",
                        statusState: "Warning"
                    },
                    {
                        id: "CTRL-SEC-004",
                        name: "Vendor Master Bank Account Change Verification",
                        owner: "David Miller (Procurement Manager)",
                        riskLevel: "Medium",
                        riskState: "None",
                        category: "Security",
                        frequency: "Weekly",
                        status: "Active",
                        statusState: "Success"
                    },
                    {
                        id: "CTRL-FIN-005",
                        name: "Automated Purchase Order Approval Matrix Check",
                        owner: "Emma Watson (Compliance Lead)",
                        riskLevel: "Low",
                        riskState: "Success",
                        category: "Financial",
                        frequency: "Monthly",
                        status: "Active",
                        statusState: "Success"
                    }
                ]
            };

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "controlsModel");
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("controlManagementToolPage");
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

        onTabSelectionChange: function (oEvent) {
            var sSelectedKey = oEvent.getParameter("item") ? oEvent.getParameter("item").getKey() : "";
            if (sSelectedKey === "AutomationMonitoring") {
                this.getOwnerComponent().getRouter().navTo("AutomationMonitoring");
            }
        },

        onNavAutomationMonitoring: function () {
            this.getOwnerComponent().getRouter().navTo("AutomationMonitoring");
        },

        onCreateControl: function () {
            var oDialog = this.byId("createControlDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseCreateControlDialog: function () {
            var oDialog = this.byId("createControlDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onSubmitCreateControl: function () {
            var oIdInput = this.byId("createControlIdInput");
            var oNameInput = this.byId("createControlNameInput");
            var oOwnerInput = this.byId("createControlOwnerInput");
            var oRiskSelect = this.byId("createControlRiskSelect");
            var oCategorySelect = this.byId("createControlCategorySelect");
            var oFrequencySelect = this.byId("createControlFrequencySelect");

            var sId = oIdInput ? oIdInput.getValue().trim() : "";
            var sName = oNameInput ? oNameInput.getValue().trim() : "";
            var sOwner = oOwnerInput ? oOwnerInput.getValue().trim() : "";
            var sRisk = oRiskSelect ? oRiskSelect.getSelectedKey() : "Critical";
            var sCategory = oCategorySelect ? oCategorySelect.getSelectedKey() : "Financial";
            var sFrequency = oFrequencySelect ? oFrequencySelect.getSelectedKey() : "Real-time";

            if (!sId || !sName || !sOwner) {
                MessageBox.error("Please fill in Control ID, Control Name, and Assign Owner.");
                return;
            }

            var mRiskState = {
                "Critical": "Error",
                "High": "Warning",
                "Medium": "None",
                "Low": "Success"
            };

            var oModel = this.getView().getModel("controlsModel");
            var aControls = oModel.getProperty("/controls") || [];

            aControls.unshift({
                id: sId,
                name: sName,
                owner: sOwner,
                riskLevel: sRisk,
                riskState: mRiskState[sRisk] || "None",
                category: sCategory,
                frequency: sFrequency,
                status: "Active",
                statusState: "Success"
            });

            oModel.setProperty("/controls", aControls);

            MessageToast.show("Control '" + sId + "' Created Successfully!");

            if (oIdInput) { oIdInput.setValue(""); }
            if (oNameInput) { oNameInput.setValue(""); }
            if (oOwnerInput) { oOwnerInput.setValue(""); }

            this.onCloseCreateControlDialog();
        },

        onEditControl: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("controlsModel");
            this._sEditingPath = oContext.getPath();
            var oItem = oContext.getObject();

            var oIdInput = this.byId("editControlIdInput");
            var oNameInput = this.byId("editControlNameInput");
            var oOwnerInput = this.byId("editControlOwnerInput");
            var oRiskSelect = this.byId("editControlRiskSelect");
            var oCategorySelect = this.byId("editControlCategorySelect");
            var oFrequencySelect = this.byId("editControlFrequencySelect");
            var oStatusSelect = this.byId("editControlStatusSelect");

            if (oIdInput) { oIdInput.setValue(oItem.id); }
            if (oNameInput) { oNameInput.setValue(oItem.name); }
            if (oOwnerInput) { oOwnerInput.setValue(oItem.owner); }
            if (oRiskSelect) { oRiskSelect.setSelectedKey(oItem.riskLevel); }
            if (oCategorySelect) { oCategorySelect.setSelectedKey(oItem.category); }
            if (oFrequencySelect) { oFrequencySelect.setSelectedKey(oItem.frequency); }
            if (oStatusSelect) { oStatusSelect.setSelectedKey(oItem.status || "Active"); }

            var oDialog = this.byId("editControlDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseEditControlDialog: function () {
            var oDialog = this.byId("editControlDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onSubmitEditControl: function () {
            if (!this._sEditingPath) { return; }
            var oModel = this.getView().getModel("controlsModel");

            var sName = this.byId("editControlNameInput").getValue().trim();
            var sOwner = this.byId("editControlOwnerInput").getValue().trim();
            var sRisk = this.byId("editControlRiskSelect").getSelectedKey();
            var sCategory = this.byId("editControlCategorySelect").getSelectedKey();
            var sFrequency = this.byId("editControlFrequencySelect").getSelectedKey();
            var sStatus = this.byId("editControlStatusSelect").getSelectedKey();

            if (!sName || !sOwner) {
                MessageBox.error("Control Name and Assign Owner cannot be empty.");
                return;
            }

            var mRiskState = {
                "Critical": "Error",
                "High": "Warning",
                "Medium": "None",
                "Low": "Success"
            };

            var mStatusState = {
                "Active": "Success",
                "Under Review": "Warning",
                "Inactive": "Error"
            };

            oModel.setProperty(this._sEditingPath + "/name", sName);
            oModel.setProperty(this._sEditingPath + "/owner", sOwner);
            oModel.setProperty(this._sEditingPath + "/riskLevel", sRisk);
            oModel.setProperty(this._sEditingPath + "/riskState", mRiskState[sRisk] || "None");
            oModel.setProperty(this._sEditingPath + "/category", sCategory);
            oModel.setProperty(this._sEditingPath + "/frequency", sFrequency);
            oModel.setProperty(this._sEditingPath + "/status", sStatus);
            oModel.setProperty(this._sEditingPath + "/statusState", mStatusState[sStatus] || "None");

            MessageToast.show("Control Updated Successfully!");
            this.onCloseEditControlDialog();
        },

        onAssignOwner: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("controlsModel");
            this._sAssigningPath = oContext.getPath();
            var oItem = oContext.getObject();

            var oIdText = this.byId("assignControlIdText");
            var oNameTitle = this.byId("assignControlNameTitle");
            var oOwnerCombo = this.byId("assignOwnerComboBox");

            if (oIdText) { oIdText.setText("Control ID: " + oItem.id); }
            if (oNameTitle) { oNameTitle.setText(oItem.name); }
            if (oOwnerCombo) { oOwnerCombo.setValue(oItem.owner); }

            var oDialog = this.byId("assignOwnerDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseAssignOwnerDialog: function () {
            var oDialog = this.byId("assignOwnerDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onSubmitAssignOwner: function () {
            if (!this._sAssigningPath) { return; }
            var oModel = this.getView().getModel("controlsModel");
            var oOwnerCombo = this.byId("assignOwnerComboBox");
            var sNewOwner = oOwnerCombo ? oOwnerCombo.getValue().trim() : "";

            if (!sNewOwner) {
                MessageBox.error("Please enter or select a business owner.");
                return;
            }

            oModel.setProperty(this._sAssigningPath + "/owner", sNewOwner);
            MessageToast.show("Owner assigned successfully!");
            this.onCloseAssignOwnerDialog();
        },

        onSearchControls: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            MessageToast.show("Filtering controls by query: " + sQuery);
        },

        onFilterCategory: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            MessageToast.show("Category filter set to: " + sKey);
        },

        onTilePress: function (oEvent) {
            var sHeader = oEvent.getSource().getHeader();
            MessageToast.show("KPI Tile clicked: " + sHeader);
        },

        onAdmin: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
        onRoleManagement: function () { this.getOwnerComponent().getRouter().navTo("RoleManagement"); },
        onControlManagement: function () { this.getOwnerComponent().getRouter().navTo("ControlManagement"); },
        onControlMonitoring: function () { this.getOwnerComponent().getRouter().navTo("ControlMonitoring"); },
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

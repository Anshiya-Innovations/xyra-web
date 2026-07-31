sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("xyraweb.controller.AutomationMonitoring", {

        onInit: function () {
            var oData = {
                jobs: [
                    {
                        jobId: "AUTO-JOB-101",
                        controlName: "Segregation of Duties (SoD) Conflict Scan",
                        schedule: "Every 15 min",
                        lastExecution: "31-Jul-2026 17:15 IST",
                        nextExecution: "31-Jul-2026 17:30 IST",
                        executionStatus: "SUCCESS",
                        statusState: "Success",
                        deviationCount: 0,
                        deviationState: "None"
                    },
                    {
                        jobId: "AUTO-JOB-102",
                        controlName: "Financial Journal Entry Threshold Audit",
                        schedule: "Daily at 00:00",
                        lastExecution: "31-Jul-2026 00:00 IST",
                        nextExecution: "01-Aug-2026 00:00 IST",
                        executionStatus: "FAILED",
                        statusState: "Error",
                        deviationCount: 8,
                        deviationState: "Indication18"
                    },
                    {
                        jobId: "AUTO-JOB-103",
                        controlName: "SAP Superuser Privilege Escalation Check",
                        schedule: "Real-time Event Hook",
                        lastExecution: "31-Jul-2026 17:02 IST",
                        nextExecution: "Pending Event",
                        executionStatus: "RUNNING",
                        statusState: "Information",
                        deviationCount: 2,
                        deviationState: "Indication17"
                    },
                    {
                        jobId: "AUTO-JOB-104",
                        controlName: "Vendor Master Bank Account Change Verification",
                        schedule: "Hourly",
                        lastExecution: "31-Jul-2026 17:00 IST",
                        nextExecution: "31-Jul-2026 18:00 IST",
                        executionStatus: "SUCCESS",
                        statusState: "Success",
                        deviationCount: 0,
                        deviationState: "None"
                    },
                    {
                        jobId: "AUTO-JOB-105",
                        controlName: "Automated Purchase Order Approval Matrix Check",
                        schedule: "Daily at 06:00",
                        lastExecution: "31-Jul-2026 06:00 IST",
                        nextExecution: "01-Aug-2026 06:00 IST",
                        executionStatus: "FAILED",
                        statusState: "Error",
                        deviationCount: 4,
                        deviationState: "Indication18"
                    }
                ]
            };

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "automationModel");
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("automationMonitoringToolPage");
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
            if (sSelectedKey === "ControlManagement") {
                this.getOwnerComponent().getRouter().navTo("ControlManagement");
            }
        },

        onNavControlManagement: function () {
            this.getOwnerComponent().getRouter().navTo("ControlManagement");
        },

        onRetryFailedJobs: function () {
            MessageBox.confirm("Are you sure you want to retry all 2 failed automation jobs?", {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        MessageToast.show("Retrying failed automation jobs...");
                    }
                }
            });
        },

        onRetrySingleJob: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("automationModel").getObject();
            MessageToast.show("Retrying automation job: " + oItem.jobId);
        },

        onViewLogs: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("automationModel").getObject();

            var oDialog = this.byId("jobLogsDialog");
            var oTitle = this.byId("logJobIdTitle");
            var oControlText = this.byId("logControlNameText");
            var oStatus = this.byId("logJobStatus");

            if (oTitle) { oTitle.setText("Job ID: " + oItem.jobId); }
            if (oControlText) { oControlText.setText("Control: " + oItem.controlName + " (" + oItem.schedule + ")"); }
            if (oStatus) {
                oStatus.setText(oItem.executionStatus);
                oStatus.setState(oItem.statusState);
            }

            var aMockLogs = [
                { timestamp: oItem.lastExecution, level: "INFO", levelState: "Information", message: "Job initialized via automated schedule engine." },
                { timestamp: oItem.lastExecution, level: "INFO", levelState: "Information", message: "OData connection established with SAP S/4HANA target endpoint." },
                { timestamp: oItem.lastExecution, level: oItem.executionStatus === "FAILED" ? "ERROR" : "INFO", levelState: oItem.executionStatus === "FAILED" ? "Error" : "Information", message: oItem.executionStatus === "FAILED" ? "Rule evaluation failed: Timeout waiting for SAP response." : "Scanned 1,420 transactions against control logic." },
                { timestamp: oItem.lastExecution, level: oItem.executionStatus === "FAILED" ? "ERROR" : "SUCCESS", levelState: oItem.executionStatus === "FAILED" ? "Error" : "Success", message: "Execution finished with " + oItem.deviationCount + " deviations detected." }
            ];

            var oLogsModel = new JSONModel({ logEntries: aMockLogs });
            this.getView().setModel(oLogsModel, "logsModel");

            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseLogsDialog: function () {
            var oDialog = this.byId("jobLogsDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onDownloadLogs: function () {
            MessageToast.show("Execution log file downloaded successfully.");
        },

        onSearchJobs: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            MessageToast.show("Searching automation logs: " + sQuery);
        },

        onFilterStatus: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            MessageToast.show("Filtered jobs by status: " + sKey);
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

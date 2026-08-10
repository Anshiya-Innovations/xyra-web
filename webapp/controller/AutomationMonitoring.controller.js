sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, MessageToast, MessageBox, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("xyraweb.controller.AutomationMonitoring", {

        onInit: function () {
            var oData = {
                controls: [
                    {
                        id: "XYRA-08",
                        description: "SAP Java Audit Log Filters & Security Event Monitoring",
                        sysType1: "DEV",
                        sysType2: "QAS",
                        sysType3: "PRD",
                        frequencyRun: "Daily",
                        cronExpr: "",
                        totalRun: "365",
                        deviationLabel: "No Deviation",
                        deviationState: "None",
                        deviationClass: "badgeWhite",
                        deviationCount: 0,
                        rules: [
                            { parameter: "Password Changed", operator: "Equals", expectedValue: "True", actualValue: "True", statusText: "No Deviation", statusState: "Success", statusIcon: "sap-icon://sys-enter-2" }
                        ],
                        logs: [
                            { timestamp: "06-Aug-2026 08:00 IST", level: "INFO", levelState: "Information", message: "Automated daily monitoring job initiated." },
                            { timestamp: "06-Aug-2026 08:01 IST", level: "INFO", levelState: "Information", message: "Connected to SAP S/4HANA PRD system node." },
                            { timestamp: "06-Aug-2026 08:02 IST", level: "SUCCESS", levelState: "Success", message: "Rule evaluation completed: All parameters matched. 0 deviations detected." }
                        ]
                    },
                    {
                        id: "XYRA-28",
                        description: "SAP HANA Security Audit Logging & Retention Check",
                        sysType1: "PRD",
                        sysType2: "QAS",
                        sysType3: "None",
                        frequencyRun: "Weekly (Every Monday)",
                        cronExpr: "",
                        totalRun: "52",
                        deviationLabel: "Deviation High",
                        deviationState: "Error",
                        deviationClass: "badgeRed",
                        deviationCount: 5,
                        rules: [
                            { parameter: "Roles Assigned", operator: "Equals", expectedValue: "True", actualValue: "False", statusText: "Deviation High (Critical)", statusState: "Error", statusIcon: "sap-icon://alert" }
                        ],
                        logs: [
                            { timestamp: "04-Aug-2026 00:00 IST", level: "INFO", levelState: "Information", message: "Weekly scheduled audit log check started." },
                            { timestamp: "04-Aug-2026 00:01 IST", level: "WARNING", levelState: "Warning", message: "Parameter 'Roles Assigned' evaluated to 'False' on 5 accounts." },
                            { timestamp: "04-Aug-2026 00:02 IST", level: "ERROR", levelState: "Error", message: "Rule failure: 5 deviations identified on SAP HANA PRD system." }
                        ]
                    },
                    {
                        id: "XYRA-01",
                        description: "Segregation of Duties (SoD) Conflict Scan & Privilege Escalation",
                        sysType1: "DEV",
                        sysType2: "QAS",
                        sysType3: "None",
                        frequencyRun: "Daily",
                        cronExpr: "",
                        totalRun: "365",
                        deviationLabel: "No Deviation",
                        deviationState: "None",
                        deviationClass: "badgeWhite",
                        deviationCount: 0,
                        rules: [
                            { parameter: "User Type", operator: "Equals", expectedValue: "B (System User)", actualValue: "B (System User)", statusText: "No Deviation", statusState: "Success", statusIcon: "sap-icon://sys-enter-2" },
                            { parameter: "Super User", operator: "Equals", expectedValue: "SUPER", actualValue: "SUPER", statusText: "No Deviation", statusState: "Success", statusIcon: "sap-icon://sys-enter-2" }
                        ],
                        logs: [
                            { timestamp: "06-Aug-2026 13:45 IST", level: "INFO", levelState: "Information", message: "Daily event hook scanner active." },
                            { timestamp: "06-Aug-2026 13:46 IST", level: "SUCCESS", levelState: "Success", message: "Scanned 1,850 user assignments against rules. Clean." }
                        ]
                    },
                    {
                        id: "XYRA-002",
                        description: "Financial Journal Entry Threshold Audit & PO Limit Verification",
                        sysType1: "PRD",
                        sysType2: "None",
                        sysType3: "None",
                        frequencyRun: "Monthly (Last day of month)",
                        cronExpr: "",
                        totalRun: "12",
                        deviationLabel: "Deviation Low",
                        deviationState: "Warning",
                        deviationClass: "badgeYellow",
                        deviationCount: 2,
                        rules: [
                            { parameter: "Security Policy", operator: "Equals", expectedValue: "True", actualValue: "False", statusText: "Deviation Low (Minor)", statusState: "Warning", statusIcon: "sap-icon://alert" }
                        ],
                        logs: [
                            { timestamp: "31-Jul-2026 23:59 IST", level: "INFO", levelState: "Information", message: "Monthly financial threshold job triggered." },
                            { timestamp: "31-Jul-2026 23:59 IST", level: "ERROR", levelState: "Error", message: "2 PO entries exceeded max approval threshold without dual authorization." }
                        ]
                    },
                    {
                        id: "XYRA-003",
                        description: "Automated Kernel Audit Logging & Parameter Validation",
                        sysType1: "DEV",
                        sysType2: "QAS",
                        sysType3: "PRD",
                        frequencyRun: "Cron Expression",
                        cronExpr: "0 0 1 * *",
                        totalRun: "12",
                        deviationLabel: "No Deviation",
                        deviationState: "None",
                        deviationClass: "badgeWhite",
                        deviationCount: 0,
                        rules: [
                            { parameter: "SDMI_* Exists", operator: "Equals", expectedValue: "True", actualValue: "True", statusText: "No Deviation", statusState: "Success", statusIcon: "sap-icon://sys-enter-2" }
                        ],
                        logs: [
                            { timestamp: "01-Aug-2026 00:00 IST", level: "INFO", levelState: "Information", message: "Cron engine executed rule validation." },
                            { timestamp: "01-Aug-2026 00:01 IST", level: "SUCCESS", levelState: "Success", message: "Kernel audit parameters validated successfully. No deviations." }
                        ]
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

        onNavControlManagement: function () {
            this.getOwnerComponent().getRouter().navTo("ControlManagement");
        },

        onViewRule: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("automationModel").getObject();
            var oDialog = this.byId("ruleDetailsDialog");

            if (this.byId("ruleControlIdTitle")) { this.byId("ruleControlIdTitle").setText("Control ID: " + oItem.id); }
            if (this.byId("ruleControlDescText")) { this.byId("ruleControlDescText").setText(oItem.description); }

            var oOverallStatus = this.byId("ruleOverallStatus");
            var oMessageStrip = this.byId("ruleStatusMessageStrip");

            if (oOverallStatus) {
                oOverallStatus.setText(oItem.deviationLabel);
                oOverallStatus.setState(oItem.deviationState);

                // Update badge class dynamically
                oOverallStatus.removeStyleClass("badgeWhite");
                oOverallStatus.removeStyleClass("badgeYellow");
                oOverallStatus.removeStyleClass("badgeRed");
                oOverallStatus.addStyleClass(oItem.deviationClass || "badgeWhite");
            }

            if (oMessageStrip) {
                if (oItem.deviationLabel === "No Deviation") {
                    oMessageStrip.setText("Rule Satisfied: No deviations detected across evaluated system targets.");
                    oMessageStrip.setType("Success");
                } else if (oItem.deviationLabel === "Deviation Low") {
                    oMessageStrip.setText("Deviation Low: Minor deviation detected (" + oItem.deviationCount + " non-critical parameters out of compliance).");
                    oMessageStrip.setType("Warning");
                } else {
                    oMessageStrip.setText("Deviation High: Critical deviation detected (" + oItem.deviationCount + " high-risk security violations identified).");
                    oMessageStrip.setType("Error");
                }
            }

            var oRuleDetailsModel = new JSONModel({ rules: oItem.rules || [] });
            this.getView().setModel(oRuleDetailsModel, "ruleDetailsModel");

            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseRuleDialog: function () {
            var oDialog = this.byId("ruleDetailsDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onViewLogs: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("automationModel").getObject();
            var oDialog = this.byId("jobLogsDialog");

            if (this.byId("logJobIdTitle")) { this.byId("logJobIdTitle").setText("Control ID: " + oItem.id); }
            if (this.byId("logControlNameText")) { this.byId("logControlNameText").setText(oItem.description + " (" + oItem.frequencyRun + ")"); }
            if (this.byId("logJobStatus")) {
                var bHasDev = (oItem.deviationCount > 0);
                this.byId("logJobStatus").setText(bHasDev ? "DEVIATION" : "SUCCESS");
                this.byId("logJobStatus").setState(bHasDev ? "Error" : "Success");
            }

            var oLogsModel = new JSONModel({ logEntries: oItem.logs || [] });
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

        onSearchControls: function (oEvent) {
            var sQuery = "";
            if (oEvent && typeof oEvent.getParameter === "function") {
                var sParamQuery = oEvent.getParameter("query");
                var sParamNewVal = oEvent.getParameter("newValue");
                sQuery = (sParamQuery !== undefined && sParamQuery !== null && sParamQuery !== "") ? sParamQuery : ((sParamNewVal !== undefined && sParamNewVal !== null) ? sParamNewVal : "");
            }
            if ((!sQuery || sQuery === "") && this.byId("searchAutomationId")) {
                sQuery = this.byId("searchAutomationId").getValue();
            }
            sQuery = sQuery ? sQuery.trim() : "";

            var aFilters = [];
            if (sQuery) {
                var oFilterId = new Filter("id", FilterOperator.Contains, sQuery);
                var oFilterDesc = new Filter("description", FilterOperator.Contains, sQuery);
                var oFilterSys1 = new Filter("sysType1", FilterOperator.Contains, sQuery);
                var oFilterSys2 = new Filter("sysType2", FilterOperator.Contains, sQuery);
                var oFilterSys3 = new Filter("sysType3", FilterOperator.Contains, sQuery);
                var oFilterFreq = new Filter("frequencyRun", FilterOperator.Contains, sQuery);
                var oFilterDev = new Filter("deviationLabel", FilterOperator.Contains, sQuery);

                aFilters.push(new Filter({
                    filters: [oFilterId, oFilterDesc, oFilterSys1, oFilterSys2, oFilterSys3, oFilterFreq, oFilterDev],
                    and: false
                }));
            }

            var oTable = this.byId("automationTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },

        onAdmin: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
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

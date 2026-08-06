sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("xyraweb.controller.Reports", {

        onInit: function () {
            var oData = {
                availableReports: [
                    {
                        name: "Reviewer 1 Audit Report",
                        subtitle: "Primary Level Evidence Review & Compliance Verification",
                        type: "Reviewer 1",
                        description: "Level 1 control review audit trace, reviewer approval logs, and verification status.",
                        lastGenerated: "03-Aug-2026 10:15 IST"
                    },
                    {
                        name: "Reviewer 2 Technical Audit Report",
                        subtitle: "Secondary Technical Validation & SOD Check",
                        type: "Reviewer 2",
                        description: "Level 2 technical assessment logs, SOD validation traces, and secondary approval history.",
                        lastGenerated: "03-Aug-2026 11:45 IST"
                    },
                    {
                        name: "Escalation Manager Report",
                        subtitle: "High-Risk Escalation & Overdue Incident Log",
                        type: "Escalation Manager",
                        description: "Escalation management audit trace, SLA violation tracking, and manager reassignment records.",
                        lastGenerated: "03-Aug-2026 12:00 IST"
                    },
                    {
                        name: "SOX Compliance Report",
                        subtitle: "Internal Control Effectiveness & Audit Evidence",
                        type: "SOX Compliance",
                        description: "SOX 404 control validation details, test execution logs, and compliance score metrics.",
                        lastGenerated: "03-Aug-2026 09:00 IST"
                    },
                    {
                        name: "Role Change Report",
                        subtitle: "Manual Role Modifications & SCS Audit Logs",
                        type: "Role Change",
                        description: "Audit trace of manual SAP PFCG role changes, authorization additions, and SCS compliance checks.",
                        lastGenerated: "03-Aug-2026 11:15 IST"
                    },
                    {
                        name: "User Access Review",
                        subtitle: "Quarterly Access Certification & Persona Logs",
                        type: "User Access Review",
                        description: "User entitlement assignments, active persona mappings, and revoked access logs.",
                        lastGenerated: "02-Aug-2026 18:00 IST"
                    },
                    {
                        name: "SOD Conflict Report",
                        subtitle: "Segregation of Duties Matrix Analysis",
                        type: "SOD Conflict",
                        description: "Identified SOD conflicts across financial postings, procurement approvals, and vendor master changes.",
                        lastGenerated: "03-Aug-2026 12:30 IST"
                    },
                    {
                        name: "Elevated Access Report",
                        subtitle: "Superuser Emergency Access & T-Code Trace",
                        type: "Elevated Access",
                        description: "Privileged SAP superuser session logs, executed T-codes, and emergency access approval records.",
                        lastGenerated: "01-Aug-2026 22:00 IST"
                    },
                    {
                        name: "Critical Authorization Report",
                        subtitle: "Sensitive Auth Objects & High-Risk Privileges",
                        type: "Critical Auth",
                        description: "Detailed scan of critical SAP authorizations (S_TABU_DIS, S_DEVELOP, SAP_ALL privileges).",
                        lastGenerated: "03-Aug-2026 10:45 IST"
                    },
                    {
                        name: "Audit Log Report",
                        subtitle: "Security Audit Log & System Event History",
                        type: "Audit Log",
                        description: "SAP Security Audit Log (SM20) events, failed login attempts, and system configuration modifications.",
                        lastGenerated: "03-Aug-2026 08:15 IST"
                    },
                    {
                        name: "AI Risk Analysis Report",
                        subtitle: "GenAI Predictive Risk & Anomaly Intelligence",
                        type: "AI Risk Analysis",
                        description: "AI-driven risk scoring, anomaly detection in journal entries, and automated mitigation recommendations.",
                        lastGenerated: "03-Aug-2026 13:00 IST"
                    }
                ],

                history: [
                    {
                        name: "Reviewer 1 Evidence Review Log",
                        type: "Reviewer 1",
                        system: "PRD-100",
                        generatedBy: "Jane Smith (Reviewer 1)",
                        generatedDate: "03-Aug-2026 10:15 IST",
                        status: "Completed",
                        statusState: "Success"
                    },
                    {
                        name: "Reviewer 2 SOD Assessment Report",
                        type: "Reviewer 2",
                        system: "PRD-100",
                        generatedBy: "Robert Chen (Reviewer 2)",
                        generatedDate: "03-Aug-2026 11:45 IST",
                        status: "Completed",
                        statusState: "Success"
                    },
                    {
                        name: "Escalation Incident & SLA Violation Summary",
                        type: "Escalation Manager",
                        system: "PRD-100",
                        generatedBy: "Marcus Vance (Escalation Lead)",
                        generatedDate: "03-Aug-2026 12:00 IST",
                        status: "Completed",
                        statusState: "Success"
                    },
                    {
                        name: "Q3 SOX Compliance Audit Evidence",
                        type: "SOX Compliance",
                        system: "PRD-100",
                        generatedBy: "Sarah Jenkins (Finance Lead)",
                        generatedDate: "03-Aug-2026 09:00 IST",
                        status: "Completed",
                        statusState: "Success"
                    },
                    {
                        name: "Monthly Manual Role Modification Log",
                        type: "Role Change",
                        system: "PRD-100",
                        generatedBy: "Automated Engine",
                        generatedDate: "03-Aug-2026 11:15 IST",
                        status: "Completed",
                        statusState: "Success"
                    },
                    {
                        name: "User Access Privilege Certification",
                        type: "User Access Review",
                        system: "PRD-100",
                        generatedBy: "Alex Rivera (Security Admin)",
                        generatedDate: "02-Aug-2026 18:00 IST",
                        status: "Completed",
                        statusState: "Success"
                    },
                    {
                        name: "Financial SOD Conflict Scan Report",
                        type: "SOD Conflict",
                        system: "PRD-100",
                        generatedBy: "Michael Chang (GRC Officer)",
                        generatedDate: "03-Aug-2026 12:30 IST",
                        status: "Processing",
                        statusState: "Information"
                    },
                    {
                        name: "Superuser Emergency Access Trace",
                        type: "Elevated Access",
                        system: "PRD-100",
                        generatedBy: "Automated Engine",
                        generatedDate: "01-Aug-2026 22:00 IST",
                        status: "Completed",
                        statusState: "Success"
                    },
                    {
                        name: "Critical Authorization Objects Scan (S_TABU_DIS)",
                        type: "Critical Auth",
                        system: "QAS-200",
                        generatedBy: "Alex Rivera (Security Admin)",
                        generatedDate: "03-Aug-2026 10:45 IST",
                        status: "Scheduled",
                        statusState: "Warning"
                    },
                    {
                        name: "GenAI Anomaly Detection Report",
                        type: "AI Risk Analysis",
                        system: "PRD-100",
                        generatedBy: "Automated Engine",
                        generatedDate: "03-Aug-2026 13:00 IST",
                        status: "Completed",
                        statusState: "Success"
                    }
                ]
            };

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "reportsModel");
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("reportsToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
            }
        },

        onSelectTabAvailable: function () {
            var oBtnAvailable = this.byId("btnTabAvailableReports");
            var oBtnHistory = this.byId("btnTabExecutionHistory");
            var oVBoxAvailable = this.byId("vboxAvailableReports");
            var oVBoxHistory = this.byId("vboxExecutionHistory");

            if (oBtnAvailable && oBtnHistory && oVBoxAvailable && oVBoxHistory) {
                oBtnAvailable.setType("Emphasized");
                oBtnHistory.setType("Transparent");
                oVBoxAvailable.setVisible(true);
                oVBoxHistory.setVisible(false);
            }
        },

        onSelectTabHistory: function () {
            var oBtnAvailable = this.byId("btnTabAvailableReports");
            var oBtnHistory = this.byId("btnTabExecutionHistory");
            var oVBoxAvailable = this.byId("vboxAvailableReports");
            var oVBoxHistory = this.byId("vboxExecutionHistory");

            if (oBtnAvailable && oBtnHistory && oVBoxAvailable && oVBoxHistory) {
                oBtnAvailable.setType("Transparent");
                oBtnHistory.setType("Emphasized");
                oVBoxAvailable.setVisible(false);
                oVBoxHistory.setVisible(true);
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

        onGenerateReportDialog: function () {
            var oDialog = this.byId("generateReportDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseGenerateReportDialog: function () {
            var oDialog = this.byId("generateReportDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onSubmitGenerateReport: function () {
            var sName = this.byId("dialogReportNameInput") ? this.byId("dialogReportNameInput").getValue().trim() : "";
            var sType = this.byId("dialogReportTypeSelect") ? this.byId("dialogReportTypeSelect").getSelectedKey() : "SOX Compliance";
            var sSystem = this.byId("dialogSystemSelect") ? this.byId("dialogSystemSelect").getSelectedKey() : "PRD-100";

            if (!sName) {
                MessageBox.error("Please enter a Report Name.");
                return;
            }

            this._addReportToHistory(sName, sType);
            this.onCloseGenerateReportDialog();
        },

        onGenerateRowReport: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("reportsModel").getObject();
            this._addReportToHistory(oItem.name, oItem.type);
        },

        onSearchAvailableReports: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            MessageToast.show("Filtering available reports by query: " + sQuery);
        },

        onFilterAvailableCategory: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            MessageToast.show("Filtering available reports by category: " + sKey);
        },

        onScheduleReportDialog: function () {
            var oDialog = this.byId("scheduleReportDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseScheduleReportDialog: function () {
            var oDialog = this.byId("scheduleReportDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onSubmitScheduleReport: function () {
            var sName = this.byId("scheduleReportNameInput") ? this.byId("scheduleReportNameInput").getValue().trim() : "";
            var sType = this.byId("scheduleReportTypeSelect") ? this.byId("scheduleReportTypeSelect").getSelectedKey() : "SOX Compliance";
            var sSystem = this.byId("scheduleSystemSelect") ? this.byId("scheduleSystemSelect").getSelectedKey() : "PRD-100";
            var sFreq = this.byId("scheduleFrequencySelect") ? this.byId("scheduleFrequencySelect").getSelectedKey() : "Weekly";

            if (!sName) {
                MessageBox.error("Please enter a Report Name.");
                return;
            }

            var oModel = this.getView().getModel("reportsModel");
            var aHistory = oModel.getProperty("/history") || [];

            aHistory.unshift({
                name: sName + " (" + sFreq + ")",
                type: sType,
                system: sSystem,
                generatedBy: "Automated Scheduler",
                generatedDate: "03-Aug-2026 14:48 IST",
                status: "Scheduled",
                statusState: "Warning"
            });

            oModel.setProperty("/history", aHistory);
            MessageToast.show("Automated Report '" + sName + "' scheduled successfully (" + sFreq + ")!");
            this.onCloseScheduleReportDialog();
        },

        onExportPDF: function () {
            MessageToast.show("Generating PDF Report Package...");
        },

        onExportExcel: function () {
            MessageToast.show("Exporting Report Data to Excel...");
        },

        onExportCSV: function () {
            MessageToast.show("Exporting Report Data to CSV...");
        },

        onEmailReport: function () {
            MessageToast.show("Email Report Dialog opened.");
        },

        _resetAllFilters: function () {
            if (this.byId("filterReportType")) { this.byId("filterReportType").setSelectedKey("All"); }
            if (this.byId("filterSystem")) { this.byId("filterSystem").setSelectedKey("All"); }
            if (this.byId("filterModule")) { this.byId("filterModule").setSelectedKey("All"); }
            if (this.byId("filterDateRange")) { 
                var oDateRange = this.byId("filterDateRange");
                oDateRange.setValue("");
                if (oDateRange.setDateValue) { oDateRange.setDateValue(null); }
                if (oDateRange.setSecondDateValue) { oDateRange.setSecondDateValue(null); }
            }
            if (this.byId("filterGeneratedBy")) { this.byId("filterGeneratedBy").setSelectedKey("All"); }
            if (this.byId("filterStatus")) { this.byId("filterStatus").setSelectedKey("All"); }
            if (this.byId("filterSearchField")) { this.byId("filterSearchField").setValue(""); }
        },

        onRefreshReports: function () {
            this._resetAllFilters();
            MessageToast.show("Reports Dashboard & Filters Refreshed Successfully.");
        },

        onClearFilters: function () {
            this._resetAllFilters();
            MessageToast.show("Filters cleared.");
        },

        onGenerateSOXReport: function () { this._addReportToHistory("SOX Compliance Report", "SOX Compliance"); },
        onGenerateRoleReport: function () { this._addReportToHistory("Role Change Report", "Role Change"); },
        onGenerateUserAccessReport: function () { this._addReportToHistory("User Access Review", "User Access Review"); },
        onGenerateSODReport: function () { this._addReportToHistory("SOD Conflict Report", "SOD Conflict"); },
        onGenerateElevatedAccessReport: function () { this._addReportToHistory("Elevated Access Report", "Elevated Access"); },
        onGenerateCriticalAuthReport: function () { this._addReportToHistory("Critical Authorization Report", "Critical Auth"); },
        onGenerateAuditLogReport: function () { this._addReportToHistory("Audit Log Report", "Audit Log"); },
        onGenerateAIRiskReport: function () { this._addReportToHistory("AI Risk Analysis Report", "AI Risk Analysis"); },

        _addReportToHistory: function (sName, sType) {
            var oModel = this.getView().getModel("reportsModel");
            var aHistory = oModel.getProperty("/history") || [];

            aHistory.unshift({
                name: sName,
                type: sType,
                system: "PRD-100",
                generatedBy: "Current User",
                generatedDate: "03-Aug-2026 13:35 IST",
                status: "Completed",
                statusState: "Success"
            });

            oModel.setProperty("/history", aHistory);
            MessageToast.show("Report '" + sName + "' generated successfully!");
        },

        onDownloadPDF: function () {
            MessageToast.show("Downloading PDF Report...");
        },

        onDownloadExcel: function () {
            MessageToast.show("Downloading Excel Report...");
        },

        onApplyFilters: function () {
            MessageToast.show("Report filters applied.");
        },

        onClearFilters: function () {
            if (this.byId("filterReportType")) { this.byId("filterReportType").setSelectedKey("All"); }
            if (this.byId("filterSystem")) { this.byId("filterSystem").setSelectedKey("All"); }
            if (this.byId("filterModule")) { this.byId("filterModule").setSelectedKey("All"); }
            if (this.byId("filterGeneratedBy")) { this.byId("filterGeneratedBy").setSelectedKey("All"); }
            if (this.byId("filterStatus")) { this.byId("filterStatus").setSelectedKey("All"); }
            MessageToast.show("Filters cleared.");
        },

        onSearchHistory: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            MessageToast.show("Filtering history by query: " + sQuery);
        },

        onFilterHistoryStatus: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            MessageToast.show("Filtered history by status: " + sKey);
        },

        onExportHistory: function () {
            MessageToast.show("Exporting execution history to Excel...");
        },

        onAdmin: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
        onReviewer1: function () { this.getOwnerComponent().getRouter().navTo("Reviewer1"); },
        onReviewer2: function () { this.getOwnerComponent().getRouter().navTo("Reviewer2"); },
        onEscalationManager: function () { this.getOwnerComponent().getRouter().navTo("EscalationManager"); },
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

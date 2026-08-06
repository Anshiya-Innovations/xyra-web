sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller,
    UIComponent,
    JSONModel,
    MessageToast,
    MessageBox
) {
    "use strict";

    return Controller.extend("xyraweb.controller.AuditLogs", {

        onInit: function () {
            this._loadAuditLogsData();
        },

        _loadAuditLogsData: function () {
            var oData = {
                validationResults: [
                    {
                        controlId: "LOG08",
                        system: "PRD-100 (Java)",
                        environment: "Production",
                        parameter: "Authorization Failure Logging",
                        standardValue: "Enabled",
                        currentValue: "Disabled",
                        validationResult: "Deviation",
                        resultState: "Error",
                        reviewerStatus: "Report Sent to Reviewer 1",
                        reviewerState: "Error"
                    },
                    {
                        controlId: "LOG08",
                        system: "PRD-100 (Java)",
                        environment: "Production",
                        parameter: "Failed Login Logging",
                        standardValue: "Enabled",
                        currentValue: "Enabled",
                        validationResult: "Validated",
                        resultState: "Success",
                        reviewerStatus: "Validated",
                        reviewerState: "Success"
                    },
                    {
                        controlId: "LOG08",
                        system: "PRD-100 (Java)",
                        environment: "Production",
                        parameter: "User Administration Logging",
                        standardValue: "Enabled",
                        currentValue: "Enabled",
                        validationResult: "Validated",
                        resultState: "Success",
                        reviewerStatus: "Validated",
                        reviewerState: "Success"
                    },
                    {
                        controlId: "LOG28",
                        system: "HDB-10 (HANA)",
                        environment: "Production",
                        parameter: "Audit Logging Enabled",
                        standardValue: "Enabled",
                        currentValue: "Enabled",
                        validationResult: "Validated",
                        resultState: "Success",
                        reviewerStatus: "Validated",
                        reviewerState: "Success"
                    },
                    {
                        controlId: "LOG28",
                        system: "HDB-20 (HANA)",
                        environment: "Quality",
                        parameter: "Privileged User Logging",
                        standardValue: "Enabled",
                        currentValue: "Partial (DBADMIN)",
                        validationResult: "Needs Review",
                        resultState: "Warning",
                        reviewerStatus: "Pending Review",
                        reviewerState: "Warning"
                    },
                    {
                        controlId: "LOG28",
                        system: "HDB-10 (HANA)",
                        environment: "Production",
                        parameter: "Audit Retention Period",
                        standardValue: ">= 90 Days",
                        currentValue: "30 Days",
                        validationResult: "Deviation",
                        resultState: "Error",
                        reviewerStatus: "Report Sent to Reviewer 1",
                        reviewerState: "Error"
                    },
                    {
                        controlId: "LOG08",
                        system: "QAS-200 (Java)",
                        environment: "Quality",
                        parameter: "Role Change Logging",
                        standardValue: "Enabled",
                        currentValue: "Enabled",
                        validationResult: "Validated",
                        resultState: "Success",
                        reviewerStatus: "Validated",
                        reviewerState: "Success"
                    }
                ],

                validationHistory: [
                    {
                        executionTime: "03-Aug-2026 15:30 IST",
                        scope: "LOG08 & LOG28 Full Audit Scan",
                        validatedBy: "Automated Audit Engine",
                        status: "Deviations Found",
                        statusState: "Error",
                        deviationCount: "2 Deviations",
                        deviationState: "Error"
                    },
                    {
                        executionTime: "02-Aug-2026 09:00 IST",
                        scope: "LOG28 SAP HANA Security Audit",
                        validatedBy: "Sarah Jenkins (GRC Officer)",
                        status: "Completed",
                        statusState: "Success",
                        deviationCount: "0 Deviations",
                        deviationState: "Success"
                    },
                    {
                        executionTime: "01-Aug-2026 18:00 IST",
                        scope: "LOG08 SAP Java Audit Logging",
                        validatedBy: "Automated Audit Engine",
                        status: "Warning",
                        statusState: "Warning",
                        deviationCount: "1 Deviation",
                        deviationState: "Warning"
                    }
                ]
            };

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "auditLogsModel");
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("auditLogsToolPage");
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

        onValidateConfiguration: function () {
            var oTable = this.byId("validationResultsTable");
            var aSelectedItems = oTable ? oTable.getSelectedItems() : [];
            var sScopeText = "LOG08 & LOG28 Full Audit Scan";

            if (aSelectedItems.length > 0) {
                var aControlIds = [];
                aSelectedItems.forEach(function (oItem) {
                    var oContext = oItem.getBindingContext("auditLogsModel");
                    if (oContext) {
                        var sId = oContext.getProperty("controlId");
                        if (sId && aControlIds.indexOf(sId) === -1) {
                            aControlIds.push(sId);
                        }
                    }
                });
                sScopeText = aControlIds.join(" & ") + " Selected Controls Validation (" + aSelectedItems.length + " Items)";
            }

            var oModel = this.getView().getModel("auditLogsModel");
            var aHistory = oModel.getProperty("/validationHistory") || [];

            var dNow = new Date();
            var sFormattedTime = dNow.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) +
                " " + dNow.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' }) + " IST";

            aHistory.unshift({
                executionTime: sFormattedTime,
                scope: sScopeText,
                validatedBy: "Automated Audit Engine",
                status: "Deviations Found",
                statusState: "Error",
                deviationCount: aSelectedItems.length > 0 ? (aSelectedItems.length + " Items Verified") : "2 Deviations",
                deviationState: "Error"
            });

            oModel.setProperty("/validationHistory", aHistory);

            var that = this;
            MessageBox.warning(
                "Automated Audit Configuration Extraction & Validation Complete:\n\n" +
                "• Scope: " + sScopeText + "\n" +
                "• Controls Audited: LOG08 & LOG28 Security Control Standards\n" +
                "• Validation record successfully stored in Validation History.",
                {
                    title: "Automated SCS Validation Results",
                    onClose: function () {
                        that.onSelectTabHistory();
                    }
                }
            );
        },

        onRefreshAuditLogs: function () {
            if (this.byId("selectControlFilter")) { this.byId("selectControlFilter").setSelectedKey("All"); }
            if (this.byId("selectResultFilter")) { this.byId("selectResultFilter").setSelectedKey("All"); }
            this._loadAuditLogsData();
            MessageToast.show("Audit Logs & Validation Results Refreshed.");
        },

        onExportPDF: function () {
            MessageToast.show("Generating PDF Audit Validation Report...");
        },

        onExportExcel: function () {
            MessageToast.show("Exporting Validation Results to Excel Spreadsheet...");
        },

        onSelectTabResults: function () {
            var oVBoxResults = this.byId("vboxValidationResults");
            var oVBoxHistory = this.byId("vboxValidationHistory");
            var oBtnResults = this.byId("btnTabValidationResults");
            var oBtnHistory = this.byId("btnTabValidationHistory");

            if (oVBoxResults && oVBoxHistory) {
                oVBoxResults.setVisible(true);
                oVBoxHistory.setVisible(false);
            }
            if (oBtnResults && oBtnHistory) {
                oBtnResults.setType("Emphasized");
                oBtnHistory.setType("Transparent");
            }
        },

        onSelectTabHistory: function () {
            var oVBoxResults = this.byId("vboxValidationResults");
            var oVBoxHistory = this.byId("vboxValidationHistory");
            var oBtnResults = this.byId("btnTabValidationResults");
            var oBtnHistory = this.byId("btnTabValidationHistory");

            if (oVBoxResults && oVBoxHistory) {
                oVBoxResults.setVisible(false);
                oVBoxHistory.setVisible(true);
            }
            if (oBtnResults && oBtnHistory) {
                oBtnResults.setType("Transparent");
                oBtnHistory.setType("Emphasized");
            }
        },

        onViewAuditHistory: function () {
            this.onSelectTabHistory();
            MessageToast.show("Displaying Validation History Logs.");
        },

        onViewReportDetails: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("auditLogsModel").getObject();
            MessageBox.information(
                "Validation Report Summary:\n\n" +
                "• Scope: " + oItem.scope + "\n" +
                "• Execution Time: " + oItem.executionTime + "\n" +
                "• Validated By: " + oItem.validatedBy + "\n" +
                "• Status: " + oItem.status + " (" + oItem.deviationCount + ")"
            );
        },

        onSearchValidationResults: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            MessageToast.show("Searching validation results: " + sQuery);
        },

        onFilterControlId: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            MessageToast.show("Filtered by Control ID: " + sKey);
        },

        onFilterValidationResult: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            MessageToast.show("Filtered by Validation Result: " + sKey);
        },

        onSearchHistory: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            MessageToast.show("Searching history logs: " + sQuery);
        },

        // Navigation Handlers
        onAdmin: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
        onControlManagement: function () { this.getOwnerComponent().getRouter().navTo("ControlManagement"); },
        onAIInsights: function () { MessageToast.show("Navigating to AI Insights..."); },
        onSOXCompliance: function () { MessageToast.show("Navigating to SOX Compliance..."); },
        onReports: function () { this.getOwnerComponent().getRouter().navTo("Reports"); },
        onAuditLogs: function () { this.getOwnerComponent().getRouter().navTo("AuditLogs"); },
        onConfiguration: function () { this.getOwnerComponent().getRouter().navTo("Configuration"); },
        onAccessManagement: function () { this.getOwnerComponent().getRouter().navTo("AccessManagement"); },
        onRiskAnalytics: function () { MessageToast.show("Navigating to Risk Analytics..."); },
        onSystemHealth: function () { MessageToast.show("Navigating to System Health..."); },
        onProfile: function () { this.getOwnerComponent().getRouter().navTo("Profile"); },
        onNotificationPress: function () { MessageToast.show("No new audit alerts."); },
        onLogout: function () { this.getOwnerComponent().getRouter().navTo("Login"); }

    });

});

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

    return Controller.extend("xyraweb.controller.EscalationManager", {

        onInit: function () {
            this._loadEscalationData();
        },

        _loadEscalationData: function () {
            var oData = {
                reports: [
                    {
                        reportId: "REP-101",
                        reportName: "Authorization Failure Logging Audit",
                        controlId: "LOG08",
                        system: "PRD-100 (Java)",
                        reviewer1Comments: "AUTH_CHECK_FAIL parameter updated by Basis Team.",
                        reviewer2Comments: "Level 2 technical validation complete. Log trace checksums verified.",
                        evidence: "2 Files Verified",
                        complianceStatus: "Compliant",
                        complianceState: "Success",
                        remediationStatus: "Remediated",
                        remediationState: "Success",
                        workflowStatus: "Pending Final Approval",
                        workflowState: "Warning",
                        managerNotes: "Manager Check: All evidence & Basis remediation verified."
                    },
                    {
                        reportId: "REP-102",
                        reportName: "HANA Audit Logging Parameter Check",
                        controlId: "LOG28",
                        system: "HDB-10 (HANA)",
                        reviewer1Comments: "All 12 HANA audit policies active in SYSTEMDB.",
                        reviewer2Comments: "Verified SYSTEMDB & Tenant DB audit policy dumps.",
                        evidence: "1 Dump Attached",
                        complianceStatus: "Fully Compliant",
                        complianceState: "Success",
                        remediationStatus: "Fully Remediated",
                        remediationState: "Success",
                        workflowStatus: "Approved & Closed",
                        workflowState: "Success",
                        managerNotes: "Manager Check: Audit workflow successfully closed."
                    },
                    {
                        reportId: "REP-103",
                        reportName: "Java User Administration Audit",
                        controlId: "LOG08",
                        system: "QAS-200 (Java)",
                        reviewer1Comments: "UME user administration filters validated across filters 001-005.",
                        reviewer2Comments: "Trace log audit confirmed by Basis Manager.",
                        evidence: "1 Trace Verified",
                        complianceStatus: "Compliant",
                        complianceState: "Success",
                        remediationStatus: "N/A",
                        remediationState: "None",
                        workflowStatus: "Pending Final Approval",
                        workflowState: "Warning",
                        managerNotes: "Manager Check: Pending Security Team Lead final sign-off."
                    },
                    {
                        reportId: "REP-104",
                        reportName: "HANA Audit Retention Validation",
                        controlId: "LOG28",
                        system: "HDB-20 (HANA)",
                        reviewer1Comments: "Retention period parameter corrected to 90 Days.",
                        reviewer2Comments: "global.ini retention parameter validated against SCS rule.",
                        evidence: "1 Config Dump",
                        complianceStatus: "Minor Discrepancy",
                        complianceState: "Warning",
                        remediationStatus: "Pending Verification",
                        remediationState: "Warning",
                        workflowStatus: "Pending Final Approval",
                        workflowState: "Warning",
                        managerNotes: "Manager Check: Resolving discrepancy regarding retention log buffer."
                    }
                ],
                selectedReport: null
            };

            oData.selectedReport = oData.reports[0];
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "escManagerModel");
        },

        _getSelectedReport: function () {
            var oTable = this.byId("escalationTable");
            var aSelected = oTable ? oTable.getSelectedItems() : [];
            var oModel = this.getView().getModel("escManagerModel");

            if (aSelected.length > 0) {
                var oContext = aSelected[0].getBindingContext("escManagerModel");
                return oContext ? oContext.getObject() : oModel.getProperty("/reports/0");
            }
            return oModel.getProperty("/reports/0");
        },

        // 1. View Report Button
        onViewReport: function () {
            var oReport = this._getSelectedReport();
            var oModel = this.getView().getModel("escManagerModel");
            oModel.setProperty("/selectedReport", oReport);

            var oDialog = this.byId("viewReportDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseViewReportDialog: function () {
            var oDialog = this.byId("viewReportDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        // 2. Approve Button
        onApprove: function () {
            var oTable = this.byId("escalationTable");
            var aSelected = oTable ? oTable.getSelectedItems() : [];

            if (aSelected.length === 0) {
                var oModel = this.getView().getModel("escManagerModel");
                var aReports = oModel.getProperty("/reports");
                if (aReports && aReports.length > 0) {
                    aReports[0].workflowStatus = "Approved & Signed Off";
                    aReports[0].workflowState = "Success";
                    aReports[0].complianceStatus = "Fully Compliant";
                    aReports[0].complianceState = "Success";
                    oModel.refresh(true);
                    MessageToast.show("Report " + aReports[0].reportId + " Approved & Signed Off by Security Team Lead.");
                }
            } else {
                aSelected.forEach(function (oItem) {
                    var oContext = oItem.getBindingContext("escManagerModel");
                    if (oContext) {
                        oContext.getObject().workflowStatus = "Approved & Signed Off";
                        oContext.getObject().workflowState = "Success";
                        oContext.getObject().complianceStatus = "Fully Compliant";
                        oContext.getObject().complianceState = "Success";
                    }
                });
                this.getView().getModel("escManagerModel").refresh(true);
                MessageToast.show(aSelected.length + " Report(s) Approved & Signed Off.");
            }
        },

        // 3. Reject Button
        onReject: function () {
            var oDialog = this.byId("rejectDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSubmitReject: function () {
            var sReason = this.byId("inputRejectReasonArea").getValue();
            if (!sReason) {
                MessageToast.show("Please enter a reason for rejecting the final report.");
                return;
            }

            var oTable = this.byId("escalationTable");
            var aSelected = oTable ? oTable.getSelectedItems() : [];

            if (aSelected.length === 0) {
                var oReport = this._getSelectedReport();
                oReport.workflowStatus = "Rejected";
                oReport.workflowState = "Error";
                oReport.managerNotes = "Security Lead Rejection: " + sReason;
            } else {
                aSelected.forEach(function (oItem) {
                    var oContext = oItem.getBindingContext("escManagerModel");
                    if (oContext) {
                        oContext.getObject().workflowStatus = "Rejected";
                        oContext.getObject().workflowState = "Error";
                        oContext.getObject().managerNotes = "Security Lead Rejection: " + sReason;
                    }
                });
            }

            this.getView().getModel("escManagerModel").refresh(true);
            MessageToast.show("Final Report(s) Rejected.");
            this.onCloseRejectDialog();
        },

        onCloseRejectDialog: function () {
            var oDialog = this.byId("rejectDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        // 4. Request Correction Button
        onRequestCorrection: function () {
            var oDialog = this.byId("requestCorrectionDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSubmitRequestCorrection: function () {
            var sInstructions = this.byId("inputCorrectionNotesArea").getValue();
            if (!sInstructions) {
                MessageToast.show("Please enter correction instructions.");
                return;
            }

            var sTarget = this.byId("selectTargetReviewer").getSelectedKey();
            var oReport = this._getSelectedReport();
            oReport.workflowStatus = "Correction Requested (" + sTarget + ")";
            oReport.workflowState = "Warning";
            oReport.managerNotes = "Correction Request to " + sTarget + ": " + sInstructions;

            this.getView().getModel("escManagerModel").refresh(true);
            MessageToast.show("Correction request dispatched to " + sTarget + " for " + oReport.reportId);
            this.onCloseRequestCorrectionDialog();
        },

        onCloseRequestCorrectionDialog: function () {
            var oDialog = this.byId("requestCorrectionDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        // 5. Export Final Report Button
        onExportFinalReport: function () {
            var oReport = this._getSelectedReport();
            MessageToast.show("Exporting Final PDF Audit Package for " + oReport.reportId);
        },

        // 6. Close Audit Button
        onCloseAudit: function () {
            var oDialog = this.byId("closeAuditDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSubmitCloseAudit: function () {
            var oReport = this._getSelectedReport();
            oReport.workflowStatus = "Approved & Closed";
            oReport.workflowState = "Success";
            oReport.remediationStatus = "Archived & Closed";
            oReport.remediationState = "Success";

            this.getView().getModel("escManagerModel").refresh(true);
            MessageToast.show("Audit Workflow Closed & Sealed for " + oReport.reportId);
            this.onCloseCloseAuditDialog();
        },

        onCloseCloseAuditDialog: function () {
            var oDialog = this.byId("closeAuditDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        // Search & Filter Handlers
        onSearchReports: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || (this.byId("searchEscalation") ? this.byId("searchEscalation").getValue() : "");
            MessageToast.show("Searching escalation queue: " + sQuery);
        },

        onResetFilters: function () {
            if (this.byId("searchEscalation")) { this.byId("searchEscalation").setValue(""); }
            if (this.byId("inputReportIdFilterEsc")) { this.byId("inputReportIdFilterEsc").setValue(""); }
            if (this.byId("selectSystemFilterEsc")) { this.byId("selectSystemFilterEsc").setSelectedKey("All"); }
            if (this.byId("selectStatusFilterEsc")) { this.byId("selectStatusFilterEsc").setSelectedKey("All"); }
            this._loadEscalationData();
            MessageToast.show("Escalation Filters Reset.");
        },

        onFilterSystem: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            MessageToast.show("Filtered by System: " + sKey);
        },

        onFilterStatus: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            MessageToast.show("Filtered by Status: " + sKey);
        },

        onSelectionChange: function (oEvent) {
            var aItems = oEvent.getSource().getSelectedItems();
            MessageToast.show(aItems.length + " report(s) selected");
        },

        onProfilePress: function (oEvent) {
            var oButton = oEvent.getSource();
            var oPopover = this.byId("escProfilePopover");
            if (oPopover) {
                oPopover.openBy(oButton);
            }
        },

        onNotificationPress: function () {
            MessageToast.show("No new notifications for Escalation Manager.");
        },

        onLogout: function () {
            UIComponent.getRouterFor(this).navTo("Login");
        }

    });

});
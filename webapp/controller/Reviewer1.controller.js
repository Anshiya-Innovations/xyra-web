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

    return Controller.extend("xyraweb.controller.Reviewer1", {

        onInit: function () {
            this._loadReviewer1Data();
        },

        _loadReviewer1Data: function () {
            var oData = {
                kpi: {
                    pendingReviews: 18,
                    approvedToday: 142,
                    rejectedToday: 3,
                    slaDue: 5
                },
                reports: [
                    {
                        reportId: "REP-101",
                        reportName: "Authorization Failure Logging Audit",
                        controlId: "LOG08",
                        controlName: "SAP Java Audit Log Filters",
                        businessProcess: "SAP Security & Authorization",
                        riskLevel: "High Risk",
                        riskState: "Error",
                        system: "PRD-100 (Java)",
                        generatedDate: "03-Aug-2026",
                        deviations: "1 Deviation",
                        deviationState: "Error",
                        remediationStatus: "Pending Basis Action",
                        remediationState: "Warning",
                        reviewerStatus: "Pending Review",
                        reviewerState: "Warning",
                        comments: "Initial scan detected parameter AUTH_CHECK_FAIL set to Disabled.",
                        rcaText: "Root Cause: Parameter AUTH_CHECK_FAIL was inadvertently set to disabled during kernel upgrade on 02-Aug-2026.",
                        reviewerName: "John Basis",
                        employeeId: "EMP-88492",
                        decisionDate: "04-Aug-2026",
                        sigStatus: "Verified (SHA-256)",
                        elecSigConfirmed: true,
                        evidenceFilesCount: 2,
                        evidenceFiles: [
                            { title: "Java Audit Buffer Log", description: "/usr/sap/audit/java/sec_audit.log", status: "Extracted" },
                            { title: "SCS Benchmark Rule LOG08", description: "Mandatory logging for AUTH_CHECK_FAIL", status: "Validated" }
                        ],
                        automationLogs: [
                            { logMessage: "XYRA Automated Engine scan started for PRD-100", timestamp: "03-Aug-2026 08:00:12 AM", level: "INFO" },
                            { logMessage: "Deviation detected: AUTH_CHECK_FAIL = 0 (Disabled)", timestamp: "03-Aug-2026 08:00:45 AM", level: "ERROR" }
                        ],
                        attachments: [
                            { fileName: "sec_audit_trace_prd100.log", fileSize: "2.4 MB", uploadDate: "03-Aug-2026" }
                        ],
                        screenshots: [
                            { title: "NWA Audit Filter Parameter Config", resolution: "1920x1080 PNG" }
                        ],
                        reviewHistory: [
                            { action: "Automated Scan", comments: "Rule LOG08 executed by XYRA Engine", time: "03-Aug 08:00 AM", status: "Generated" },
                            { action: "Evidence Extraction", comments: "Buffer log sec_audit.log extracted from PRD-100", time: "03-Aug 08:05 AM", status: "Completed" },
                            { action: "Primary Review", comments: "Assigned to SAP Basis Team (Reviewer 1)", time: "03-Aug 09:30 AM", status: "In Review" }
                        ]
                    },
                    {
                        reportId: "REP-102",
                        reportName: "HANA Audit Logging Parameter Check",
                        controlId: "LOG28",
                        controlName: "SAP HANA Security Audit Logging",
                        businessProcess: "Database Administration",
                        riskLevel: "Medium Risk",
                        riskState: "Warning",
                        system: "HDB-10 (HANA)",
                        generatedDate: "03-Aug-2026",
                        deviations: "0 Deviations",
                        deviationState: "Success",
                        remediationStatus: "Remediated",
                        remediationState: "Success",
                        reviewerStatus: "Forwarded to Reviewer 2",
                        reviewerState: "Success",
                        comments: "All 12 HANA audit policies validated against SCS policy.",
                        rcaText: "Root Cause: Routine audit policy check completed with zero deviations.",
                        reviewerName: "John Basis",
                        employeeId: "EMP-88492",
                        decisionDate: "03-Aug-2026",
                        sigStatus: "Verified (SHA-256)",
                        elecSigConfirmed: true,
                        evidenceFilesCount: 1,
                        evidenceFiles: [
                            { title: "HANA DB Audit Policy Dump", description: "SYSTEMDB AUDIT_LOG export", status: "Verified" }
                        ],
                        automationLogs: [
                            { logMessage: "HANA DB Audit Policy scan completed", timestamp: "03-Aug-2026 09:00:00 AM", level: "INFO" }
                        ],
                        attachments: [
                            { fileName: "hana_audit_policies.csv", fileSize: "512 KB", uploadDate: "03-Aug-2026" }
                        ],
                        screenshots: [
                            { title: "HANA Studio Security Audit Cockpit", resolution: "1920x1080 PNG" }
                        ],
                        reviewHistory: [
                            { action: "Automated Scan", comments: "Rule LOG28 executed by XYRA Engine", time: "03-Aug 09:00 AM", status: "Generated" },
                            { action: "Level 1 Approval", comments: "Forwarded to Reviewer 2", time: "03-Aug 11:15 AM", status: "Approved" }
                        ]
                    },
                    {
                        reportId: "REP-103",
                        reportName: "Java User Administration Audit",
                        controlId: "LOG08",
                        controlName: "SAP Java Security Audit Logging",
                        businessProcess: "User Management Governance",
                        riskLevel: "Low Risk",
                        riskState: "Information",
                        system: "QAS-200 (Java)",
                        generatedDate: "02-Aug-2026",
                        deviations: "0 Deviations",
                        deviationState: "Success",
                        remediationStatus: "Fully Compliant",
                        remediationState: "Success",
                        reviewerStatus: "Pending Review",
                        reviewerState: "Warning",
                        comments: "User administration logging active across all filters 001-005.",
                        rcaText: "Root Cause: Standard compliance audit for QAS environment.",
                        reviewerName: "John Basis",
                        employeeId: "EMP-88492",
                        decisionDate: "04-Aug-2026",
                        sigStatus: "Verified (SHA-256)",
                        elecSigConfirmed: true,
                        evidenceFilesCount: 1,
                        evidenceFiles: [
                            { title: "QAS UME Log Trace", description: "UME User Admin trace log", status: "Extracted" }
                        ],
                        automationLogs: [
                            { logMessage: "UME Log Trace scan finished", timestamp: "02-Aug-2026 14:20:00 PM", level: "INFO" }
                        ],
                        attachments: [
                            { fileName: "qas_ume_trace.txt", fileSize: "1.1 MB", uploadDate: "02-Aug-2026" }
                        ],
                        screenshots: [
                            { title: "UME Config Log Settings", resolution: "1920x1080 PNG" }
                        ],
                        reviewHistory: [
                            { action: "Automated Scan", comments: "Rule LOG08 executed by XYRA Engine", time: "02-Aug 14:20 PM", status: "Generated" }
                        ]
                    },
                    {
                        reportId: "REP-104",
                        reportName: "HANA Audit Retention Validation",
                        controlId: "LOG28",
                        controlName: "SAP HANA Audit Retention",
                        businessProcess: "System Parameter Retention",
                        riskLevel: "High Risk",
                        riskState: "Error",
                        system: "HDB-20 (HANA)",
                        generatedDate: "01-Aug-2026",
                        deviations: "1 Deviation",
                        deviationState: "Error",
                        remediationStatus: "Pending Basis Action",
                        remediationState: "Error",
                        reviewerStatus: "Remediation Pending",
                        reviewerState: "Error",
                        comments: "Audit retention period set to 30 Days (SCS standard requires >= 90 Days).",
                        rcaText: "Root Cause: Default global.ini audit retention was set to 30 days during DB provisioning.",
                        reviewerName: "John Basis",
                        employeeId: "EMP-88492",
                        decisionDate: "04-Aug-2026",
                        sigStatus: "Verified (SHA-256)",
                        elecSigConfirmed: false,
                        evidenceFilesCount: 1,
                        evidenceFiles: [
                            { title: "HANA Global Config File", description: "global.ini audit_retention parameter", status: "Verified" }
                        ],
                        automationLogs: [
                            { logMessage: "global.ini parameter audit_retention = 30", timestamp: "01-Aug-2026 10:00:00 AM", level: "WARN" }
                        ],
                        attachments: [
                            { fileName: "global_ini_retention.ini", fileSize: "128 KB", uploadDate: "01-Aug-2026" }
                        ],
                        screenshots: [
                            { title: "HANA Cockpit Retention Config", resolution: "1920x1080 PNG" }
                        ],
                        reviewHistory: [
                            { action: "Automated Scan", comments: "Rule LOG28 executed by XYRA Engine", time: "01-Aug 10:00 AM", status: "Generated" }
                        ]
                    }
                ],
                selectedReport: null
            };

            oData.selectedReport = oData.reports[0];
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "reviewer1Model");
        },

        // SLIDE NAVIGATION HANDLERS
        onSelectTabQueue: function () {
            var oVboxQueue = this.byId("vboxReviewQueue");
            var oVboxAnalysis = this.byId("vboxDetailedAnalysis");
            var oBtnQueue = this.byId("btnTabReviewQueue");
            var oBtnAnalysis = this.byId("btnTabDetailedAnalysis");

            if (oVboxQueue) { oVboxQueue.setVisible(true); }
            if (oVboxAnalysis) { oVboxAnalysis.setVisible(false); }
            if (oBtnQueue) { oBtnQueue.setType("Emphasized"); }
            if (oBtnAnalysis) { oBtnAnalysis.setType("Transparent"); }
        },

        onSelectTabAnalysis: function () {
            var oVboxQueue = this.byId("vboxReviewQueue");
            var oVboxAnalysis = this.byId("vboxDetailedAnalysis");
            var oBtnQueue = this.byId("btnTabReviewQueue");
            var oBtnAnalysis = this.byId("btnTabDetailedAnalysis");

            if (oVboxQueue) { oVboxQueue.setVisible(false); }
            if (oVboxAnalysis) { oVboxAnalysis.setVisible(true); }
            if (oBtnQueue) { oBtnQueue.setType("Transparent"); }
            if (oBtnAnalysis) { oBtnAnalysis.setType("Emphasized"); }
        },

        _getSelectedReport: function () {
            var oTable = this.byId("reviewer1Table");
            var aSelected = oTable ? oTable.getSelectedItems() : [];
            var oModel = this.getView().getModel("reviewer1Model");

            if (aSelected.length > 0) {
                var oContext = aSelected[0].getBindingContext("reviewer1Model");
                return oContext ? oContext.getObject() : oModel.getProperty("/reports/0");
            }
            return oModel.getProperty("/reports/0");
        },

        onReportRowPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("reviewer1Model");
            if (oContext) {
                var oReport = oContext.getObject();
                this.getView().getModel("reviewer1Model").setProperty("/selectedReport", oReport);
                this.onSelectTabAnalysis();
                MessageToast.show("Navigating to Detailed Review Analysis for " + oReport.reportId);
            }
        },

        onSelectionChange: function (oEvent) {
            var aItems = oEvent.getSource().getSelectedItems();
            if (aItems.length > 0) {
                var oContext = aItems[0].getBindingContext("reviewer1Model");
                if (oContext) {
                    this.getView().getModel("reviewer1Model").setProperty("/selectedReport", oContext.getObject());
                }
            }
            MessageToast.show(aItems.length + " report(s) selected");
        },

        // 1. View Report Button
        onViewReport: function () {
            var oReport = this._getSelectedReport();
            this.getView().getModel("reviewer1Model").setProperty("/selectedReport", oReport);
            this.onSelectTabAnalysis();
        },

        onCloseViewReportDialog: function () {
            var oDialog = this.byId("viewReportDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        // 2. View Evidence Button & Email Actions
        onViewEvidence: function () {
            var oReport = this._getSelectedReport();
            this.getView().getModel("reviewer1Model").setProperty("/selectedReport", oReport);
            var oDialog = this.byId("viewEvidenceDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSendThroughEmail: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("reviewer1Model");
            var sTitle = oContext ? (oContext.getObject().title || oContext.getObject().fileName || oContext.getObject().logMessage || "Evidence File") : "Evidence File";
            MessageToast.show("'" + sTitle + "' sent through email successfully.");
        },

        onSendAllThroughEmail: function () {
            MessageToast.show("All Evidence files, logs & attachments sent through email successfully.");
        },

        onCloseViewEvidenceDialog: function () {
            var oDialog = this.byId("viewEvidenceDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        // 3. Add Comments Button
        onAddComments: function () {
            var oDialog = this.byId("addCommentsDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSubmitComments: function () {
            var sComment = this.byId("inputCommentArea").getValue();
            if (!sComment) {
                MessageToast.show("Please enter review comments before saving.");
                return;
            }

            var oReport = this._getSelectedReport();
            oReport.comments = sComment;
            this.getView().getModel("reviewer1Model").refresh(true);

            MessageToast.show("Review comments saved successfully for " + oReport.reportId);
            this.onCloseAddCommentsDialog();
        },

        onCloseAddCommentsDialog: function () {
            var oDialog = this.byId("addCommentsDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        // 4. Request Information Button
        onRequestInfo: function () {
            var oDialog = this.byId("requestInfoDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSubmitRequestInfo: function () {
            var sInfoReq = this.byId("inputRequestInfoArea").getValue();
            if (!sInfoReq) {
                MessageToast.show("Please describe the evidence or information required.");
                return;
            }

            var oReport = this._getSelectedReport();
            oReport.reviewerStatus = "Info Requested";
            oReport.reviewerState = "Warning";
            this.getView().getModel("reviewer1Model").refresh(true);

            MessageToast.show("Information request dispatched to system owner for " + oReport.reportId);
            this.onCloseRequestInfoDialog();
        },

        onCloseRequestInfoDialog: function () {
            var oDialog = this.byId("requestInfoDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        // 5. Confirm Remediation Button
        onConfirmRemediation: function () {
            var oDialog = this.byId("confirmRemediationDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSubmitConfirmRemediation: function () {
            var oReport = this._getSelectedReport();
            oReport.remediationStatus = "Remediated";
            oReport.remediationState = "Success";
            oReport.deviations = "0 Deviations";
            oReport.deviationState = "Success";
            this.getView().getModel("reviewer1Model").refresh(true);

            MessageToast.show("Basis Remediation confirmed & verified for " + oReport.reportId);
            this.onCloseConfirmRemediationDialog();
        },

        onCloseConfirmRemediationDialog: function () {
            var oDialog = this.byId("confirmRemediationDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        // VALIDATION & SECTION 6: APPROVE BUTTON HANDLER
        onApproveForward: function () {
            var oReport = this._getSelectedReport();

            // Rule 1: Root Cause Analysis is mandatory
            if (!oReport.rcaText || oReport.rcaText.trim() === "") {
                MessageBox.error("Root Cause Analysis (Mandatory) is required before approving.");
                return;
            }

            // Rule 2: Electronic Signature confirmation is required
            if (!oReport.elecSigConfirmed) {
                MessageBox.error("Please check the Electronic Signature confirmation box: 'I confirm that I have personally reviewed this deviation.' before approving.");
                return;
            }

            // Open Approve Dialog for final sign-off
            var oDialog = this.byId("approveDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onConfirmApproveForward: function () {
            var oReport = this._getSelectedReport();
            oReport.reviewerStatus = "Forwarded to Reviewer 2";
            oReport.reviewerState = "Success";

            // Append to Review History
            if (!oReport.reviewHistory) { oReport.reviewHistory = []; }
            oReport.reviewHistory.unshift({
                action: "Level 1 Approval",
                comments: oReport.rcaText,
                time: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
                status: "Approved"
            });

            // Update KPI counts
            var oModel = this.getView().getModel("reviewer1Model");
            var iApproved = oModel.getProperty("/kpi/approvedToday") || 0;
            oModel.setProperty("/kpi/approvedToday", iApproved + 1);

            oModel.refresh(true);
            MessageToast.show("Report " + oReport.reportId + " Approved & Forwarded to Reviewer 2.");
            this.onCloseApproveDialog();
        },

        onCloseApproveDialog: function () {
            var oDialog = this.byId("approveDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        // VALIDATION & SECTION 7: REJECT BUTTON HANDLER
        onRejectReport: function () {
            var oReport = this._getSelectedReport();

            // Rule 1: Root Cause Analysis is mandatory
            if (!oReport.rcaText || oReport.rcaText.trim() === "") {
                MessageBox.error("Root Cause Analysis (Mandatory) is required before rejecting.");
                return;
            }

            // Rule 2: Electronic Signature confirmation is required
            if (!oReport.elecSigConfirmed) {
                MessageBox.error("Please check the Electronic Signature confirmation box: 'I confirm that I have personally reviewed this deviation.' before rejecting.");
                return;
            }

            // Open Reject Dialog for final sign-off
            var oDialog = this.byId("rejectDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSubmitReject: function () {
            var oReport = this._getSelectedReport();
            oReport.reviewerStatus = "Rejected";
            oReport.reviewerState = "Error";

            // Append to Review History
            if (!oReport.reviewHistory) { oReport.reviewHistory = []; }
            oReport.reviewHistory.unshift({
                action: "Level 1 Rejection",
                comments: oReport.rcaText,
                time: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
                status: "Rejected"
            });

            // Update KPI counts
            var oModel = this.getView().getModel("reviewer1Model");
            var iRejected = oModel.getProperty("/kpi/rejectedToday") || 0;
            oModel.setProperty("/kpi/rejectedToday", iRejected + 1);

            oModel.refresh(true);
            MessageToast.show("Report " + oReport.reportId + " Rejected.");
            this.onCloseRejectDialog();
        },

        onCloseRejectDialog: function () {
            var oDialog = this.byId("rejectDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        // Search & Filter Handlers
        onSearchReports: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || (this.byId("searchReviewer1") ? this.byId("searchReviewer1").getValue() : "");
            MessageToast.show("Searching reports: " + sQuery);
        },

        onResetFilters: function () {
            if (this.byId("searchReviewer1")) { this.byId("searchReviewer1").setValue(""); }
            if (this.byId("inputReportIdFilter")) { this.byId("inputReportIdFilter").setValue(""); }
            if (this.byId("selectSystemFilter")) { this.byId("selectSystemFilter").setSelectedKey("All"); }
            if (this.byId("selectStatusFilter")) { this.byId("selectStatusFilter").setSelectedKey("All"); }
            this._loadReviewer1Data();
            MessageToast.show("Reviewer 1 Filters Reset.");
        },

        onFilterSystem: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            MessageToast.show("Filtered by System: " + sKey);
        },

        onFilterStatus: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            MessageToast.show("Filtered by Status: " + sKey);
        },

        onProfilePress: function (oEvent) {
            var oButton = oEvent.getSource();
            var oPopover = this.byId("rev1ProfilePopover");
            if (oPopover) {
                oPopover.openBy(oButton);
            }
        },

        onNotificationPress: function () {
            MessageToast.show("No new notifications for Reviewer 1.");
        },

        onLogout: function () {
            UIComponent.getRouterFor(this).navTo("Login");
        }

    });

});
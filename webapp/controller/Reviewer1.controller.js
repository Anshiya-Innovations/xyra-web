sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationPopover"
], function (
    Controller,
    UIComponent,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox,
    GlobalLoading,
    NotificationPopover
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
                historyKpis: {
                    approved: 142,
                    rejected: 3,
                    inProgress: 18
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
                history: [
                    {
                        ticketId: "TCK-8801",
                        reportId: "REP-102",
                        controlId: "LOG28",
                        reportName: "HANA Audit Logging Parameter Check",
                        system: "HDB-10 (HANA)",
                        decision: "Approved",
                        reviewedDate: "03-Aug-2026",
                        ticketStatus: "Forwarded to Reviewer 2",
                        ticketStatusState: "Success",
                        remediatedItem: "global.ini -> AUDIT_LOG_STATUS",
                        previousValue: "OFF (Disabled)",
                        updatedValue: "ON (Enabled)",
                        rcaText: "Parameter enabled during scheduled maintenance window. Policy verified compliant.",
                        changedBy: "John Basis",
                        employeeId: "EMP-88492",
                        sigStatus: "Verified (SHA-256)",
                        reviewerComment: "Verified audit policies active across SYSTEMDB and tenant databases."
                    },
                    {
                        ticketId: "TCK-8794",
                        reportId: "REP-098",
                        controlId: "LOG08",
                        reportName: "Java NWA Security Logging Audit",
                        system: "PRD-100 (Java)",
                        decision: "Approved",
                        reviewedDate: "02-Aug-2026",
                        ticketStatus: "Closed",
                        ticketStatusState: "Success",
                        remediatedItem: "sec_audit.log -> Filter 002 (UME Auth)",
                        previousValue: "Logging Level: WARNING",
                        updatedValue: "Logging Level: ALL",
                        rcaText: "Audit log filter 002 updated to capture all security events as required by SCS LOG08 standard.",
                        changedBy: "John Basis",
                        employeeId: "EMP-88492",
                        sigStatus: "Verified (SHA-256)",
                        reviewerComment: "Remediation confirmed on target Java instance."
                    },
                    {
                        ticketId: "TCK-8780",
                        reportId: "REP-095",
                        controlId: "SEC14",
                        reportName: "SAP Superuser Privilege Audit",
                        system: "HDB-20 (HANA)",
                        decision: "Rejected",
                        reviewedDate: "01-Aug-2026",
                        ticketStatus: "Remediation Required",
                        ticketStatusState: "Error",
                        remediatedItem: "SYSTEMDB -> Granting DATA ADMIN",
                        previousValue: "Unassigned Privilege",
                        updatedValue: "Assigned without CR",
                        rcaText: "Unauthorized DATA ADMIN privilege granted to non-basis user without Change Request approval.",
                        changedBy: "John Basis",
                        employeeId: "EMP-88492",
                        sigStatus: "Verified (SHA-256)",
                        reviewerComment: "Privilege must be revoked immediately prior to approval."
                    },
                    {
                        ticketId: "TCK-8765",
                        reportId: "REP-091",
                        controlId: "LOG28",
                        reportName: "HANA DB Audit Trail Verification",
                        system: "QAS-200 (Java)",
                        decision: "Approved",
                        reviewedDate: "30-Jul-2026",
                        ticketStatus: "Closed",
                        ticketStatusState: "Success",
                        remediatedItem: "ume.log -> Log File Retention",
                        previousValue: "Retention = 14 Days",
                        updatedValue: "Retention = 90 Days",
                        rcaText: "Adjusted retention policy parameter in NetWeaver Administrator to align with 90-day requirement.",
                        changedBy: "John Basis",
                        employeeId: "EMP-88492",
                        sigStatus: "Verified (SHA-256)",
                        reviewerComment: "Verified compliance with SCS retention guidelines."
                    }
                ],
                selectedReport: null,
                selectedHistoryItem: null
            };

            oData.selectedReport = oData.reports[0];
            oData.selectedHistoryItem = oData.history[0];
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "reviewer1Model");
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("reviewer1ToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
            }
        },

        // SLIDE NAVIGATION HANDLERS
        onSelectTabQueue: function () {
            var oVboxQueue = this.byId("vboxReviewQueue");
            var oVboxAnalysis = this.byId("vboxDetailedAnalysis");
            var oVboxHistory = this.byId("vboxReviewerHistory");
            var oBtnQueue = this.byId("btnTabReviewQueue");
            var oBtnAnalysis = this.byId("btnTabDetailedAnalysis");
            var oBtnHistory = this.byId("btnTabReviewerHistory");
            var oSideNav = this.byId("reviewer1SideNavigation");

            if (oVboxQueue) { oVboxQueue.setVisible(true); }
            if (oVboxAnalysis) { oVboxAnalysis.setVisible(false); }
            if (oVboxHistory) { oVboxHistory.setVisible(false); }

            if (oBtnQueue) { oBtnQueue.setType("Emphasized"); }
            if (oBtnAnalysis) { oBtnAnalysis.setType("Transparent"); }
            if (oBtnHistory) { oBtnHistory.setType("Transparent"); }

            if (oSideNav) { oSideNav.setSelectedKey("Queue"); }
        },

        onSelectTabAnalysis: function () {
            var oVboxQueue = this.byId("vboxReviewQueue");
            var oVboxAnalysis = this.byId("vboxDetailedAnalysis");
            var oVboxHistory = this.byId("vboxReviewerHistory");
            var oBtnQueue = this.byId("btnTabReviewQueue");
            var oBtnAnalysis = this.byId("btnTabDetailedAnalysis");
            var oBtnHistory = this.byId("btnTabReviewerHistory");
            var oSideNav = this.byId("reviewer1SideNavigation");

            if (oVboxQueue) { oVboxQueue.setVisible(false); }
            if (oVboxAnalysis) { oVboxAnalysis.setVisible(true); }
            if (oVboxHistory) { oVboxHistory.setVisible(false); }

            if (oBtnQueue) { oBtnQueue.setType("Transparent"); }
            if (oBtnAnalysis) { oBtnAnalysis.setType("Emphasized"); }
            if (oBtnHistory) { oBtnHistory.setType("Transparent"); }

            if (oSideNav) { oSideNav.setSelectedKey("Analysis"); }
        },

        onSelectTabHistory: function () {
            var oVboxQueue = this.byId("vboxReviewQueue");
            var oVboxAnalysis = this.byId("vboxDetailedAnalysis");
            var oVboxHistory = this.byId("vboxReviewerHistory");
            var oBtnQueue = this.byId("btnTabReviewQueue");
            var oBtnAnalysis = this.byId("btnTabDetailedAnalysis");
            var oBtnHistory = this.byId("btnTabReviewerHistory");
            var oSideNav = this.byId("reviewer1SideNavigation");

            if (oVboxQueue) { oVboxQueue.setVisible(false); }
            if (oVboxAnalysis) { oVboxAnalysis.setVisible(false); }
            if (oVboxHistory) { oVboxHistory.setVisible(true); }

            if (oBtnQueue) { oBtnQueue.setType("Transparent"); }
            if (oBtnAnalysis) { oBtnAnalysis.setType("Transparent"); }
            if (oBtnHistory) { oBtnHistory.setType("Emphasized"); }

            if (oSideNav) { oSideNav.setSelectedKey("History"); }
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

        // QUICK ACTIONS DIALOG HANDLERS
        onViewReport: function () {
            var oReport = this._getSelectedReport();
            this.getView().getModel("reviewer1Model").setProperty("/selectedReport", oReport);
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

        onViewEvidence: function () {
            var oReport = this._getSelectedReport();
            this.getView().getModel("reviewer1Model").setProperty("/selectedReport", oReport);
            var oDialog = this.byId("viewEvidenceDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseViewEvidenceDialog: function () {
            var oDialog = this.byId("viewEvidenceDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onAddComments: function () {
            var oDialog = this.byId("addCommentsDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSubmitComments: function () {
            var sComment = this.byId("inputCommentArea") ? this.byId("inputCommentArea").getValue() : "";
            if (!sComment || sComment.trim() === "") {
                MessageBox.error("Please enter a review comment before saving.");
                return;
            }
            var oReport = this._getSelectedReport();
            oReport.comments = sComment;
            this.getView().getModel("reviewer1Model").refresh(true);
            MessageToast.show("Reviewer comments saved successfully for " + oReport.reportId);
            this.onCloseAddCommentsDialog();
        },

        onCloseAddCommentsDialog: function () {
            var oDialog = this.byId("addCommentsDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onRequestInfo: function () {
            var oDialog = this.byId("requestInfoDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSubmitRequestInfo: function () {
            var sInfo = this.byId("inputRequestInfoArea") ? this.byId("inputRequestInfoArea").getValue() : "";
            if (!sInfo || sInfo.trim() === "") {
                MessageBox.error("Please specify the information or evidence needed.");
                return;
            }
            var oReport = this._getSelectedReport();
            oReport.reviewerStatus = "Information Requested";
            oReport.reviewerState = "Information";
            this.getView().getModel("reviewer1Model").refresh(true);
            MessageToast.show("Information request sent for " + oReport.reportId);
            this.onCloseRequestInfoDialog();
        },

        onCloseRequestInfoDialog: function () {
            var oDialog = this.byId("requestInfoDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onConfirmRemediation: function () {
            var oDialog = this.byId("confirmRemediationDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSubmitConfirmRemediation: function () {
            var oReport = this._getSelectedReport();
            oReport.remediationStatus = "Remediated & Verified";
            oReport.remediationState = "Success";
            this.getView().getModel("reviewer1Model").refresh(true);
            MessageToast.show("Technical remediation confirmed for " + oReport.reportId);
            this.onCloseConfirmRemediationDialog();
        },

        onCloseConfirmRemediationDialog: function () {
            var oDialog = this.byId("confirmRemediationDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        // APPROVAL WORKFLOW
        onApproveForward: function () {
            var oReport = this._getSelectedReport();

            if (!oReport.rcaText || oReport.rcaText.trim() === "") {
                MessageBox.error("Root Cause Analysis (Mandatory) is required before approving.");
                return;
            }

            if (!oReport.elecSigConfirmed) {
                MessageBox.error("Please check the Electronic Signature confirmation box: 'I confirm that I have personally reviewed this deviation.' before approving.");
                return;
            }

            var oDialog = this.byId("approveDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onConfirmApproveForward: function () {
            var oReport = this._getSelectedReport();
            oReport.reviewerStatus = "Forwarded to Reviewer 2";
            oReport.reviewerState = "Success";

            if (!oReport.reviewHistory) { oReport.reviewHistory = []; }
            oReport.reviewHistory.unshift({
                action: "Level 1 Approval",
                comments: oReport.rcaText,
                time: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
                status: "Approved"
            });

            var oModel = this.getView().getModel("reviewer1Model");
            var iApproved = oModel.getProperty("/kpi/approvedToday") || 0;
            oModel.setProperty("/kpi/approvedToday", iApproved + 1);

            // Add record to Reviewer History table
            var aHistory = oModel.getProperty("/history") || [];
            aHistory.unshift({
                ticketId: "TCK-" + Math.floor(1000 + Math.random() * 9000),
                reportId: oReport.reportId,
                controlId: oReport.controlId,
                reportName: oReport.reportName,
                system: oReport.system,
                decision: "Approved",
                reviewedDate: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
                ticketStatus: "Forwarded to Reviewer 2",
                ticketStatusState: "Success",
                remediatedItem: oReport.controlName || "System Parameter Configuration",
                previousValue: "Non-Compliant Parameter",
                updatedValue: "Verified Compliant Parameter",
                rcaText: oReport.rcaText,
                changedBy: oReport.reviewerName || "John Basis",
                employeeId: oReport.employeeId || "EMP-88492",
                sigStatus: "Verified (SHA-256)",
                reviewerComment: "Report approved by Reviewer 1 and forwarded to Reviewer 2 (Basis Manager)."
            });
            oModel.setProperty("/history", aHistory);

            var iHistApproved = oModel.getProperty("/historyKpis/approved") || 0;
            oModel.setProperty("/historyKpis/approved", iHistApproved + 1);

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

        // REJECT WORKFLOW
        onRejectReport: function () {
            var oReport = this._getSelectedReport();

            if (!oReport.rcaText || oReport.rcaText.trim() === "") {
                MessageBox.error("Root Cause Analysis (Mandatory) is required before rejecting.");
                return;
            }

            if (!oReport.elecSigConfirmed) {
                MessageBox.error("Please check the Electronic Signature confirmation box: 'I confirm that I have personally reviewed this deviation.' before rejecting.");
                return;
            }

            var oDialog = this.byId("rejectDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSubmitReject: function () {
            var oReport = this._getSelectedReport();
            oReport.reviewerStatus = "Rejected";
            oReport.reviewerState = "Error";

            if (!oReport.reviewHistory) { oReport.reviewHistory = []; }
            oReport.reviewHistory.unshift({
                action: "Level 1 Rejection",
                comments: oReport.rcaText,
                time: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
                status: "Rejected"
            });

            var oModel = this.getView().getModel("reviewer1Model");
            var iRejected = oModel.getProperty("/kpi/rejectedToday") || 0;
            oModel.setProperty("/kpi/rejectedToday", iRejected + 1);

            // Add record to Reviewer History table
            var aHistory = oModel.getProperty("/history") || [];
            aHistory.unshift({
                ticketId: "TCK-" + Math.floor(1000 + Math.random() * 9000),
                reportId: oReport.reportId,
                controlId: oReport.controlId,
                reportName: oReport.reportName,
                system: oReport.system,
                decision: "Rejected",
                reviewedDate: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
                ticketStatus: "Remediation Required",
                ticketStatusState: "Error",
                remediatedItem: oReport.controlName || "System Parameter Configuration",
                previousValue: "Non-Compliant Parameter",
                updatedValue: "Rejected - Non-Compliant",
                rcaText: oReport.rcaText,
                changedBy: oReport.reviewerName || "John Basis",
                employeeId: oReport.employeeId || "EMP-88492",
                sigStatus: "Verified (SHA-256)",
                reviewerComment: "Report rejected by Reviewer 1 due to unmitigated non-compliance."
            });
            oModel.setProperty("/history", aHistory);

            var iHistRejected = oModel.getProperty("/historyKpis/rejected") || 0;
            oModel.setProperty("/historyKpis/rejected", iHistRejected + 1);

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

        // HISTORY SEARCH & DIALOG HANDLERS
        onSearchHistory: function () {
            var sSearchText = this.byId("searchHistory") ? this.byId("searchHistory").getValue() : "";
            var sControlId = this.byId("inputHistoryControlId") ? this.byId("inputHistoryControlId").getValue() : "";
            var sSystem = this.byId("selectHistorySystem") ? this.byId("selectHistorySystem").getSelectedKey() : "All";
            var sDecision = this.byId("selectHistoryDecision") ? this.byId("selectHistoryDecision").getSelectedKey() : "All";
            var sStatus = this.byId("selectHistoryStatus") ? this.byId("selectHistoryStatus").getSelectedKey() : "All";
            var sDate = this.byId("dpHistoryDate") ? this.byId("dpHistoryDate").getValue() : "";

            var aFilters = [];

            if (sSearchText && sSearchText.trim() !== "") {
                var aSubFilters = [
                    new Filter("reportId", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("reportName", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("ticketId", FilterOperator.Contains, sSearchText.trim())
                ];
                aFilters.push(new Filter({ filters: aSubFilters, and: false }));
            }

            if (sControlId && sControlId.trim() !== "") {
                aFilters.push(new Filter("controlId", FilterOperator.Contains, sControlId.trim()));
            }

            if (sSystem && sSystem !== "All") {
                aFilters.push(new Filter("system", FilterOperator.Contains, sSystem));
            }

            if (sDecision && sDecision !== "All") {
                aFilters.push(new Filter("decision", FilterOperator.Contains, sDecision));
            }

            if (sStatus && sStatus !== "All") {
                aFilters.push(new Filter("ticketStatus", FilterOperator.Contains, sStatus));
            }

            if (sDate && sDate.trim() !== "") {
                aFilters.push(new Filter("reviewedDate", FilterOperator.Contains, sDate.trim()));
            }

            var oTable = this.byId("reviewerHistoryTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },

        onResetHistoryFilters: function () {
            if (this.byId("searchHistory")) { this.byId("searchHistory").setValue(""); }
            if (this.byId("inputHistoryControlId")) { this.byId("inputHistoryControlId").setValue(""); }
            if (this.byId("selectHistorySystem")) { this.byId("selectHistorySystem").setSelectedKey("All"); }
            if (this.byId("selectHistoryDecision")) { this.byId("selectHistoryDecision").setSelectedKey("All"); }
            if (this.byId("selectHistoryStatus")) { this.byId("selectHistoryStatus").setSelectedKey("All"); }
            if (this.byId("dpHistoryDate")) { this.byId("dpHistoryDate").reset(); }
            this.onSearchHistory();
            MessageToast.show("Reviewer History Filters Reset.");
        },

        onViewHistoryDetails: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("reviewer1Model");
            if (oContext) {
                var oHistoryItem = oContext.getObject();
                this.getView().getModel("reviewer1Model").setProperty("/selectedHistoryItem", oHistoryItem);
                var oDialog = this.byId("viewHistoryDetailsDialog");
                if (oDialog) {
                    oDialog.open();
                }
            }
        },

        onCloseHistoryDetailsDialog: function () {
            var oDialog = this.byId("viewHistoryDetailsDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        // SEARCH & FILTER HANDLERS (REVIEW QUEUE LIVE FILTER)
        onSearchReports: function () {
            var sSearchText = this.byId("searchReviewer1") ? this.byId("searchReviewer1").getValue() : "";
            var sReportId = this.byId("inputReportIdFilter") ? this.byId("inputReportIdFilter").getValue() : "";
            var sSystem = this.byId("selectSystemFilter") ? this.byId("selectSystemFilter").getSelectedKey() : "All";
            var sStatus = this.byId("selectStatusFilter") ? this.byId("selectStatusFilter").getSelectedKey() : "All";

            var aFilters = [];

            if (sSearchText && sSearchText.trim() !== "") {
                var aSubFilters = [
                    new Filter("reportId", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("reportName", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("controlId", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("controlName", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("businessProcess", FilterOperator.Contains, sSearchText.trim())
                ];
                aFilters.push(new Filter({ filters: aSubFilters, and: false }));
            }

            if (sReportId && sReportId.trim() !== "") {
                aFilters.push(new Filter("reportId", FilterOperator.Contains, sReportId.trim()));
            }

            if (sSystem && sSystem !== "All") {
                aFilters.push(new Filter("system", FilterOperator.Contains, sSystem));
            }

            if (sStatus && sStatus !== "All") {
                aFilters.push(new Filter("reviewerStatus", FilterOperator.Contains, sStatus));
            }

            var oTable = this.byId("reviewer1Table");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },

        onResetFilters: function () {
            if (this.byId("searchReviewer1")) { this.byId("searchReviewer1").setValue(""); }
            if (this.byId("inputReportIdFilter")) { this.byId("inputReportIdFilter").setValue(""); }
            if (this.byId("selectSystemFilter")) { this.byId("selectSystemFilter").setSelectedKey("All"); }
            if (this.byId("selectStatusFilter")) { this.byId("selectStatusFilter").setSelectedKey("All"); }
            this.onSearchReports();
            MessageToast.show("Reviewer 1 Filters Reset.");
        },

        onFilterSystem: function () {
            this.onSearchReports();
        },

        onFilterStatus: function () {
            this.onSearchReports();
        },

        onProfileNav: function () {
            UIComponent.getRouterFor(this).navTo("Reviewer1Profile");
        },

        onProfilePress: function (oEvent) {
            var oButton = oEvent.getSource();
            var oPopover = this.byId("rev1ProfilePopover");
            if (oPopover) {
                oPopover.openBy(oButton);
            }
        },

        onNotificationPress: function (oEvent) {
            NotificationPopover.toggle(oEvent, this);
        },

        onLogout: function () {
            GlobalLoading.logout(this);
        }

    });

});
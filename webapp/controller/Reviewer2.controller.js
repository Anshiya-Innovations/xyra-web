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

    return Controller.extend("xyraweb.controller.Reviewer2", {

        onInit: function () {
            this._loadReviewer2Data();
        },

        _loadReviewer2Data: function () {
            var oData = {
                kpi: {
                    pendingReviews: 14,
                    approvedToday: 86,
                    rejectedToday: 2,
                    slaDue: 3
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
                        reviewer1Decision: "Approved & Forwarded",
                        rev1Comments: "Verified AUTH_CHECK_FAIL parameter deviation. Basis remediation initiated.",
                        evidenceStatus: "Verified",
                        reviewer2Status: "Pending Technical Review",
                        reviewer2State: "Warning",
                        rev1RcaText: "Root Cause: Parameter AUTH_CHECK_FAIL was inadvertently set to disabled during kernel upgrade on 02-Aug-2026.",
                        rev1Signature: "John Basis (EMP-88492) - Verified SHA-256",
                        rev1Date: "04-Aug-2026",
                        rev2RcaText: "Manager Validation: Reviewed Basis kernel upgrade logs and confirmed parameter correction on PRD-100.",
                        reviewer2Name: "Sarah Manager",
                        employeeId: "MGR-99201",
                        decisionDate: "04-Aug-2026",
                        sigStatus: "Verified (SHA-256)",
                        elecSigConfirmed: true,
                        evidenceFilesCount: 2,
                        evidenceFiles: [
                            { title: "Java Audit Buffer Log", description: "/usr/sap/audit/java/sec_audit.log", status: "Extracted" },
                            { title: "SCS Benchmark Rule LOG08", description: "Mandatory logging for AUTH_CHECK_FAIL", status: "Validated" }
                        ],
                        attachments: [
                            { fileName: "sec_audit_trace_prd100.log", fileSize: "2.4 MB", uploadDate: "03-Aug-2026" }
                        ],
                        automationLogs: [
                            { logMessage: "XYRA Automated Engine scan started for PRD-100", timestamp: "03-Aug-2026 08:00:12 AM", level: "INFO" },
                            { logMessage: "Deviation detected: AUTH_CHECK_FAIL = 0 (Disabled)", timestamp: "03-Aug-2026 08:00:45 AM", level: "ERROR" }
                        ],
                        screenshots: [
                            { title: "NWA Audit Filter Parameter Config", resolution: "1920x1080 PNG" }
                        ],
                        reviewHistory: [
                            { action: "Automated Scan", comments: "Rule LOG08 executed by XYRA Engine", statusTimeline: "03-Aug 08:00 AM - Completed" },
                            { action: "Reviewer 1 Verification", comments: "Approved & Forwarded by John Basis", statusTimeline: "03-Aug 09:30 AM - Approved" },
                            { action: "Manager Assignment", comments: "Assigned to Sarah Manager (Reviewer 2)", statusTimeline: "03-Aug 10:15 AM - In Review" }
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
                        reviewer1Decision: "Approved & Forwarded",
                        rev1Comments: "All 12 HANA audit policies validated against SCS policy.",
                        evidenceStatus: "Verified",
                        reviewer2Status: "Forwarded to Escalation Manager",
                        reviewer2State: "Success",
                        rev1RcaText: "Root Cause: Routine audit policy check completed with zero deviations.",
                        rev1Signature: "John Basis (EMP-88492) - Verified SHA-256",
                        rev1Date: "03-Aug-2026",
                        rev2RcaText: "Manager Validation: Full technical compliance confirmed across SYSTEMDB & Tenant DBs.",
                        reviewer2Name: "Sarah Manager",
                        employeeId: "MGR-99201",
                        decisionDate: "03-Aug-2026",
                        sigStatus: "Verified (SHA-256)",
                        elecSigConfirmed: true,
                        evidenceFilesCount: 1,
                        evidenceFiles: [
                            { title: "HANA DB Audit Policy Dump", description: "SYSTEMDB AUDIT_LOG export", status: "Verified" }
                        ],
                        attachments: [
                            { fileName: "hana_audit_policies.csv", fileSize: "512 KB", uploadDate: "03-Aug-2026" }
                        ],
                        automationLogs: [
                            { logMessage: "HANA DB Audit Policy scan completed", timestamp: "03-Aug-2026 09:00:00 AM", level: "INFO" }
                        ],
                        screenshots: [
                            { title: "HANA Studio Security Audit Cockpit", resolution: "1920x1080 PNG" }
                        ],
                        reviewHistory: [
                            { action: "Automated Scan", comments: "Rule LOG28 executed by XYRA Engine", statusTimeline: "03-Aug 09:00 AM - Completed" },
                            { action: "Reviewer 1 Verification", comments: "Approved by John Basis", statusTimeline: "03-Aug 11:15 AM - Approved" },
                            { action: "Reviewer 2 Manager Sign-off", comments: "Approved & Forwarded to Escalation Manager", statusTimeline: "03-Aug 14:00 PM - Approved" }
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
                        reviewer1Decision: "Approved & Forwarded",
                        rev1Comments: "User administration logging verified across active filters 001-005.",
                        evidenceStatus: "Verified",
                        reviewer2Status: "Pending Technical Review",
                        reviewer2State: "Warning",
                        rev1RcaText: "Root Cause: Standard compliance audit for QAS environment.",
                        rev1Signature: "John Basis (EMP-88492) - Verified SHA-256",
                        rev1Date: "04-Aug-2026",
                        rev2RcaText: "Manager Validation: Pending manager technical review.",
                        reviewer2Name: "Sarah Manager",
                        employeeId: "MGR-99201",
                        decisionDate: "04-Aug-2026",
                        sigStatus: "Verified (SHA-256)",
                        elecSigConfirmed: true,
                        evidenceFilesCount: 1,
                        evidenceFiles: [
                            { title: "QAS UME Log Trace", description: "UME User Admin trace log", status: "Extracted" }
                        ],
                        attachments: [
                            { fileName: "qas_ume_trace.txt", fileSize: "1.1 MB", uploadDate: "02-Aug-2026" }
                        ],
                        automationLogs: [
                            { logMessage: "UME Log Trace scan finished", timestamp: "02-Aug-2026 14:20:00 PM", level: "INFO" }
                        ],
                        screenshots: [
                            { title: "UME Config Log Settings", resolution: "1920x1080 PNG" }
                        ],
                        reviewHistory: [
                            { action: "Automated Scan", comments: "Rule LOG08 executed by XYRA Engine", statusTimeline: "02-Aug 14:20 PM - Completed" },
                            { action: "Reviewer 1 Verification", comments: "Approved by John Basis", statusTimeline: "02-Aug 16:00 PM - Approved" }
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
                        reviewer1Decision: "Approved & Forwarded",
                        rev1Comments: "Retention period set to 30 Days. Basis correction requested.",
                        evidenceStatus: "Action Required",
                        reviewer2Status: "Returned to Reviewer 1",
                        reviewer2State: "Warning",
                        rev1RcaText: "Root Cause: Default global.ini audit retention was set to 30 days during DB provisioning.",
                        rev1Signature: "John Basis (EMP-88492) - Verified SHA-256",
                        rev1Date: "04-Aug-2026",
                        rev2RcaText: "Manager Validation: Returned to Reviewer 1 for explicit parameter modification confirmation on HDB-20.",
                        reviewer2Name: "Sarah Manager",
                        employeeId: "MGR-99201",
                        decisionDate: "04-Aug-2026",
                        sigStatus: "Verified (SHA-256)",
                        elecSigConfirmed: false,
                        evidenceFilesCount: 1,
                        evidenceFiles: [
                            { title: "HANA Global Config File", description: "global.ini audit_retention parameter", status: "Verified" }
                        ],
                        attachments: [
                            { fileName: "global_ini_retention.ini", fileSize: "128 KB", uploadDate: "01-Aug-2026" }
                        ],
                        automationLogs: [
                            { logMessage: "global.ini parameter audit_retention = 30", timestamp: "01-Aug-2026 10:00:00 AM", level: "WARN" }
                        ],
                        screenshots: [
                            { title: "HANA Cockpit Retention Config", resolution: "1920x1080 PNG" }
                        ],
                        reviewHistory: [
                            { action: "Automated Scan", comments: "Rule LOG28 executed by XYRA Engine", statusTimeline: "01-Aug 10:00 AM - Completed" },
                            { action: "Reviewer 1 Verification", comments: "Approved by John Basis", statusTimeline: "01-Aug 11:30 AM - Approved" },
                            { action: "Manager Review", comments: "Returned to Reviewer 1 for parameter fix", statusTimeline: "01-Aug 15:20 PM - Returned" }
                        ]
                    }
                ],
                selectedReport: null
            };

            oData.selectedReport = oData.reports[0];
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "reviewer2Model");
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
            var oTable = this.byId("reviewer2Table");
            var aSelected = oTable ? oTable.getSelectedItems() : [];
            var oModel = this.getView().getModel("reviewer2Model");

            if (aSelected.length > 0) {
                var oContext = aSelected[0].getBindingContext("reviewer2Model");
                return oContext ? oContext.getObject() : oModel.getProperty("/reports/0");
            }
            return oModel.getProperty("/reports/0");
        },

        onReportRowPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("reviewer2Model");
            if (oContext) {
                var oReport = oContext.getObject();
                this.getView().getModel("reviewer2Model").setProperty("/selectedReport", oReport);
                this.onSelectTabAnalysis();
                MessageToast.show("Navigating to Detailed Review Analysis for " + oReport.reportId);
            }
        },

        onSelectionChange: function (oEvent) {
            var aItems = oEvent.getSource().getSelectedItems();
            if (aItems.length > 0) {
                var oContext = aItems[0].getBindingContext("reviewer2Model");
                if (oContext) {
                    this.getView().getModel("reviewer2Model").setProperty("/selectedReport", oContext.getObject());
                }
            }
            MessageToast.show(aItems.length + " report(s) selected");
        },

        // 1. View Report Button
        onViewReport: function () {
            var oReport = this._getSelectedReport();
            this.getView().getModel("reviewer2Model").setProperty("/selectedReport", oReport);
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
            this.getView().getModel("reviewer2Model").setProperty("/selectedReport", oReport);
            var oDialog = this.byId("viewEvidenceDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSendThroughEmail: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("reviewer2Model");
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

        // 3. Request Additional Evidence Button
        onRequestEvidence: function () {
            var oDialog = this.byId("requestEvidenceDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSubmitRequestEvidence: function () {
            var sEvidenceReq = this.byId("inputRequestEvidenceArea").getValue();
            if (!sEvidenceReq) {
                MessageToast.show("Please specify the additional evidence required.");
                return;
            }

            var oReport = this._getSelectedReport();
            oReport.reviewer2Status = "Evidence Requested";
            oReport.reviewer2State = "Information";
            this.getView().getModel("reviewer2Model").refresh(true);

            MessageToast.show("Additional evidence request dispatched for " + oReport.reportId);
            this.onCloseRequestEvidenceDialog();
        },

        onCloseRequestEvidenceDialog: function () {
            var oDialog = this.byId("requestEvidenceDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        // 4. Approve & Forward to Escalation Manager Handler
        onApproveForward: function () {
            var oReport = this._getSelectedReport();

            // Rule 1: Manager Root Cause Analysis is mandatory
            if (!oReport.rev2RcaText || oReport.rev2RcaText.trim() === "") {
                MessageBox.error("Root Cause Analysis (Mandatory) is required before approving.");
                return;
            }

            // Rule 2: Electronic Signature confirmation is required
            if (!oReport.elecSigConfirmed) {
                MessageBox.error("Please check the Electronic Signature confirmation box: 'I confirm that I have personally reviewed this exception.' before approving.");
                return;
            }

            var oDialog = this.byId("approveDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onConfirmApproveForward: function () {
            var oReport = this._getSelectedReport();
            oReport.reviewer2Status = "Forwarded to Escalation Manager";
            oReport.reviewer2State = "Success";

            // Append to Review History
            if (!oReport.reviewHistory) { oReport.reviewHistory = []; }
            oReport.reviewHistory.unshift({
                action: "Level 2 Manager Approval",
                comments: oReport.rev2RcaText,
                statusTimeline: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString() + " - Approved"
            });

            // Update KPI counts
            var oModel = this.getView().getModel("reviewer2Model");
            var iApproved = oModel.getProperty("/kpi/approvedToday") || 0;
            oModel.setProperty("/kpi/approvedToday", iApproved + 1);

            oModel.refresh(true);
            MessageToast.show("Report " + oReport.reportId + " Approved & Forwarded to Escalation Manager.");
            this.onCloseApproveDialog();
        },

        onCloseApproveDialog: function () {
            var oDialog = this.byId("approveDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        // 5. Reject & Return to Reviewer 1 Handler
        onRejectReport: function () {
            var oReport = this._getSelectedReport();

            // Rule 1: Manager Root Cause Analysis is mandatory
            if (!oReport.rev2RcaText || oReport.rev2RcaText.trim() === "") {
                MessageBox.error("Root Cause Analysis (Mandatory) is required before rejecting.");
                return;
            }

            // Rule 2: Electronic Signature confirmation is required
            if (!oReport.elecSigConfirmed) {
                MessageBox.error("Please check the Electronic Signature confirmation box: 'I confirm that I have personally reviewed this exception.' before rejecting.");
                return;
            }

            var oDialog = this.byId("rejectDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSubmitReject: function () {
            var oReport = this._getSelectedReport();
            oReport.reviewer2Status = "Returned to Reviewer 1";
            oReport.reviewer2State = "Warning";

            // Append to Review History
            if (!oReport.reviewHistory) { oReport.reviewHistory = []; }
            oReport.reviewHistory.unshift({
                action: "Level 2 Rejection",
                comments: oReport.rev2RcaText,
                statusTimeline: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString() + " - Returned"
            });

            // Update KPI counts
            var oModel = this.getView().getModel("reviewer2Model");
            var iRejected = oModel.getProperty("/kpi/rejectedToday") || 0;
            oModel.setProperty("/kpi/rejectedToday", iRejected + 1);

            oModel.refresh(true);
            MessageToast.show("Report " + oReport.reportId + " Rejected & Returned to Reviewer 1.");
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
            var sQuery = oEvent.getParameter("query") || (this.byId("searchReviewer2") ? this.byId("searchReviewer2").getValue() : "");
            MessageToast.show("Searching technical reports: " + sQuery);
        },

        onResetFilters: function () {
            if (this.byId("searchReviewer2")) { this.byId("searchReviewer2").setValue(""); }
            if (this.byId("inputReportIdFilter2")) { this.byId("inputReportIdFilter2").setValue(""); }
            if (this.byId("selectSystemFilter2")) { this.byId("selectSystemFilter2").setSelectedKey("All"); }
            if (this.byId("selectStatusFilter2")) { this.byId("selectStatusFilter2").setSelectedKey("All"); }
            this._loadReviewer2Data();
            MessageToast.show("Reviewer 2 Filters Reset.");
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
            var oPopover = this.byId("rev2ProfilePopover");
            if (oPopover) {
                oPopover.openBy(oButton);
            }
        },

        onNotificationPress: function () {
            MessageToast.show("No new notifications for Reviewer 2.");
        },

        onLogout: function () {
            UIComponent.getRouterFor(this).navTo("Login");
        }

    });

});
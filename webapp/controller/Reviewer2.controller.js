sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "xyraweb/model/GlobalLoading"
], function (
    Controller,
    UIComponent,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox,
    GlobalLoading
) {
    "use strict";

    return Controller.extend("xyraweb.controller.Reviewer2", {

        onInit: function () {
            this._loadReviewer2Data();
        },

        _loadReviewer2Data: function () {
            var oData = {
                kpi: {
                    pendingReviews: 12,
                    approvedToday: 48,
                    rejectedToday: 1,
                    slaDue: 2
                },
                historyKpis: {
                    approved: 48,
                    rejected: 1,
                    pending: 12
                },
                reports: [
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
                        reviewer1Decision: "Approved",
                        rev1Date: "03-Aug-2026 11:15 AM",
                        rev1Signature: "John Basis (EMP-88492) • Verified (SHA-256)",
                        rev1Comments: "All 12 HANA audit policies validated against SCS policy.",
                        rev1RcaText: "Root Cause: Routine audit policy check completed with zero deviations.",
                        evidenceStatus: "Verified",
                        reviewer2Status: "Pending Technical Review",
                        reviewer2State: "Warning",
                        rev2RcaText: "Manager Validation: Evaluated HANA audit log parameter configuration against enterprise security policy. Confirmed compliant.",
                        reviewer2Name: "Sarah Manager",
                        employeeId: "MGR-99021",
                        decisionDate: "04-Aug-2026",
                        sigStatus: "Verified (SHA-256)",
                        elecSigConfirmed: true,
                        evidenceFiles: [
                            { title: "HANA DB Audit Policy Dump", description: "SYSTEMDB AUDIT_LOG export", status: "Verified" }
                        ],
                        reviewHistory: [
                            { action: "Level 1 Approval", comments: "Forwarded to Reviewer 2 by John Basis", statusTimeline: "Completed (03-Aug 11:15 AM)" },
                            { action: "Level 2 Review", comments: "Assigned to Manager Exception Reviewer", statusTimeline: "In Progress" }
                        ]
                    },
                    {
                        reportId: "REP-105",
                        reportName: "NetWeaver Parameter Audit",
                        controlId: "PAR04",
                        controlName: "SAP Kernel Parameter Verification",
                        businessProcess: "System Parameter Governance",
                        riskLevel: "High Risk",
                        riskState: "Error",
                        system: "PRD-100 (Java)",
                        generatedDate: "02-Aug-2026",
                        reviewer1Decision: "Approved",
                        rev1Date: "03-Aug-2026 09:30 AM",
                        rev1Signature: "John Basis (EMP-88492) • Verified (SHA-256)",
                        rev1Comments: "Parameter login/fails_to_user_lock set to 3.",
                        rev1RcaText: "Root Cause: Lock parameter adjusted to align with updated password policy.",
                        evidenceStatus: "Verified",
                        reviewer2Status: "Approved & Forwarded",
                        reviewer2State: "Success",
                        rev2RcaText: "Manager Validation: Password lockout policy change reviewed and approved.",
                        reviewer2Name: "Sarah Manager",
                        employeeId: "MGR-99021",
                        decisionDate: "03-Aug-2026",
                        sigStatus: "Verified (SHA-256)",
                        elecSigConfirmed: true,
                        evidenceFiles: [
                            { title: "login_fails_lock.trc", description: "Kernel trace log", status: "Verified" }
                        ],
                        reviewHistory: [
                            { action: "Level 1 Approval", comments: "Approved by Reviewer 1", statusTimeline: "Completed" },
                            { action: "Level 2 Approval", comments: "Forwarded to Escalation Manager", statusTimeline: "Approved" }
                        ]
                    }
                ],
                history: [
                    {
                        reportId: "REP-105",
                        reportName: "NetWeaver Parameter Audit",
                        controlId: "PAR04",
                        system: "PRD-100 (Java)",
                        decision: "Approved",
                        actionDate: "03-Aug-2026",
                        ticketStatus: "Escalated",
                        ticketStatusState: "Success",
                        ticketId: "TCK-90412",
                        reviewer2Name: "Sarah Manager",
                        employeeId: "MGR-99021",
                        rev1RcaText: "Lock parameter adjusted to align with updated password policy.",
                        rcaText: "Manager Validation: Password lockout policy change reviewed and approved. Forwarded to Escalation Manager."
                    },
                    {
                        reportId: "REP-099",
                        reportName: "HANA Privileged User Audit",
                        controlId: "SEC14",
                        system: "HDB-20 (HANA)",
                        decision: "Rejected",
                        actionDate: "01-Aug-2026",
                        ticketStatus: "Returned",
                        ticketStatusState: "Error",
                        ticketId: "TCK-89201",
                        reviewer2Name: "Sarah Manager",
                        employeeId: "MGR-99021",
                        rev1RcaText: "User assigned temporary elevated DB admin privileges.",
                        rcaText: "Manager Rejection: Emergency change ticket ticket reference missing. Returned to Reviewer 1 for remediation."
                    },
                    {
                        reportId: "REP-094",
                        reportName: "Java Audit Buffer Retention",
                        controlId: "LOG08",
                        system: "QAS-200 (Java)",
                        decision: "Additional Evidence Requested",
                        actionDate: "30-Jul-2026",
                        ticketStatus: "Action Required",
                        ticketStatusState: "Warning",
                        ticketId: "TCK-88745",
                        reviewer2Name: "Sarah Manager",
                        employeeId: "MGR-99021",
                        rev1RcaText: "Log retention updated to 90 days.",
                        rcaText: "Additional Evidence Requested: Requested raw NWA log file export for verification."
                    }
                ],
                selectedReport: null,
                selectedHistoryItem: null
            };

            oData.selectedReport = oData.reports[0];
            oData.selectedHistoryItem = oData.history[0];
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "reviewer2Model");
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("reviewer2ToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
            }
        },

        onProfileNav: function () {
            UIComponent.getRouterFor(this).navTo("Reviewer2Profile");
        },

        // SLIDE NAVIGATION HANDLERS
        onSelectTabQueue: function () {
            var oVboxQueue = this.byId("vboxReviewQueue");
            var oVboxAnalysis = this.byId("vboxDetailedAnalysis");
            var oVboxHistory = this.byId("vboxReviewerHistory");
            var oBtnQueue = this.byId("btnTabReviewQueue");
            var oBtnAnalysis = this.byId("btnTabDetailedAnalysis");
            var oSideNav = this.byId("reviewer2SideNavigation");

            if (oVboxQueue) { oVboxQueue.setVisible(true); }
            if (oVboxAnalysis) { oVboxAnalysis.setVisible(false); }
            if (oVboxHistory) { oVboxHistory.setVisible(false); }

            if (oBtnQueue) { oBtnQueue.setType("Emphasized"); }
            if (oBtnAnalysis) { oBtnAnalysis.setType("Transparent"); }
            if (oSideNav) { oSideNav.setSelectedKey("Queue"); }
        },

        onSelectTabAnalysis: function () {
            var oVboxQueue = this.byId("vboxReviewQueue");
            var oVboxAnalysis = this.byId("vboxDetailedAnalysis");
            var oVboxHistory = this.byId("vboxReviewerHistory");
            var oBtnQueue = this.byId("btnTabReviewQueue");
            var oBtnAnalysis = this.byId("btnTabDetailedAnalysis");
            var oSideNav = this.byId("reviewer2SideNavigation");

            if (oVboxQueue) { oVboxQueue.setVisible(false); }
            if (oVboxAnalysis) { oVboxAnalysis.setVisible(true); }
            if (oVboxHistory) { oVboxHistory.setVisible(false); }

            if (oBtnQueue) { oBtnQueue.setType("Transparent"); }
            if (oBtnAnalysis) { oBtnAnalysis.setType("Emphasized"); }
            if (oSideNav) { oSideNav.setSelectedKey("Analysis"); }
        },

        onSelectTabHistory: function () {
            var oVboxQueue = this.byId("vboxReviewQueue");
            var oVboxAnalysis = this.byId("vboxDetailedAnalysis");
            var oVboxHistory = this.byId("vboxReviewerHistory");
            var oBtnQueue = this.byId("btnTabReviewQueue");
            var oBtnAnalysis = this.byId("btnTabDetailedAnalysis");
            var oSideNav = this.byId("reviewer2SideNavigation");

            if (oVboxQueue) { oVboxQueue.setVisible(false); }
            if (oVboxAnalysis) { oVboxAnalysis.setVisible(false); }
            if (oVboxHistory) { oVboxHistory.setVisible(true); }

            if (oBtnQueue) { oBtnQueue.setType("Transparent"); }
            if (oBtnAnalysis) { oBtnAnalysis.setType("Transparent"); }
            if (oSideNav) { oSideNav.setSelectedKey("History"); }
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

        // QUICK ACTIONS DIALOG HANDLERS
        onViewReport: function () {
            var oReport = this._getSelectedReport();
            this.getView().getModel("reviewer2Model").setProperty("/selectedReport", oReport);
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
            this.getView().getModel("reviewer2Model").setProperty("/selectedReport", oReport);
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

        // ADD COMMENTS HANDLERS
        onAddComments: function () {
            var oDialog = this.byId("addCommentsDialog2");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSubmitComments: function () {
            var sComment = this.byId("inputCommentArea2") ? this.byId("inputCommentArea2").getValue() : "";
            if (!sComment || sComment.trim() === "") {
                MessageBox.error("Please enter a review comment before saving.");
                return;
            }
            var oReport = this._getSelectedReport();
            oReport.rev2Comments = sComment;
            oReport.rev2RcaText = (oReport.rev2RcaText ? oReport.rev2RcaText + "\n" : "") + "Manager Note: " + sComment;
            this.getView().getModel("reviewer2Model").refresh(true);
            MessageToast.show("Manager comments saved successfully for " + oReport.reportId);
            this.onCloseAddCommentsDialog();
        },

        onCloseAddCommentsDialog: function () {
            var oDialog = this.byId("addCommentsDialog2");
            if (oDialog) {
                oDialog.close();
            }
        },

        // REQUEST ADDITIONAL EVIDENCE
        onRequestEvidence: function () {
            var oDialog = this.byId("requestEvidenceDialog2");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSubmitRequestEvidence: function () {
            var sEvidenceReq = this.byId("inputRequestEvidenceArea2") ? this.byId("inputRequestEvidenceArea2").getValue() : "";
            if (!sEvidenceReq || sEvidenceReq.trim() === "") {
                MessageBox.error("Please specify the additional evidence required.");
                return;
            }

            var oReport = this._getSelectedReport();
            oReport.reviewer2Status = "Additional Evidence Requested";
            oReport.reviewer2State = "Warning";

            var oModel = this.getView().getModel("reviewer2Model");
            var aHistory = oModel.getProperty("/history") || [];
            aHistory.unshift({
                reportId: oReport.reportId,
                reportName: oReport.reportName,
                controlId: oReport.controlId,
                system: oReport.system,
                decision: "Additional Evidence Requested",
                actionDate: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
                ticketStatus: "Action Required",
                ticketStatusState: "Warning",
                ticketId: "TCK-" + Math.floor(10000 + Math.random() * 90000),
                reviewer2Name: "Sarah Manager",
                employeeId: "MGR-99021",
                rev1RcaText: oReport.rev1RcaText,
                rcaText: "Additional Evidence Requested: " + sEvidenceReq
            });
            oModel.setProperty("/history", aHistory);
            oModel.refresh(true);

            MessageToast.show("Additional evidence request sent to Reviewer 1 for " + oReport.reportId);
            this.onCloseRequestEvidenceDialog();
        },

        onCloseRequestEvidenceDialog: function () {
            var oDialog = this.byId("requestEvidenceDialog2");
            if (oDialog) {
                oDialog.close();
            }
        },

        // APPROVAL WORKFLOW
        onApproveForward: function () {
            var oReport = this._getSelectedReport();

            if (!oReport.rev2RcaText || oReport.rev2RcaText.trim() === "") {
                MessageBox.error("Root Cause Analysis (Mandatory) is required before approving.");
                return;
            }

            if (!oReport.elecSigConfirmed) {
                MessageBox.error("Please check the Electronic Signature confirmation box: 'I confirm that I have personally reviewed this exception.' before approving.");
                return;
            }

            var oDialog = this.byId("approveDialog2");
            if (oDialog) {
                oDialog.open();
            }
        },

        onConfirmApproveForward: function () {
            var oReport = this._getSelectedReport();
            oReport.reviewer2Status = "Approved & Forwarded";
            oReport.reviewer2State = "Success";

            if (!oReport.reviewHistory) { oReport.reviewHistory = []; }
            oReport.reviewHistory.unshift({
                action: "Level 2 Approval",
                comments: oReport.rev2RcaText,
                statusTimeline: "Forwarded to Escalation Manager (" + new Date().toLocaleTimeString() + ")"
            });

            var oModel = this.getView().getModel("reviewer2Model");
            var iApproved = oModel.getProperty("/kpi/approvedToday") || 0;
            oModel.setProperty("/kpi/approvedToday", iApproved + 1);

            // Add record to Reviewer 2 History table
            var aHistory = oModel.getProperty("/history") || [];
            aHistory.unshift({
                reportId: oReport.reportId,
                reportName: oReport.reportName,
                controlId: oReport.controlId,
                system: oReport.system,
                decision: "Approved",
                actionDate: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
                ticketStatus: "Escalated",
                ticketStatusState: "Success",
                ticketId: "TCK-" + Math.floor(10000 + Math.random() * 90000),
                reviewer2Name: "Sarah Manager",
                employeeId: "MGR-99021",
                rev1RcaText: oReport.rev1RcaText,
                rcaText: oReport.rev2RcaText
            });
            oModel.setProperty("/history", aHistory);

            var iHistApproved = oModel.getProperty("/historyKpis/approved") || 0;
            oModel.setProperty("/historyKpis/approved", iHistApproved + 1);

            oModel.refresh(true);
            MessageToast.show("Report " + oReport.reportId + " Approved & Forwarded to Escalation Manager.");
            this.onCloseApproveDialog();
        },

        onCloseApproveDialog: function () {
            var oDialog = this.byId("approveDialog2");
            if (oDialog) {
                oDialog.close();
            }
        },

        // REJECT WORKFLOW
        onRejectReport: function () {
            var oReport = this._getSelectedReport();

            if (!oReport.rev2RcaText || oReport.rev2RcaText.trim() === "") {
                MessageBox.error("Root Cause Analysis (Mandatory) is required before rejecting.");
                return;
            }

            if (!oReport.elecSigConfirmed) {
                MessageBox.error("Please check the Electronic Signature confirmation box: 'I confirm that I have personally reviewed this exception.' before rejecting.");
                return;
            }

            var oDialog = this.byId("rejectDialog2");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSubmitReject: function () {
            var oReport = this._getSelectedReport();
            oReport.reviewer2Status = "Returned to Reviewer 1";
            oReport.reviewer2State = "Error";

            if (!oReport.reviewHistory) { oReport.reviewHistory = []; }
            oReport.reviewHistory.unshift({
                action: "Level 2 Rejection",
                comments: oReport.rev2RcaText,
                statusTimeline: "Returned to Reviewer 1 (" + new Date().toLocaleTimeString() + ")"
            });

            var oModel = this.getView().getModel("reviewer2Model");
            var iRejected = oModel.getProperty("/kpi/rejectedToday") || 0;
            oModel.setProperty("/kpi/rejectedToday", iRejected + 1);

            // Add record to Reviewer 2 History table
            var aHistory = oModel.getProperty("/history") || [];
            aHistory.unshift({
                reportId: oReport.reportId,
                reportName: oReport.reportName,
                controlId: oReport.controlId,
                system: oReport.system,
                decision: "Rejected",
                actionDate: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
                ticketStatus: "Returned",
                ticketStatusState: "Error",
                ticketId: "TCK-" + Math.floor(10000 + Math.random() * 90000),
                reviewer2Name: "Sarah Manager",
                employeeId: "MGR-99021",
                rev1RcaText: oReport.rev1RcaText,
                rcaText: oReport.rev2RcaText
            });
            oModel.setProperty("/history", aHistory);

            var iHistRejected = oModel.getProperty("/historyKpis/rejected") || 0;
            oModel.setProperty("/historyKpis/rejected", iHistRejected + 1);

            oModel.refresh(true);
            MessageToast.show("Report " + oReport.reportId + " Rejected & Returned to Reviewer 1.");
            this.onCloseRejectDialog();
        },

        onCloseRejectDialog: function () {
            var oDialog = this.byId("rejectDialog2");
            if (oDialog) {
                oDialog.close();
            }
        },

        // HISTORY SEARCH & DIALOG HANDLERS
        onSearchHistory: function () {
            var sSearchText = this.byId("searchHistory2") ? this.byId("searchHistory2").getValue() : "";
            var sControlId = this.byId("inputHistoryControlId2") ? this.byId("inputHistoryControlId2").getValue() : "";
            var sSystem = this.byId("selectHistorySystem2") ? this.byId("selectHistorySystem2").getSelectedKey() : "All";
            var sDecision = this.byId("selectHistoryDecision2") ? this.byId("selectHistoryDecision2").getSelectedKey() : "All";
            var sStatus = this.byId("selectHistoryStatus2") ? this.byId("selectHistoryStatus2").getSelectedKey() : "All";
            var sDate = this.byId("dpHistoryDate2") ? this.byId("dpHistoryDate2").getValue() : "";

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
                aFilters.push(new Filter("actionDate", FilterOperator.Contains, sDate.trim()));
            }

            var oTable = this.byId("reviewerHistoryTable2");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },

        onResetHistoryFilters: function () {
            if (this.byId("searchHistory2")) { this.byId("searchHistory2").setValue(""); }
            if (this.byId("inputHistoryControlId2")) { this.byId("inputHistoryControlId2").setValue(""); }
            if (this.byId("selectHistorySystem2")) { this.byId("selectHistorySystem2").setSelectedKey("All"); }
            if (this.byId("selectHistoryDecision2")) { this.byId("selectHistoryDecision2").setSelectedKey("All"); }
            if (this.byId("selectHistoryStatus2")) { this.byId("selectHistoryStatus2").setSelectedKey("All"); }
            if (this.byId("dpHistoryDate2")) { this.byId("dpHistoryDate2").setValue(""); }
            this.onSearchHistory();
            MessageToast.show("Reviewer 2 History Filters Reset.");
        },

        onViewHistoryDetails: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("reviewer2Model");
            if (oContext) {
                var oHistoryItem = oContext.getObject();
                this.getView().getModel("reviewer2Model").setProperty("/selectedHistoryItem", oHistoryItem);
                var oDialog = this.byId("viewHistoryDetailsDialog2");
                if (oDialog) {
                    oDialog.open();
                }
            }
        },

        onCloseHistoryDetailsDialog: function () {
            var oDialog = this.byId("viewHistoryDetailsDialog2");
            if (oDialog) {
                oDialog.close();
            }
        },

        // SEARCH & FILTER HANDLERS (REVIEW QUEUE LIVE FILTER)
        onSearchReports: function () {
            var sSearchText = this.byId("searchReviewer2") ? this.byId("searchReviewer2").getValue() : "";
            var sReportId = this.byId("inputReportIdFilter2") ? this.byId("inputReportIdFilter2").getValue() : "";
            var sSystem = this.byId("selectSystemFilter2") ? this.byId("selectSystemFilter2").getSelectedKey() : "All";
            var sStatus = this.byId("selectStatusFilter2") ? this.byId("selectStatusFilter2").getSelectedKey() : "All";

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
                aFilters.push(new Filter("reviewer2Status", FilterOperator.Contains, sStatus));
            }

            var oTable = this.byId("reviewer2Table");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },

        onResetFilters: function () {
            if (this.byId("searchReviewer2")) { this.byId("searchReviewer2").setValue(""); }
            if (this.byId("inputReportIdFilter2")) { this.byId("inputReportIdFilter2").setValue(""); }
            if (this.byId("selectSystemFilter2")) { this.byId("selectSystemFilter2").setSelectedKey("All"); }
            if (this.byId("selectStatusFilter2")) { this.byId("selectStatusFilter2").setSelectedKey("All"); }
            this.onSearchReports();
            MessageToast.show("Reviewer 2 Filters Reset.");
        },

        onFilterSystem: function () {
            this.onSearchReports();
        },

        onFilterStatus: function () {
            this.onSearchReports();
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
            GlobalLoading.logout(this);
        }

    });

});
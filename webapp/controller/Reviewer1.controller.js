sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationPopover",
    "xyraweb/service/ReviewClient"
], function (
    Controller,
    UIComponent,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox,
    GlobalLoading,
    NotificationPopover,
    ReviewClient
) {
    "use strict";

    return Controller.extend("xyraweb.controller.Reviewer1", {

        onInit: function () {
            this._loadReviewer1Data();
        },

        // Real Level 1 queue + history from ReviewClient, with the offline-
        // mock fallback (kept for when xyra-core can't be reached) folded
        // into the same call - ReviewClient itself resolves to [] + a notice
        // toast on failure, this just backfills the same demo rows the mock
        // used to show so the screen isn't empty while offline.
        _loadReviewer1Data: function () {
            var that = this;
            var oData = {
                busy: true,
                kpi: { pendingReviews: 0, approvedToday: 0, rejectedToday: 0, slaDue: 0 },
                historyKpis: { approved: 0, rejected: 0, inProgress: 0 },
                reports: [],
                history: [],
                selectedReport: null,
                selectedHistoryItem: null
            };
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "reviewer1Model");

            Promise.all([ReviewClient.listLevel1Queue(), ReviewClient.listLevel1History()]).then(function (aResults) {
                var aReports = aResults[0].length ? aResults[0] : that._getFallbackReports();
                var aHistory = aResults[1].length ? aResults[1] : that._getFallbackHistory();
                var sToday = new Date().toDateString();

                oModel.setProperty("/busy", false);
                oModel.setProperty("/reports", aReports);
                oModel.setProperty("/history", aHistory);
                oModel.setProperty("/kpi", {
                    pendingReviews: aReports.length,
                    approvedToday: aHistory.filter(function (h) { return h.decision === "Approved" && new Date(h.reviewedDate).toDateString() === sToday; }).length,
                    rejectedToday: aHistory.filter(function (h) { return h.decision === "Rejected" && new Date(h.reviewedDate).toDateString() === sToday; }).length,
                    slaDue: 0
                });
                oModel.setProperty("/historyKpis", {
                    approved: aHistory.filter(function (h) { return h.decision === "Approved"; }).length,
                    rejected: aHistory.filter(function (h) { return h.decision === "Rejected"; }).length,
                    inProgress: aReports.length
                });
                oModel.setProperty("/selectedReport", aReports[0] || null);
                oModel.setProperty("/selectedHistoryItem", aHistory[0] || null);
            });
        },

        // ponytail: trimmed offline-only fallback (1 report shape reused
        // verbatim from the original mock) - only shown when xyra-core is
        // unreachable, see ReviewClient's own notice() toast.
        _getFallbackReports: function () {
            return [{
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
                rcaText: "",
                reviewerName: "John Basis",
                employeeId: "EMP-88492",
                decisionDate: "",
                sigStatus: "Pending Signature",
                elecSigConfirmed: false,
                evidenceFilesCount: 0, evidenceFiles: [], automationLogs: [], attachments: [], screenshots: [], reviewHistory: []
            }];
        },

        _getFallbackHistory: function () {
            return [{
                ticketId: "TCK-8801", reportId: "REP-102", controlId: "LOG28",
                reportName: "HANA Audit Logging Parameter Check", system: "HDB-10 (HANA)",
                decision: "Approved", reviewedDate: "03-Aug-2026", ticketStatus: "Forwarded to Reviewer 2",
                ticketStatusState: "Success", remediatedItem: "global.ini -> AUDIT_LOG_STATUS",
                previousValue: "OFF (Disabled)", updatedValue: "ON (Enabled)",
                rcaText: "Parameter enabled during scheduled maintenance window.",
                changedBy: "John Basis", employeeId: "EMP-88492", sigStatus: "Verified (SHA-256)",
                reviewerComment: "Verified audit policies active."
            }];
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
            var oDialog = this.byId("approveDialog");
            var that = this;
            if (oDialog) { oDialog.setBusy(true); }
            ReviewClient.decideLevel1(oReport.reportId, "APPROVE", oReport.rcaText).then(function (oData) {
                if (oDialog) { oDialog.setBusy(false); }
                if (!oData.success) {
                    MessageBox.error(oData.message || "Could not record the decision.");
                    return;
                }
                MessageToast.show("Report " + oReport.reportId + " Approved & Forwarded to Reviewer 2.");
                that.onCloseApproveDialog();
                that._loadReviewer1Data();
            });
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
            var oDialog = this.byId("rejectDialog");
            var that = this;
            if (oDialog) { oDialog.setBusy(true); }
            ReviewClient.decideLevel1(oReport.reportId, "REMEDIATE", oReport.rcaText).then(function (oData) {
                if (oDialog) { oDialog.setBusy(false); }
                if (!oData.success) {
                    MessageBox.error(oData.message || "Could not record the decision.");
                    return;
                }
                MessageToast.show("Report " + oReport.reportId + " Rejected. Remediation ticket " + oData.ticketNumber + " created.");
                that.onCloseRejectDialog();
                that._loadReviewer1Data();
            });
        },

        onCloseRejectDialog: function () {
            var oDialog = this.byId("rejectDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        _parseDateString: function (vDate) {
            if (!vDate) { return null; }
            if (vDate instanceof Date) { return vDate; }
            var s = String(vDate).trim();
            if (!s) { return null; }

            var aSlashParts = s.split(/[\/\.]/);
            if (aSlashParts.length === 3 && aSlashParts[0].length <= 2 && aSlashParts[1].length <= 2 && aSlashParts[2].length === 4) {
                var day = parseInt(aSlashParts[0], 10);
                var month = parseInt(aSlashParts[1], 10) - 1;
                var year = parseInt(aSlashParts[2], 10);
                var dSlash = new Date(year, month, day);
                if (!isNaN(dSlash.getTime())) {
                    return dSlash;
                }
            }

            var sNormalized = s.replace(/-/g, " ");
            var dParsed = new Date(sNormalized);
            if (!isNaN(dParsed.getTime())) {
                return dParsed;
            }

            var dFallback = new Date(s);
            if (!isNaN(dFallback.getTime())) {
                return dFallback;
            }

            return null;
        },

        // HISTORY SEARCH & DIALOG HANDLERS
        onSearchHistory: function () {
            var that = this;
            var sSearchText = this.byId("searchHistory") ? this.byId("searchHistory").getValue() : "";
            var sControlId = this.byId("inputHistoryControlId") ? this.byId("inputHistoryControlId").getValue() : "";
            var sSystem = this.byId("selectHistorySystem") ? this.byId("selectHistorySystem").getSelectedKey() : "All";
            var sDecision = this.byId("selectHistoryDecision") ? this.byId("selectHistoryDecision").getSelectedKey() : "All";
            var sStatus = this.byId("selectHistoryStatus") ? this.byId("selectHistoryStatus").getSelectedKey() : "All";

            var oStartDatePicker = this.byId("dpHistoryStartDate");
            var oEndDatePicker = this.byId("dpHistoryEndDate");

            var dStart = null;
            if (oStartDatePicker) {
                if (oStartDatePicker.getStartDate && oStartDatePicker.getStartDate()) {
                    dStart = oStartDatePicker.getStartDate();
                } else if (oStartDatePicker.getDateValue && oStartDatePicker.getDateValue()) {
                    dStart = oStartDatePicker.getDateValue();
                } else if (oStartDatePicker.getValue && oStartDatePicker.getValue()) {
                    dStart = this._parseDateString(oStartDatePicker.getValue());
                }
            }

            var dEnd = null;
            if (oEndDatePicker) {
                if (oEndDatePicker.getEndDate && oEndDatePicker.getEndDate()) {
                    dEnd = oEndDatePicker.getEndDate();
                } else if (oEndDatePicker.getDateValue && oEndDatePicker.getDateValue()) {
                    dEnd = oEndDatePicker.getDateValue();
                } else if (oEndDatePicker.getValue && oEndDatePicker.getValue()) {
                    dEnd = this._parseDateString(oEndDatePicker.getValue());
                }
            }

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

            if (dStart || dEnd) {
                var dStartDay = dStart ? new Date(dStart.getFullYear(), dStart.getMonth(), dStart.getDate(), 0, 0, 0, 0) : null;
                var dEndDay = dEnd ? new Date(dEnd.getFullYear(), dEnd.getMonth(), dEnd.getDate(), 23, 59, 59, 999) : null;

                aFilters.push(new Filter({
                    path: "reviewedDate",
                    test: function (sDateStr) {
                        if (!sDateStr) { return false; }
                        var dItem = that._parseDateString(sDateStr);
                        if (!dItem || isNaN(dItem.getTime())) { return true; }
                        if (dStartDay && dItem < dStartDay) { return false; }
                        if (dEndDay && dItem > dEndDay) { return false; }
                        return true;
                    }
                }));
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
            if (this.byId("dpHistoryStartDate")) { this.byId("dpHistoryStartDate").reset(); }
            if (this.byId("dpHistoryEndDate")) { this.byId("dpHistoryEndDate").reset(); }
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
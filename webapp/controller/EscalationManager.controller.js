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

    return Controller.extend("xyraweb.controller.EscalationManager", {

        onInit: function () {
            this._loadEscalationManagerData();
        },

        _loadEscalationManagerData: function () {
            var oData = {
                kpi: {
                    pendingApproval: 6,
                    remediationVerified: 18,
                    complianceRate: 98.4
                },
                historyKpis: {
                    approved: 24,
                    rejected: 2,
                    pending: 6
                },
                reports: [
                    {
                        reportId: "REP-101",
                        reportName: "Java Security Parameter Check",
                        controlId: "PAR01",
                        system: "PRD-100 (Java)",
                        reviewer1Comments: "Reviewer 1 verified param login/fails_to_user_lock set to 3.",
                        reviewer2Comments: "Reviewer 2 confirmed lock parameter compliant with security policy.",
                        evidence: "Verified",
                        complianceStatus: "Compliant",
                        complianceState: "Success",
                        remediationStatus: "Verified",
                        remediationState: "Success",
                        workflowStatus: "Pending Final Approval",
                        workflowState: "Warning",
                        managerNotes: "Final audit check ready for security lead signoff."
                    },
                    {
                        reportId: "REP-102",
                        reportName: "HANA Audit Logging Verification",
                        controlId: "LOG28",
                        system: "HDB-10 (HANA)",
                        reviewer1Comments: "Audit buffer settings logged with zero anomalies.",
                        reviewer2Comments: "HANA audit policy configuration verified by manager.",
                        evidence: "Verified",
                        complianceStatus: "Compliant",
                        complianceState: "Success",
                        remediationStatus: "Verified",
                        remediationState: "Success",
                        workflowStatus: "Pending Final Approval",
                        workflowState: "Warning",
                        managerNotes: "All 12 DB audit policies validated."
                    }
                ],
                history: [
                    {
                        ticketId: "TCK-99014",
                        reportId: "REP-098",
                        controlId: "LOG08",
                        reportName: "Java Audit Buffer Retention Verification",
                        system: "PRD-100 (Java)",
                        decision: "Approved",
                        reviewedDate: "04-Aug-2026",
                        complianceStatus: "Compliant",
                        complianceState: "Success",
                        remediationStatus: "Remediated & Verified",
                        remediationState: "Success",
                        ticketStatus: "Closed",
                        ticketStatusState: "Success",
                        reviewerName: "David Lead",
                        employeeId: "EM001",
                        removedRemediatedItem: "Buffer Retention Limit Exceeded (Threshold: 90 Days)",
                        previousValue: "30 Days Retention",
                        updatedValue: "90 Days Extended Audit Buffer",
                        reason: "System parameter adjusted via Change Ticket CHG-88410. Verified by Security Lead.",
                        reviewComment: "Remediation verified against SAP NWA audit log buffer. Approved & Closed."
                    },
                    {
                        ticketId: "TCK-98410",
                        reportId: "REP-092",
                        controlId: "SEC14",
                        reportName: "HANA Privileged Account Authorization Audit",
                        system: "HDB-20 (HANA)",
                        decision: "Rejected",
                        reviewedDate: "02-Aug-2026",
                        complianceStatus: "Non-Compliant",
                        complianceState: "Error",
                        remediationStatus: "Action Required",
                        remediationState: "Error",
                        ticketStatus: "Action Required",
                        ticketStatusState: "Error",
                        reviewerName: "David Lead",
                        employeeId: "EM001",
                        removedRemediatedItem: "Unapproved SYSTEM User Elevated Privilege Assignment",
                        previousValue: "DBA_ADMIN Role Granted",
                        updatedValue: "Role Revoked / Pending Re-authorization",
                        reason: "Elevated role granted without emergency change authorization reference.",
                        reviewComment: "Rejected final sign-off. Dispatched correction request to Reviewer 2."
                    }
                ],
                selectedReport: null,
                selectedHistoryItem: null
            };

            oData.selectedReport = oData.reports[0];
            oData.selectedHistoryItem = oData.history[0];
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "escManagerModel");
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("escManagerToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
            }
        },

        onProfileNav: function () {
            UIComponent.getRouterFor(this).navTo("EscalationManagerProfile");
        },

        // SLIDE NAVIGATION HANDLERS
        onSelectTabQueue: function () {
            var oVboxQueue = this.byId("vboxEscalationQueue");
            var oVboxHistory = this.byId("vboxEscalationHistory");
            var oSideNav = this.byId("escSideNavigation");

            if (oVboxQueue) { oVboxQueue.setVisible(true); }
            if (oVboxHistory) { oVboxHistory.setVisible(false); }
            if (oSideNav) { oSideNav.setSelectedKey("Queue"); }
        },

        onSelectTabHistory: function () {
            var oVboxQueue = this.byId("vboxEscalationQueue");
            var oVboxHistory = this.byId("vboxEscalationHistory");
            var oSideNav = this.byId("escSideNavigation");

            if (oVboxQueue) { oVboxQueue.setVisible(false); }
            if (oVboxHistory) { oVboxHistory.setVisible(true); }
            if (oSideNav) { oSideNav.setSelectedKey("History"); }
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

        onSelectionChange: function (oEvent) {
            var aItems = oEvent.getSource().getSelectedItems();
            if (aItems.length > 0) {
                var oContext = aItems[0].getBindingContext("escManagerModel");
                if (oContext) {
                    this.getView().getModel("escManagerModel").setProperty("/selectedReport", oContext.getObject());
                }
            }
            MessageToast.show(aItems.length + " final report(s) selected");
        },

        // QUICK ACTIONS
        onViewReport: function () {
            var oReport = this._getSelectedReport();
            this.getView().getModel("escManagerModel").setProperty("/selectedReport", oReport);
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

        onApprove: function () {
            var oReport = this._getSelectedReport();
            oReport.workflowStatus = "Approved & Closed";
            oReport.workflowState = "Success";

            var oModel = this.getView().getModel("escManagerModel");
            var aHistory = oModel.getProperty("/history") || [];
            aHistory.unshift({
                ticketId: "TCK-" + Math.floor(10000 + Math.random() * 90000),
                reportId: oReport.reportId,
                controlId: oReport.controlId,
                reportName: oReport.reportName,
                system: oReport.system,
                decision: "Approved",
                reviewedDate: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
                complianceStatus: oReport.complianceStatus || "Compliant",
                complianceState: "Success",
                remediationStatus: "Remediated & Verified",
                remediationState: "Success",
                ticketStatus: "Closed",
                ticketStatusState: "Success",
                reviewerName: "David Lead",
                employeeId: "EM001",
                removedRemediatedItem: "Security Discrepancy Verified & Cleared",
                previousValue: "Non-Compliant / Pending Signoff",
                updatedValue: "Fully Compliant / Closed",
                reason: "Security Team Lead final audit review completed successfully.",
                reviewComment: "Final audit report approved by Escalation Manager."
            });
            oModel.setProperty("/history", aHistory);

            var iHistApproved = oModel.getProperty("/historyKpis/approved") || 0;
            oModel.setProperty("/historyKpis/approved", iHistApproved + 1);

            oModel.refresh(true);
            MessageToast.show("Final Audit Report " + oReport.reportId + " Approved successfully.");
        },

        onReject: function () {
            var oDialog = this.byId("rejectDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSubmitReject: function () {
            var sReason = this.byId("inputRejectReasonArea") ? this.byId("inputRejectReasonArea").getValue() : "";
            if (!sReason || sReason.trim() === "") {
                MessageBox.error("Please enter a reason for rejection.");
                return;
            }

            var oReport = this._getSelectedReport();
            oReport.workflowStatus = "Rejected";
            oReport.workflowState = "Error";

            var oModel = this.getView().getModel("escManagerModel");
            var aHistory = oModel.getProperty("/history") || [];
            aHistory.unshift({
                ticketId: "TCK-" + Math.floor(10000 + Math.random() * 90000),
                reportId: oReport.reportId,
                controlId: oReport.controlId,
                reportName: oReport.reportName,
                system: oReport.system,
                decision: "Rejected",
                reviewedDate: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
                complianceStatus: "Non-Compliant",
                complianceState: "Error",
                remediationStatus: "Action Required",
                remediationState: "Error",
                ticketStatus: "Action Required",
                ticketStatusState: "Error",
                reviewerName: "David Lead",
                employeeId: "EM001",
                removedRemediatedItem: "Final Audit Sign-off Rejection",
                previousValue: "Pending Final Approval",
                updatedValue: "Rejected",
                reason: sReason,
                reviewComment: "Escalation Manager rejection: " + sReason
            });
            oModel.setProperty("/history", aHistory);

            var iHistRejected = oModel.getProperty("/historyKpis/rejected") || 0;
            oModel.setProperty("/historyKpis/rejected", iHistRejected + 1);

            oModel.refresh(true);
            MessageToast.show("Final Audit Report " + oReport.reportId + " Rejected.");
            this.onCloseRejectDialog();
        },

        onCloseRejectDialog: function () {
            var oDialog = this.byId("rejectDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onRequestCorrection: function () {
            var oDialog = this.byId("requestCorrectionDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onSubmitRequestCorrection: function () {
            var sNotes = this.byId("inputCorrectionNotesArea") ? this.byId("inputCorrectionNotesArea").getValue() : "";
            var sTarget = this.byId("selectTargetReviewer") ? this.byId("selectTargetReviewer").getSelectedKey() : "REV1";

            if (!sNotes || sNotes.trim() === "") {
                MessageBox.error("Please enter correction instructions.");
                return;
            }

            var oReport = this._getSelectedReport();
            oReport.workflowStatus = "Correction Requested";
            oReport.workflowState = "Warning";

            var oModel = this.getView().getModel("escManagerModel");
            var aHistory = oModel.getProperty("/history") || [];
            aHistory.unshift({
                ticketId: "TCK-" + Math.floor(10000 + Math.random() * 90000),
                reportId: oReport.reportId,
                controlId: oReport.controlId,
                reportName: oReport.reportName,
                system: oReport.system,
                decision: "Correction Requested",
                reviewedDate: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
                complianceStatus: "Pending Correction",
                complianceState: "Warning",
                remediationStatus: "Correction Sent (" + sTarget + ")",
                remediationState: "Warning",
                ticketStatus: "In Review",
                ticketStatusState: "Warning",
                reviewerName: "David Lead",
                employeeId: "EM001",
                removedRemediatedItem: "Correction Request Dispatched",
                previousValue: "Pending Approval",
                updatedValue: "Revision Requested (" + sTarget + ")",
                reason: sNotes,
                reviewComment: "Dispatched to " + sTarget + ": " + sNotes
            });
            oModel.setProperty("/history", aHistory);
            oModel.refresh(true);

            MessageToast.show("Correction request dispatched to " + sTarget + " for " + oReport.reportId);
            this.onCloseRequestCorrectionDialog();
        },

        onCloseRequestCorrectionDialog: function () {
            var oDialog = this.byId("requestCorrectionDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onExportFinalReport: function () {
            var oReport = this._getSelectedReport();
            MessageToast.show("Exporting Final Audit Report PDF & Package for " + oReport.reportId);
        },

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
            oReport.remediationStatus = "Verified & Closed";

            var oModel = this.getView().getModel("escManagerModel");
            oModel.refresh(true);
            MessageToast.show("Audit Workflow Closed & Certificate Generated for " + oReport.reportId);
            this.onCloseCloseAuditDialog();
        },

        onCloseCloseAuditDialog: function () {
            var oDialog = this.byId("closeAuditDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        _parseDateString: function (vDate) {
            if (!vDate) { return null; }
            if (vDate instanceof Date) { return vDate; }
            var s = String(vDate).trim();
            if (!s) { return null; }

            // Handle dd/MM/yyyy or dd.MM.yyyy (e.g. 02/08/2026)
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

            // Handle "04-Aug-2026" or "04 Aug 2026"
            var sNormalized = s.replace(/-/g, " ");
            var dParsed = new Date(sNormalized);
            if (!isNaN(dParsed.getTime())) {
                return dParsed;
            }

            // Fallback native parsing
            var dFallback = new Date(s);
            if (!isNaN(dFallback.getTime())) {
                return dFallback;
            }

            return null;
        },

        // HISTORY SEARCH & DIALOG HANDLERS
        onSearchHistory: function () {
            var that = this;
            var sSearchText = this.byId("searchHistoryEsc") ? this.byId("searchHistoryEsc").getValue() : "";
            var sControlId = this.byId("inputHistoryControlIdEsc") ? this.byId("inputHistoryControlIdEsc").getValue() : "";
            var sSystem = this.byId("selectHistorySystemEsc") ? this.byId("selectHistorySystemEsc").getSelectedKey() : "All";
            var sDecision = this.byId("selectHistoryDecisionEsc") ? this.byId("selectHistoryDecisionEsc").getSelectedKey() : "All";
            var sStatus = this.byId("selectHistoryStatusEsc") ? this.byId("selectHistoryStatusEsc").getSelectedKey() : "All";

            var oStartDatePicker = this.byId("dpHistoryStartDateEsc");
            var oEndDatePicker = this.byId("dpHistoryEndDateEsc");

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

            var oTable = this.byId("reviewerHistoryTableEsc");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },

        onResetHistoryFilters: function () {
            if (this.byId("searchHistoryEsc")) { this.byId("searchHistoryEsc").setValue(""); }
            if (this.byId("inputHistoryControlIdEsc")) { this.byId("inputHistoryControlIdEsc").setValue(""); }
            if (this.byId("selectHistorySystemEsc")) { this.byId("selectHistorySystemEsc").setSelectedKey("All"); }
            if (this.byId("selectHistoryDecisionEsc")) { this.byId("selectHistoryDecisionEsc").setSelectedKey("All"); }
            if (this.byId("selectHistoryStatusEsc")) { this.byId("selectHistoryStatusEsc").setSelectedKey("All"); }
            if (this.byId("dpHistoryStartDateEsc")) { this.byId("dpHistoryStartDateEsc").reset(); }
            if (this.byId("dpHistoryEndDateEsc")) { this.byId("dpHistoryEndDateEsc").reset(); }
            this.onSearchHistory();
            MessageToast.show("Reviewer History Filters Reset.");
        },

        onViewHistoryDetails: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("escManagerModel");
            if (oContext) {
                var oHistoryItem = oContext.getObject();
                this.getView().getModel("escManagerModel").setProperty("/selectedHistoryItem", oHistoryItem);
                var oDialog = this.byId("viewHistoryDetailsDialogEsc");
                if (oDialog) {
                    oDialog.open();
                }
            }
        },

        onCloseHistoryDetailsDialog: function () {
            var oDialog = this.byId("viewHistoryDetailsDialogEsc");
            if (oDialog) {
                oDialog.close();
            }
        },

        // SEARCH & FILTER HANDLERS (ESCALATION QUEUE LIVE FILTER)
        onSearchReports: function () {
            var sSearchText = this.byId("searchEscalation") ? this.byId("searchEscalation").getValue() : "";
            var sReportId = this.byId("inputReportIdFilterEsc") ? this.byId("inputReportIdFilterEsc").getValue() : "";
            var sSystem = this.byId("selectSystemFilterEsc") ? this.byId("selectSystemFilterEsc").getSelectedKey() : "All";
            var sStatus = this.byId("selectStatusFilterEsc") ? this.byId("selectStatusFilterEsc").getSelectedKey() : "All";

            var aFilters = [];

            if (sSearchText && sSearchText.trim() !== "") {
                var aSubFilters = [
                    new Filter("reportId", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("reportName", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("controlId", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("reviewer1Comments", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("reviewer2Comments", FilterOperator.Contains, sSearchText.trim())
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
                aFilters.push(new Filter("workflowStatus", FilterOperator.Contains, sStatus));
            }

            var oTable = this.byId("escalationTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },

        onResetFilters: function () {
            if (this.byId("searchEscalation")) { this.byId("searchEscalation").setValue(""); }
            if (this.byId("inputReportIdFilterEsc")) { this.byId("inputReportIdFilterEsc").setValue(""); }
            if (this.byId("selectSystemFilterEsc")) { this.byId("selectSystemFilterEsc").setSelectedKey("All"); }
            if (this.byId("selectStatusFilterEsc")) { this.byId("selectStatusFilterEsc").setSelectedKey("All"); }
            this.onSearchReports();
            MessageToast.show("Escalation Manager Filters Reset.");
        },

        onFilterSystem: function () {
            this.onSearchReports();
        },

        onFilterStatus: function () {
            this.onSearchReports();
        },

        onProfilePress: function (oEvent) {
            var oButton = oEvent.getSource();
            var oPopover = this.byId("escProfilePopover");
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
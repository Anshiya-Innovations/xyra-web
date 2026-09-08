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

    // Per SOP-8865 6.3.1/6.7: the deviation approval chain is exactly 2 levels
    // (Control Exception Reviewer / "Reviewer1", then Manager Exception
    // Reviewer / "Reviewer2" - final). There is no third approval gate, so
    // this page is NOT a decision queue - it's the oversight/monitoring view
    // the SOP describes ("review process actively monitored... weekly report
    // summarizing any pending deviations" - 6.7), read-only over both levels'
    // real queues and history. The Escalation Manager persona itself still
    // exists (its own login role, own access to Reports/Audit Logs/Access
    // Management like every other persona) - only the fake 3rd approval tier
    // that used to live on this page is gone.
    return Controller.extend("xyraweb.controller.EscalationManager", {

        onInit: function () {
            this._loadEscalationManagerData();
        },

        _getFallbackReports: function () {
            return [{
                reportId: "REP-101",
                reportName: "Java Security Parameter Check",
                controlId: "PAR01",
                system: "PRD-100 (Java)",
                reviewer1Comments: "Reviewer 1 verified param login/fails_to_user_lock set to 3.",
                reviewer2Comments: "",
                evidence: "N/A",
                complianceStatus: "Pending Review",
                complianceState: "Warning",
                remediationStatus: "Awaiting Decision",
                remediationState: "Warning",
                workflowStatus: "Pending Review",
                workflowState: "Warning",
                managerNotes: ""
            }];
        },

        _getFallbackHistory: function () {
            return [{
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
            }];
        },

        _loadEscalationManagerData: function () {
            var oData = {
                kpi: { pendingApproval: 0, remediationVerified: 0, complianceRate: 0 },
                historyKpis: { approved: 0, rejected: 0, pending: 0 },
                reports: [],
                history: [],
                selectedReport: null,
                selectedHistoryItem: null
            };
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "escManagerModel");

            var that = this;
            Promise.all([
                ReviewClient.listLevel1Queue(), ReviewClient.listLevel2Queue(),
                ReviewClient.listLevel1History(), ReviewClient.listLevel2History()
            ]).then(function (aResults) {
                var aPending = aResults[0].concat(aResults[1]);
                // Level 1 "Approved" entries are mid-flight (forwarded to
                // Level 2, already counted in the pending queue above), not a
                // closed outcome - only Level 1 rejections are terminal.
                // Every Level 2 history entry is terminal either way (final
                // approval or a remediation ticket - SOP 6.3.1.9).
                var aHistory = aResults[2].filter(function (h) { return h.decision === "Rejected"; }).concat(aResults[3]);
                aHistory.sort(function (a, b) { return new Date(b.reviewedDate) - new Date(a.reviewedDate); });

                var aReports = aPending.length ? aPending : that._getFallbackReports();
                var aHist = aHistory.length ? aHistory : that._getFallbackHistory();

                var iApproved = aHist.filter(function (h) { return h.decision === "Approved"; }).length;
                var iRejected = aHist.filter(function (h) { return h.decision === "Rejected"; }).length;
                var iTotal = aHist.length;

                oModel.setProperty("/reports", aReports);
                oModel.setProperty("/history", aHist);
                oModel.setProperty("/kpi", {
                    pendingApproval: aReports.length,
                    remediationVerified: iApproved,
                    complianceRate: iTotal ? Math.round((iApproved / iTotal) * 1000) / 10 : 100
                });
                oModel.setProperty("/historyKpis", { approved: iApproved, rejected: iRejected, pending: aReports.length });
                oModel.setProperty("/selectedReport", aReports[0] || null);
                oModel.setProperty("/selectedHistoryItem", aHist[0] || null);
            });
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
            MessageToast.show(aItems.length + " report(s) selected");
        },

        // READ-ONLY QUICK ACTIONS
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

        onExportFinalReport: function () {
            var oReport = this._getSelectedReport();
            MessageToast.show("Exporting Deviation Monitoring Report for " + oReport.reportId);
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

        // SEARCH & FILTER HANDLERS (PENDING DEVIATIONS LIVE FILTER)
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
            MessageToast.show("Filters Reset.");
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

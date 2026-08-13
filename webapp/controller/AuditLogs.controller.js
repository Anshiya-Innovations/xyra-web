sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "xyraweb/model/sidebarState",
    "xyraweb/model/auditLogService",
    "xyraweb/model/session"
], function (
    Controller,
    UIComponent,
    MessageToast,
    MessageBox,
    SidebarState,
    AuditLogService,
    Session
) {
    "use strict";

    return Controller.extend("xyraweb.controller.AuditLogs", {

        onInit: function () {
            var oAuditModel = AuditLogService.getModel();
            this.getView().setModel(oAuditModel, "auditLogsModel");

            this._checkAdminAuthorization();

            var oRouter = UIComponent.getRouterFor(this) || (this.getOwnerComponent() && this.getOwnerComponent().getRouter());
            if (oRouter && oRouter.getRoute("AuditLogs")) {
                oRouter.getRoute("AuditLogs").attachPatternMatched(this._checkAdminAuthorization, this);
            }
        },

        onAfterRendering: function () {
            var oToolPage = this.byId("auditLogsToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(SidebarState.get());
            }
        },

        _checkAdminAuthorization: function () {
            var oSession = Session ? Session.get() : null;
            var sUserRole = (oSession && oSession.role) ? oSession.role : (localStorage.getItem("userRole") || "ADMIN");
            var sUpperRole = String(sUserRole).toUpperCase();

            // Default to true for Admin UI unless an explicitly non-admin role is logged in
            var bIsAdmin = true;
            if (sUpperRole === "REVIEWER" || sUpperRole === "REV1" || sUpperRole === "REV2" || sUpperRole === "AUDITOR" || sUpperRole === "ESCALATION_MANAGER" || sUpperRole === "USER") {
                bIsAdmin = false;
            }

            var oModel = this.getView().getModel("auditLogsModel");
            if (oModel) {
                oModel.setProperty("/isAdmin", bIsAdmin);
            }
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("auditLogsToolPage");
            if (oToolPage) {
                var bExpanded = !oToolPage.getSideExpanded();
                oToolPage.setSideExpanded(bExpanded);
                SidebarState.save(bExpanded);
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

        onApplyFilters: function () {
            var oModel = this.getView().getModel("auditLogsModel");
            var aAllLogs = oModel.getProperty("/allLogs") || [];

            var sQuery = (oModel.getProperty("/filters/searchQuery") || "").toLowerCase().trim();
            var sAction = oModel.getProperty("/filters/action");
            var sModule = oModel.getProperty("/filters/module");
            var sAdmin = oModel.getProperty("/filters/adminUser");

            var oStartDatePicker = this.byId("filterStartDate");
            var oEndDatePicker = this.byId("filterEndDate");
            var dStart = oStartDatePicker ? oStartDatePicker.getDateValue() : null;
            var dEnd = oEndDatePicker ? oEndDatePicker.getDateValue() : null;

            var aFiltered = aAllLogs.filter(function (oLog) {
                // Search query matching
                if (sQuery) {
                    var sHaystack = (oLog.logId + " " + oLog.adminUser + " " + oLog.action + " " + oLog.module + " " + oLog.objectId + " " + oLog.description).toLowerCase();
                    if (sHaystack.indexOf(sQuery) === -1) {
                        return false;
                    }
                }

                // Action matching
                if (sAction && sAction !== "All" && oLog.action !== sAction) {
                    return false;
                }

                // Module matching
                if (sModule && sModule !== "All" && oLog.module !== sModule) {
                    return false;
                }

                // Admin user matching
                if (sAdmin && sAdmin !== "All" && oLog.adminUser.indexOf(sAdmin) === -1 && sAdmin.indexOf(oLog.adminUser) === -1) {
                    return false;
                }

                // Date range matching
                if (dStart || dEnd) {
                    var dLogDate = new Date(oLog.timestamp);
                    if (isNaN(dLogDate.getTime())) {
                        dLogDate = new Date();
                    }
                    if (dStart && dLogDate < dStart) {
                        return false;
                    }
                    if (dEnd) {
                        var dEndDay = new Date(dEnd.getTime());
                        dEndDay.setHours(23, 59, 59, 999);
                        if (dLogDate > dEndDay) {
                            return false;
                        }
                    }
                }

                return true;
            });

            oModel.setProperty("/logs", aFiltered);
        },

        onResetFilters: function () {
            var oModel = this.getView().getModel("auditLogsModel");
            oModel.setProperty("/filters/searchQuery", "");
            oModel.setProperty("/filters/action", "All");
            oModel.setProperty("/filters/module", "All");
            oModel.setProperty("/filters/adminUser", "All");

            var oStartDatePicker = this.byId("filterStartDate");
            var oEndDatePicker = this.byId("filterEndDate");
            if (oStartDatePicker) { oStartDatePicker.setValue(""); }
            if (oEndDatePicker) { oEndDatePicker.setValue(""); }

            var aAllLogs = oModel.getProperty("/allLogs") || [];
            oModel.setProperty("/logs", aAllLogs.slice());

            MessageToast.show("Audit log filters reset.");
        },

        onRefreshLogs: function () {
            this.onResetFilters();
            MessageToast.show("Admin Audit Logs refreshed.");
        },

        onSelectAuditRecord: function (oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext("auditLogsModel");
            if (oContext) {
                var oLogData = oContext.getObject();
                var oModel = this.getView().getModel("auditLogsModel");
                oModel.setProperty("/selectedLog", oLogData);

                var oDialog = this.byId("auditDetailsDialog");
                if (oDialog) {
                    oDialog.open();
                }
            }
        },

        onOpenAuditDetailsDialog: function (oEvent) {
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext("auditLogsModel");
            if (oContext) {
                var oLogData = oContext.getObject();
                var oModel = this.getView().getModel("auditLogsModel");
                oModel.setProperty("/selectedLog", oLogData);

                var oDialog = this.byId("auditDetailsDialog");
                if (oDialog) {
                    oDialog.open();
                }
            }
        },

        onCloseAuditDetailsDialog: function () {
            var oDialog = this.byId("auditDetailsDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onExportCSV: function () {
            var oModel = this.getView().getModel("auditLogsModel");
            var aLogs = oModel.getProperty("/logs") || [];

            if (aLogs.length === 0) {
                MessageBox.information("No audit log records available to export.");
                return;
            }

            var aCsvRows = [];
            aCsvRows.push(["Log ID", "Timestamp", "Admin User", "Action", "Module", "Object ID", "Description", "Previous Value", "New Value", "Result"].join(","));

            aLogs.forEach(function (oLog) {
                var row = [
                    '"' + (oLog.logId || "") + '"',
                    '"' + (oLog.timestamp || "") + '"',
                    '"' + (oLog.adminUser || "") + '"',
                    '"' + (oLog.action || "") + '"',
                    '"' + (oLog.module || "") + '"',
                    '"' + (oLog.objectId || "") + '"',
                    '"' + (oLog.description || "").replace(/"/g, '""') + '"',
                    '"' + (oLog.previousValue || "").replace(/"/g, '""') + '"',
                    '"' + (oLog.newValue || "").replace(/"/g, '""') + '"',
                    '"' + (oLog.result || "") + '"'
                ];
                aCsvRows.push(row.join(","));
            });

            var sCsvContent = aCsvRows.join("\n");
            var blob = new Blob([sCsvContent], { type: "text/csv;charset=utf-8;" });
            var link = document.createElement("a");
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "XYRA_Admin_Audit_Logs_" + new Date().toISOString().slice(0, 10) + ".csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            MessageToast.show("Audit logs exported to CSV successfully.");
        },

        // Navigation Handlers
        onAdmin: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
        onControlManagement: function () { this.getOwnerComponent().getRouter().navTo("ControlManagement"); },
        onAIInsights: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
        onSOXCompliance: function () { this.getOwnerComponent().getRouter().navTo("SOXCompliance"); },
        onReports: function () { this.getOwnerComponent().getRouter().navTo("Reports"); },
        onAuditLogs: function () { this.getOwnerComponent().getRouter().navTo("AuditLogs"); },
        onConfiguration: function () { this.getOwnerComponent().getRouter().navTo("Configuration"); },
        onAccessManagement: function () { this.getOwnerComponent().getRouter().navTo("AccessManagement"); },
        onRiskAnalytics: function () { MessageToast.show("Navigating to Risk Analytics..."); },
        onSystemHealth: function () { MessageToast.show("Navigating to System Health..."); },
        onProfile: function () { this.getOwnerComponent().getRouter().navTo("Profile"); },
        onNotificationPress: function () { MessageToast.show("No new audit log alerts."); },
        onLogout: function () { this.getOwnerComponent().getRouter().navTo("Login"); }

    });

});

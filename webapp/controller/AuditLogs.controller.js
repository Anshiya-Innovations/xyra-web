sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "xyraweb/model/sidebarState",
    "xyraweb/service/AuditLogClient",
    "xyraweb/model/config",
    "xyraweb/model/session",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationPopover"
], function (
    Controller,
    UIComponent,
    JSONModel,
    MessageToast,
    MessageBox,
    SidebarState,
    AuditLogClient,
    Config,
    Session,
    GlobalLoading,
    NotificationPopover
) {
    "use strict";

    return Controller.extend("xyraweb.controller.AuditLogs", {

        onInit: function () {
            var oAuditModel = new JSONModel({
                logs: [],
                allLogs: [],
                isAdmin: true,
                selectedLog: null,
                filters: {
                    searchQuery: "",
                    action: "All",
                    module: "All",
                    adminUser: "All",
                    systemId: "All",
                    controlId: "All",
                    result: "All",
                    startDate: null,
                    endDate: null
                }
            });
            this.getView().setModel(oAuditModel, "auditLogsModel");
            this.getView().setModel(new JSONModel({ systems: [{ key: "All", text: "All Systems" }], controls: [{ key: "All", text: "All Controls" }], adminUsers: [{ key: "All", text: "All Users" }] }), "auditFilterOptionsModel");

            this._checkAdminAuthorization();
            this._loadFilterOptions();
            this._loadLogs();

            var oRouter = UIComponent.getRouterFor(this) || (this.getOwnerComponent() && this.getOwnerComponent().getRouter());
            if (oRouter && oRouter.getRoute("AuditLogs")) {
                oRouter.getRoute("AuditLogs").attachPatternMatched(this._checkAdminAuthorization, this);
            }
        },

        _getSubdomain: function () {
            var oSession = Session.get();
            return (oSession && oSession.subdomain) || Config.TEST_SUBDOMAIN;
        },

        // Populates the System/Control filter dropdowns from real data - same
        // pattern as DeviationReport.controller.js's own _loadFilterOptions.
        _loadFilterOptions: function () {
            var oModel = this.getView().getModel("auditFilterOptionsModel");
            var sSubdomain = this._getSubdomain();

            fetch(Config.AUTH_BASE_URL + "/api/system-config/listSystems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: sSubdomain })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { throw new Error(oData.message || "listSystems failed"); }
                    oModel.setProperty("/systems", [{ key: "All", text: "All Systems" }].concat(
                        (oData.systems || []).map(function (s) { return { key: s.sysId, text: s.sysId }; })
                    ));
                })
                .catch(function () { /* keep the "All" fallback already in the model */ });

            fetch(Config.AUTH_BASE_URL + "/api/control/listControls", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: sSubdomain })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { throw new Error(oData.message || "listControls failed"); }
                    oModel.setProperty("/controls", [{ key: "All", text: "All Controls" }].concat(
                        (oData.controls || []).map(function (c) { return { key: c.code, text: c.code }; })
                    ));
                })
                .catch(function () { /* keep the "All" fallback already in the model */ });
        },

        _loadLogs: function () {
            var oModel = this.getView().getModel("auditLogsModel");
            GlobalLoading.show("Loading Audit Logs", 0, true, true);
            var that = this;
            return AuditLogClient.listAuditLogs()
                .then(function (aLogs) {
                    oModel.setProperty("/allLogs", aLogs);
                    oModel.setProperty("/logs", aLogs.slice());

                    var aUsers = aLogs.map(function (l) { return l.adminUser; }).filter(function (v, i, a) {
                        return v && a.indexOf(v) === i;
                    });
                    that.getView().getModel("auditFilterOptionsModel").setProperty("/adminUsers",
                        [{ key: "All", text: "All Users" }].concat(aUsers.map(function (u) { return { key: u, text: u }; })));
                })
                .catch(function () {
                    MessageBox.error("Could not reach the server to load audit logs.");
                    oModel.setProperty("/allLogs", []);
                    oModel.setProperty("/logs", []);
                })
                .then(function () {
                    GlobalLoading.hide();
                });
        },

        onAfterRendering: function () {
            var oToolPage = this.byId("auditLogsToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(SidebarState.get());
            }
            var oNav = this.byId("sideNavigation");
            if (oNav) {
                oNav.setSelectedKey("AuditLogs");
                var oList = oNav.getItem();
                if (oList && oList.setSelectedKey) {
                    oList.setSelectedKey("AuditLogs");
                }
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
            var sSystem = oModel.getProperty("/filters/systemId");
            var sControl = oModel.getProperty("/filters/controlId");
            var sResult = oModel.getProperty("/filters/result");

            var oStartDatePicker = this.byId("filterStartingDate");
            var oEndDatePicker = this.byId("filterEndingDate");
            var dStart = oStartDatePicker && oStartDatePicker.getStartDate ? oStartDatePicker.getStartDate() : null;
            var dEnd = oEndDatePicker && oEndDatePicker.getEndDate ? oEndDatePicker.getEndDate() : null;

            if (!dStart && !dEnd) {
                var oDateRangePicker = this.byId("filterDateRange");
                if (oDateRangePicker) {
                    dStart = oDateRangePicker.getStartDate ? oDateRangePicker.getStartDate() : null;
                    dEnd = oDateRangePicker.getEndDate ? oDateRangePicker.getEndDate() : null;
                }
            }

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

                // Admin user matching - adminUser is always a plain email now
                if (sAdmin && sAdmin !== "All" && (oLog.adminUser || "").toLowerCase() !== sAdmin.toLowerCase()) {
                    return false;
                }

                // System matching
                if (sSystem && sSystem !== "All" && oLog.systemId !== sSystem) {
                    return false;
                }

                // Control matching
                if (sControl && sControl !== "All" && oLog.controlId !== sControl) {
                    return false;
                }

                // Result matching
                if (sResult && sResult !== "All" && oLog.result !== sResult) {
                    return false;
                }

                // Date range matching
                if (dStart || dEnd) {
                    var dLogDate = new Date(oLog.timestamp);
                    if (!isNaN(dLogDate.getTime())) {
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
            oModel.setProperty("/filters/systemId", "All");
            oModel.setProperty("/filters/controlId", "All");
            oModel.setProperty("/filters/result", "All");

            if (this.byId("filterStartingDate")) { this.byId("filterStartingDate").reset(); }
            if (this.byId("filterEndingDate")) { this.byId("filterEndingDate").reset(); }
            var oDateRangePicker = this.byId("filterDateRange");
            if (oDateRangePicker) { oDateRangePicker.reset(); }

            var aAllLogs = oModel.getProperty("/allLogs") || [];
            oModel.setProperty("/logs", aAllLogs.slice());

            MessageToast.show("Audit log filters reset.");
        },

        onRefreshLogs: function () {
            var that = this;
            this._loadLogs().then(function () {
                that.onResetFilters();
                MessageToast.show("Admin Audit Logs refreshed.");
            });
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
        onOrganization: function () { this.getOwnerComponent().getRouter().navTo("Organization"); },
        onRiskAnalytics: function () { MessageToast.show("Navigating to Risk Analytics..."); },
        onSystemHealth: function () { MessageToast.show("Navigating to System Health..."); },
        onProfile: function () { this.getOwnerComponent().getRouter().navTo("Profile"); },
        onNotificationPress: function (oEvent) {
            NotificationPopover.toggle(oEvent, this);
        },
        onLogout: function () { GlobalLoading.logout(this); }

    });

});

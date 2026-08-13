sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "xyraweb/model/soxComplianceService",
    "xyraweb/model/sidebarState",
    "xyraweb/model/focusRing"
], function (Controller, JSONModel, MessageToast, UIComponent, Filter, FilterOperator, SOXComplianceService, SidebarState, killFocusRing) {
    "use strict";

    return Controller.extend("xyraweb.controller.SOXCompliance", {

        onInit: function () {
            var oModel = SOXComplianceService.getModel();
            this.getView().setModel(oModel, "soxModel");
        },

        onAfterRendering: function () {
            var oToolPage = this.byId("soxToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(SidebarState.get());
            }
            killFocusRing(this.getView());
        },

        navToRoute: function (sRouteName) {
            var oRouter = UIComponent.getRouterFor(this) || (this.getOwnerComponent() && this.getOwnerComponent().getRouter());
            if (oRouter) {
                oRouter.navTo(sRouteName);
            } else {
                window.location.hash = "#/" + sRouteName;
            }
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("soxToolPage");
            if (oToolPage) {
                var bExpanded = !oToolPage.getSideExpanded();
                oToolPage.setSideExpanded(bExpanded);
                SidebarState.save(bExpanded);
            }
        },

        // PROCESS NAVIGATION HANDLERS
        onSOXControlsNav: function () {
            this.navToRoute("ControlManagement");
        },

        onControlMonitoringNav: function () {
            this.navToRoute("AutomationMonitoring");
        },

        onDeviationsNav: function () {
            this.navToRoute("DeviationReport");
        },

        onExceptionReviewNav: function () {
            this.navToRoute("Reviewer1");
        },

        onEvidenceNav: function () {
            this.navToRoute("AuditLogs");
        },

        onSOXReportsNav: function () {
            this.navToRoute("Reports");
        },

        // VIEW DETAILS MODAL HANDLERS
        onViewDetailsPress: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("soxModel").getObject();
            var oDetailModel = new JSONModel(JSON.parse(JSON.stringify(oItem)));
            this.getView().setModel(oDetailModel, "soxDetailModel");

            var oDialog = this.byId("soxControlDetailsDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onControlIdPress: function (oEvent) {
            this.onViewDetailsPress(oEvent);
        },

        onCloseSoxDetailsDialog: function () {
            var oDialog = this.byId("soxControlDetailsDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onViewExceptionWorkflow: function () {
            var oDialog = this.byId("soxControlDetailsDialog");
            if (oDialog) {
                oDialog.close();
            }
            MessageToast.show("Navigating to Exception Review Workflow...");
            this.navToRoute("Reviewer1");
        },

        // SIDEBAR NAVIGATION HANDLERS
        onSideNavItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            if (oItem) {
                var sKey = oItem.getKey();
                if (sKey) {
                    this.navToRoute(sKey);
                }
            }
        },

        onAdmin: function () { this.navToRoute("Admin"); },
        onControlManagement: function () { this.navToRoute("ControlManagement"); },
        onAIInsights: function () { this.navToRoute("Admin"); },
        onSOXCompliance: function () { this.navToRoute("SOXCompliance"); },
        onReports: function () { this.navToRoute("Reports"); },
        onAuditLogs: function () { this.navToRoute("AuditLogs"); },
        onConfiguration: function () { this.navToRoute("Configuration"); },
        onAccessManagement: function () { this.navToRoute("AccessManagement"); },
        onRiskAnalytics: function () { this.navToRoute("Admin"); },
        onSystemHealth: function () { this.navToRoute("Admin"); },
        onProfile: function () { this.navToRoute("Profile"); },

        // SEARCH & FILTER LOGIC
        onSearchControls: function (oEvent) {
            this._applyTableFilters();
        },

        onStatusFilterChange: function () {
            this._applyTableFilters();
        },

        onSystemFilterChange: function () {
            this._applyTableFilters();
        },

        _applyTableFilters: function () {
            var aFilters = [];

            var sQuery = this.byId("soxControlTable").getParent().getHeaderToolbar().getContent()[2].getValue();
            var sStatusKey = this.byId("soxControlTable").getParent().getHeaderToolbar().getContent()[3].getSelectedKey();
            var sSystemKey = this.byId("soxControlTable").getParent().getHeaderToolbar().getContent()[4].getSelectedKey();

            if (sQuery && sQuery.trim() !== "") {
                var oSearchFilter = new Filter({
                    filters: [
                        new Filter("controlId", FilterOperator.Contains, sQuery),
                        new Filter("description", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                });
                aFilters.push(oSearchFilter);
            }

            if (sStatusKey && sStatusKey !== "All") {
                aFilters.push(new Filter("status", FilterOperator.EQ, sStatusKey));
            }

            if (sSystemKey && sSystemKey !== "All") {
                aFilters.push(new Filter("system", FilterOperator.EQ, sSystemKey));
            }

            var oBinding = this.byId("soxControlTable").getBinding("items");
            if (oBinding) {
                oBinding.filter(aFilters);
            }
        },

        // EXPORT TO CSV
        onExportCSV: function () {
            var oModel = this.getView().getModel("soxModel");
            var aControls = oModel ? oModel.getProperty("/controls") : [];
            if (!aControls || aControls.length === 0) {
                MessageToast.show("No SOX Controls available to export.");
                return;
            }

            var sCsvContent = "data:text/csv;charset=utf-8,";
            sCsvContent += "Control ID,Description,System,Client,Frequency,Status,Deviations,Risk,Last Run\n";

            aControls.forEach(function (c) {
                sCsvContent += '"' + c.controlId + '","' + c.description.replace(/"/g, '""') + '","' + c.system + '","' + c.client + '","' + c.frequency + '","' + c.status + '","' + c.deviationCount + '","' + c.risk + '","' + c.lastRun + '"\n';
            });

            var encodedUri = encodeURI(sCsvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "XYRA_SOX_Control_Monitoring_" + new Date().toISOString().slice(0, 10) + ".csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            MessageToast.show("SOX Controls exported successfully.");
        },

        onRefresh: function () {
            SOXComplianceService.refreshData();
            this._applyTableFilters();
            MessageToast.show("SOX Compliance Data Refreshed");
        },

        onNotificationPress: function () {
            MessageToast.show("SOX Alert: 1 Critical SOD Conflict Pending Sign-off");
        },

        onLogout: function () {
            MessageToast.show("Logged Out Successfully");
            this.navToRoute("Login");
        }

    });
});

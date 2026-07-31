sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("xyraweb.controller.RoleManagement", {

        onInit: function () {
            var oData = {
                roles: [
                    {
                        roleId: "Z_SAP_FIN_FI_POSTING",
                        roleName: "FI Financial Journal Posting Lead",
                        roleType: "Single Role",
                        system: "PRD-100",
                        client: "100",
                        owner: "Sarah Jenkins (Finance Lead)",
                        status: "Active",
                        statusState: "Success",
                        lastModified: "30-Jul-2026"
                    },
                    {
                        roleId: "Z_SAP_BASIS_ADMIN_ALL",
                        roleName: "Basis System Administration Full Access",
                        roleType: "Composite Role",
                        system: "PRD-100",
                        client: "100",
                        owner: "Alex Rivera (Security Admin)",
                        status: "Under Review",
                        statusState: "Warning",
                        lastModified: "28-Jul-2026"
                    },
                    {
                        roleId: "Z_SAP_MM_PURCHASE_MGR",
                        roleName: "Procurement & PO Approval Manager",
                        roleType: "Single Role",
                        system: "PRD-100",
                        client: "100",
                        owner: "David Miller (Procurement Manager)",
                        status: "Active",
                        statusState: "Success",
                        lastModified: "25-Jul-2026"
                    },
                    {
                        roleId: "Z_SAP_HR_PAYROLL_SPEC",
                        roleName: "HR Payroll Processing Specialist",
                        roleType: "Single Role",
                        system: "PRD-100",
                        client: "100",
                        owner: "Emma Watson (Compliance Lead)",
                        status: "Active",
                        statusState: "Success",
                        lastModified: "20-Jul-2026"
                    },
                    {
                        roleId: "Z_SAP_SD_SALES_ORDER",
                        roleName: "Sales Order Management Lead",
                        roleType: "Derived Role",
                        system: "QAS-200",
                        client: "200",
                        owner: "Michael Chang (GRC Officer)",
                        status: "Deprecated",
                        statusState: "Error",
                        lastModified: "15-Jul-2026"
                    }
                ]
            };

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "rolesModel");
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("roleManagementToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
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

        onNavRoleReview: function () {
            this.getOwnerComponent().getRouter().navTo("RoleReview");
        },

        onCreateRole: function () {
            var sId = this.byId("roleIdInput") ? this.byId("roleIdInput").getValue().trim() : "";
            var sName = this.byId("roleNameInput") ? this.byId("roleNameInput").getValue().trim() : "";
            var sOwner = this.byId("roleOwnerInput") ? this.byId("roleOwnerInput").getValue().trim() : "";
            var sType = this.byId("roleTypeSelect") ? this.byId("roleTypeSelect").getSelectedKey() : "Single Role";
            var sSystem = this.byId("roleSystemSelect") ? this.byId("roleSystemSelect").getSelectedKey() : "PRD-100";
            var sClient = this.byId("roleClientInput") ? this.byId("roleClientInput").getValue().trim() : "100";
            var sStatus = this.byId("roleStatusSelect") ? this.byId("roleStatusSelect").getSelectedKey() : "Active";

            if (!sId || !sName || !sOwner) {
                MessageBox.error("Please enter Role ID, Role Name, and Role Owner.");
                return;
            }

            var mStatusState = {
                "Active": "Success",
                "Under Review": "Warning",
                "Deprecated": "Error"
            };

            var oModel = this.getView().getModel("rolesModel");
            var aRoles = oModel.getProperty("/roles") || [];

            aRoles.unshift({
                roleId: sId,
                roleName: sName,
                roleType: sType,
                system: sSystem,
                client: sClient,
                owner: sOwner,
                status: sStatus,
                statusState: mStatusState[sStatus] || "None",
                lastModified: "31-Jul-2026"
            });

            oModel.setProperty("/roles", aRoles);
            MessageToast.show("Role '" + sId + "' created successfully!");
        },

        onSaveRole: function () {
            MessageToast.show("Role configuration saved to SAP system repository.");
        },

        onUpdateRole: function () {
            var sId = this.byId("roleIdInput") ? this.byId("roleIdInput").getValue() : "Z_SAP_FIN_FI_POSTING";
            MessageToast.show("Role '" + sId + "' updated successfully.");
        },

        onDeleteRole: function () {
            var sId = this.byId("roleIdInput") ? this.byId("roleIdInput").getValue() : "";
            MessageBox.confirm("Are you sure you want to delete role '" + sId + "'?", {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        MessageToast.show("Role '" + sId + "' deleted.");
                    }
                }
            });
        },

        onExportRoles: function () {
            MessageToast.show("Exporting SAP Role Directory to Excel...");
        },

        onSearchRoles: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            MessageToast.show("Filtering roles by query: " + sQuery);
        },

        onFilterRoleType: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            MessageToast.show("Role Type filter set to: " + sKey);
        },

        onSortRoles: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            MessageToast.show("Roles sorted by: " + sKey);
        },

        onAdmin: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
        onRoleManagement: function () { this.getOwnerComponent().getRouter().navTo("RoleManagement"); },
        onControlManagement: function () { this.getOwnerComponent().getRouter().navTo("ControlManagement"); },
        onAIInsights: function () { this.getOwnerComponent().getRouter().navTo("AIInsights"); },
        onSOXCompliance: function () { this.getOwnerComponent().getRouter().navTo("SOXCompliance"); },
        onReports: function () { this.getOwnerComponent().getRouter().navTo("Reports"); },
        onAuditLogs: function () { this.getOwnerComponent().getRouter().navTo("AuditLogs"); },
        onConfiguration: function () { this.getOwnerComponent().getRouter().navTo("Configuration"); },
        onAccessManagement: function () { this.getOwnerComponent().getRouter().navTo("AccessManagement"); },
        onRiskAnalytics: function () { this.getOwnerComponent().getRouter().navTo("RiskAnalytics"); },
        onSystemHealth: function () { this.getOwnerComponent().getRouter().navTo("SystemHealth"); },
        onProfile: function () { this.getOwnerComponent().getRouter().navTo("Profile"); },

        onNotificationPress: function () { MessageToast.show("No new notifications."); },
        onLogout: function () {
            MessageToast.show("Logged Out Successfully");
            this.getOwnerComponent().getRouter().navTo("Login");
        }

    });

});

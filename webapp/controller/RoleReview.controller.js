sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "xyraweb/model/sidebarState"
], function (Controller, JSONModel, MessageToast, MessageBox, SidebarState) {
    "use strict";

    return Controller.extend("xyraweb.controller.RoleReview", {

        onAfterRendering: function () {
            var oToolPage = this.byId("roleReviewToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(SidebarState.get());
            }
        },

        onInit: function () {
            var oData = {
                reviews: [
                    {
                        roleId: "Z_SAP_BASIS_ADMIN_ALL",
                        roleName: "Basis System Administration",
                        changedBy: "J. Smith (Basis Admin)",
                        changeDate: "28-Jul-2026 14:22",
                        deviation: "Added S_TABU_DIS with &NC& full table authorization",
                        scsStatus: "NON-COMPLIANT",
                        scsState: "Error",
                        risk: "Critical",
                        riskState: "Error",
                        reviewerStatus: "Pending",
                        reviewerState: "Warning"
                    },
                    {
                        roleId: "Z_SAP_FIN_FI_POSTING",
                        roleName: "FI Financial Journal Posting Lead",
                        changedBy: "M. Davis (Fin Config)",
                        changeDate: "27-Jul-2026 09:15",
                        deviation: "Added T-Code FB08 without SoD matrix approval",
                        scsStatus: "NON-COMPLIANT",
                        scsState: "Error",
                        risk: "High",
                        riskState: "Warning",
                        reviewerStatus: "Pending",
                        reviewerState: "Warning"
                    },
                    {
                        roleId: "Z_SAP_MM_PURCHASE_MGR",
                        roleName: "Procurement & PO Approval",
                        changedBy: "R. Wilson (MM Lead)",
                        changeDate: "25-Jul-2026 16:40",
                        deviation: "Released PO limit increased above SCS threshold",
                        scsStatus: "NON-COMPLIANT",
                        scsState: "Error",
                        risk: "Medium",
                        riskState: "None",
                        reviewerStatus: "Approved",
                        reviewerState: "Success"
                    },
                    {
                        roleId: "Z_SAP_SD_SALES_ORDER",
                        roleName: "Sales Order Management Lead",
                        changedBy: "K. Taylor (SD Admin)",
                        changeDate: "22-Jul-2026 11:05",
                        deviation: "Added critical authorization S_DEVELOP",
                        scsStatus: "NON-COMPLIANT",
                        scsState: "Error",
                        risk: "Critical",
                        riskState: "Error",
                        reviewerStatus: "Pending",
                        reviewerState: "Warning"
                    },
                    {
                        roleId: "Z_SAP_HR_PAYROLL_SPEC",
                        roleName: "HR Payroll Processing Specialist",
                        changedBy: "L. Anderson (HR Tech)",
                        changeDate: "18-Jul-2026 15:30",
                        deviation: "Modified authorization object P_ORGIN",
                        scsStatus: "VALIDATED",
                        scsState: "Success",
                        risk: "Low",
                        riskState: "Success",
                        reviewerStatus: "Approved",
                        reviewerState: "Success"
                    }
                ]
            };

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "reviewModel");
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("roleReviewToolPage");
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

        onApproveItem: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("reviewModel");
            var oModel = this.getView().getModel("reviewModel");
            var sPath = oContext.getPath();

            oModel.setProperty(sPath + "/reviewerStatus", "Approved");
            oModel.setProperty(sPath + "/reviewerState", "Success");
            MessageToast.show("Role change approved for " + oContext.getProperty("roleId"));
        },

        onRejectItem: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("reviewModel");
            var oModel = this.getView().getModel("reviewModel");
            var sPath = oContext.getPath();

            oModel.setProperty(sPath + "/reviewerStatus", "Rejected");
            oModel.setProperty(sPath + "/reviewerState", "Error");
            MessageToast.show("Role change rejected for " + oContext.getProperty("roleId"));
        },

        onApproveSelected: function () {
            var oModel = this.getView().getModel("reviewModel");
            var aReviews = oModel.getProperty("/reviews") || [];

            aReviews.forEach(function (item) {
                if (item.reviewerStatus === "Pending") {
                    item.reviewerStatus = "Approved";
                    item.reviewerState = "Success";
                }
            });

            oModel.setProperty("/reviews", aReviews);
            MessageToast.show("All pending role changes approved.");
        },

        onRejectSelected: function () {
            var oModel = this.getView().getModel("reviewModel");
            var aReviews = oModel.getProperty("/reviews") || [];

            aReviews.forEach(function (item) {
                if (item.reviewerStatus === "Pending") {
                    item.reviewerStatus = "Rejected";
                    item.reviewerState = "Error";
                }
            });

            oModel.setProperty("/reviews", aReviews);
            MessageToast.show("All pending role changes rejected.");
        },

        onRequestInfo: function () {
            MessageToast.show("Information request sent to SAP Basis System Owner.");
        },

        onExportReport: function () {
            MessageToast.show("Exporting Monthly SCS Role Review Compliance Report...");
        },

        onSearchReviews: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            MessageToast.show("Searching review records: " + sQuery);
        },

        onAdmin: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
        onControlManagement: function () { this.getOwnerComponent().getRouter().navTo("ControlManagement"); },
        onAIInsights: function () { this.getOwnerComponent().getRouter().navTo("AIInsights"); },
        onSOXCompliance: function () { this.getOwnerComponent().getRouter().navTo("SOXCompliance"); },
        onReports: function () { this.getOwnerComponent().getRouter().navTo("Reports"); },
        onAuditLogs: function () { this.getOwnerComponent().getRouter().navTo("AuditLogs"); },
        onConfiguration: function () { this.getOwnerComponent().getRouter().navTo("Configuration"); },
        onAccessManagement: function () { this.getOwnerComponent().getRouter().navTo("AccessManagement"); },
        onOrganization: function () { this.getOwnerComponent().getRouter().navTo("Organization"); },
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

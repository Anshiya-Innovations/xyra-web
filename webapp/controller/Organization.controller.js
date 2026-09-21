sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "xyraweb/model/sidebarState",
    "xyraweb/model/focusRing",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationPopover",
    "xyraweb/model/config",
    "xyraweb/model/session"
], function (Controller, MessageToast, MessageBox, UIComponent, JSONModel, SidebarState, killFocusRing, GlobalLoading, NotificationPopover, Config, Session) {
    "use strict";

    function statusStateFor(sStatus) {
        if (sStatus === "Pending Setup") { return "Warning"; }
        if (sStatus === "Under Audit Review") { return "Information"; }
        if (sStatus === "Inactive") { return "Error"; }
        return "Success";
    }

    // Backend OrganizationEntry -> this page's row shape. orgCode is the
    // human-facing "Organization ID" (e.g. ORG-TATA-01); dbId is the real
    // tenant-DB id, needed for getOrganization/updateOrganization and for
    // navigating into OrganizationDetails.
    function toOrgRow(o) {
        return {
            orgId: o.orgCode,
            dbId: o.id,
            companyName: o.name,
            industry: o.industry || "",
            region: o.region || "",
            country: o.country || "",
            primaryContact: o.primaryContact || "",
            email: o.email || "",
            phone: o.phone || "",
            sapSystems: o.systemCount + (o.systemCount === 1 ? " System" : " Systems"),
            status: o.status || "Active",
            statusState: statusStateFor(o.status),
            createdDate: o.createdAt ? new Date(o.createdAt).toISOString().split("T")[0] : ""
        };
    }

    return Controller.extend("xyraweb.controller.Organization", {

        onInit: function () {
            this.getView().setModel(new JSONModel({ organizations: [], allOrganizations: [] }), "orgModel");
            this._loadOrganizations();
        },

        _loadOrganizations: function () {
            var that = this;
            var oOrgModel = this.getView().getModel("orgModel");
            GlobalLoading.show("Loading Organizations", 0, true, true);
            return fetch(Config.AUTH_BASE_URL + "/api/organization/listOrganizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: (Session.get() || {}).subdomain })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { throw new Error(oData.message || "listOrganizations failed"); }
                    var aRows = (oData.organizations || []).map(toOrgRow);
                    oOrgModel.setProperty("/allOrganizations", aRows);
                    oOrgModel.setProperty("/organizations", aRows);
                })
                .catch(function () {
                    MessageToast.show("Could not reach xyra-core. Is it running?", { duration: 4000 });
                })
                .then(function () {
                    GlobalLoading.hide();
                });
        },

        onSearchOrg: function () {
            this._applyFilters();
        },

        onFilterOrg: function () {
            this._applyFilters();
        },

        _applyFilters: function () {
            var oOrgModel = this.getView().getModel("orgModel");
            var aAll = oOrgModel.getProperty("/allOrganizations") || [];

            var sQuery = (this.byId("searchOrgInput").getValue() || "").toLowerCase().trim();
            var sStatus = this.byId("statusFilterSelect").getSelectedKey();
            var sRegion = this.byId("regionFilterSelect").getSelectedKey();

            var aFiltered = aAll.filter(function (org) {
                var bMatchQuery = !sQuery ||
                    org.orgId.toLowerCase().indexOf(sQuery) !== -1 ||
                    org.companyName.toLowerCase().indexOf(sQuery) !== -1 ||
                    org.industry.toLowerCase().indexOf(sQuery) !== -1;

                var bMatchStatus = (sStatus === "All") || (org.status === sStatus);
                var bMatchRegion = (sRegion === "All") || (org.region === sRegion);

                return bMatchQuery && bMatchStatus && bMatchRegion;
            });

            oOrgModel.setProperty("/organizations", aFiltered);
        },

        onOpenAddOrgDialog: function () {
            this.byId("addOrgIdInput").setValue("").setValueState("None");
            this.byId("addCompanyNameInput").setValue("").setValueState("None");
            this.byId("addIndustrySelect").setSelectedKey("Conglomerate & Technology");
            this.byId("addRegionSelect").setSelectedKey("Asia Pacific");
            this.byId("addCountryInput").setValue("").setValueState("None");
            this.byId("addContactInput").setValue("").setValueState("None");
            this.byId("addEmailInput").setValue("").setValueState("None");
            this.byId("addPhoneInput").setValue("").setValueState("None");
            this.byId("addStatusSelect").setSelectedKey("Active");

            this.byId("addOrgDialog").open();
        },

        onCloseAddOrgDialog: function () {
            this.byId("addOrgDialog").close();
        },

        onSubmitAddOrg: function () {
            var sOrgId = (this.byId("addOrgIdInput").getValue() || "").trim();
            var sCompanyName = (this.byId("addCompanyNameInput").getValue() || "").trim();
            var sIndustry = this.byId("addIndustrySelect").getSelectedKey();
            var sRegion = this.byId("addRegionSelect").getSelectedKey();
            var sCountry = (this.byId("addCountryInput").getValue() || "").trim();
            var sContact = (this.byId("addContactInput").getValue() || "").trim();
            var sEmail = (this.byId("addEmailInput").getValue() || "").trim();
            var sPhone = (this.byId("addPhoneInput").getValue() || "").trim();
            var sStatus = this.byId("addStatusSelect").getSelectedKey();

            var bValid = true;

            if (!sOrgId) {
                this.byId("addOrgIdInput").setValueState("Error").setValueStateText("Organization ID is required.");
                bValid = false;
            } else {
                this.byId("addOrgIdInput").setValueState("None");
            }

            if (!sCompanyName) {
                this.byId("addCompanyNameInput").setValueState("Error").setValueStateText("Company Name is required.");
                bValid = false;
            } else {
                this.byId("addCompanyNameInput").setValueState("None");
            }

            if (!sCountry) {
                this.byId("addCountryInput").setValueState("Error").setValueStateText("Country is required.");
                bValid = false;
            } else {
                this.byId("addCountryInput").setValueState("None");
            }

            if (!sContact) {
                this.byId("addContactInput").setValueState("Error").setValueStateText("Primary Contact is required.");
                bValid = false;
            } else {
                this.byId("addContactInput").setValueState("None");
            }

            if (!sEmail || sEmail.indexOf("@") === -1) {
                this.byId("addEmailInput").setValueState("Error").setValueStateText("Valid Email address is required.");
                bValid = false;
            } else {
                this.byId("addEmailInput").setValueState("None");
            }

            if (!bValid) {
                MessageBox.error("Please fill in all mandatory fields correctly before saving.");
                return;
            }

            var that = this;
            var oSession = Session.get();
            var oPayload = {
                subdomain: oSession && oSession.subdomain,
                orgCode: sOrgId,
                name: sCompanyName,
                industry: sIndustry,
                region: sRegion,
                country: sCountry,
                primaryContact: sContact,
                email: sEmail,
                phone: sPhone || "",
                status: sStatus,
                performedBy: oSession && oSession.email,
                performedByRole: oSession && oSession.role
            };

            // ponytail: same fix as Configuration.controller.js's System dialogs -
            // GlobalLoading renders into the main content area, behind this
            // Dialog's own popup layer, so it was invisible. addOrgBusyOverlay
            // is a plain VBox inside the dialog's own popup layer instead.
            var oOverlay = this.byId("addOrgBusyOverlay");
            if (oOverlay) { oOverlay.setVisible(true); }

            fetch(Config.AUTH_BASE_URL + "/api/organization/createOrganization", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(oPayload)
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (oOverlay) { oOverlay.setVisible(false); }
                    if (!oData.success) { MessageBox.error(oData.message || "Could not create organization."); return; }
                    that.onCloseAddOrgDialog();
                    MessageToast.show("Organization '" + sCompanyName + "' created successfully!");
                    that._loadOrganizations();
                })
                .catch(function () {
                    if (oOverlay) { oOverlay.setVisible(false); }
                    MessageBox.error("Could not reach the server. Is xyra-core running?");
                });
        },

        onViewDetails: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("orgModel").getObject();
            this.navToRoute("OrganizationDetails", { orgId: oItem.dbId });
        },

        onDeleteOrganization: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("orgModel").getObject();
            var oSession = Session.get();
            if (!oSession) {
                MessageBox.error("No active session. Please log in again.");
                return;
            }

            var that = this;
            MessageBox.confirm(
                "Are you sure you want to delete Organization '" + oItem.orgId + "' (" + oItem.companyName + ")? " +
                "This permanently deletes its " + oItem.sapSystems + " and everything tied to them - control runs, alerts, reviews and history. This cannot be undone.",
                {
                    title: "Delete Organization",
                    actions: ["Confirm", "Cancel"],
                    emphasizedAction: "Confirm",
                    onClose: function (oAction) {
                        if (oAction !== "Confirm") { return; }

                        GlobalLoading.show("Deleting Organization", 0, true, true);
                        fetch(Config.AUTH_BASE_URL + "/api/organization/deleteOrganization", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ subdomain: oSession.subdomain, id: oItem.dbId, performedBy: oSession.email, performedByRole: oSession.role })
                        })
                            .then(function (r) { return r.json(); })
                            .then(function (oData) {
                                GlobalLoading.hide();
                                if (!oData.success) {
                                    MessageBox.error(oData.message || "Could not delete organization.");
                                    return;
                                }
                                MessageToast.show("Organization '" + oItem.orgId + "' deleted.");
                                that._loadOrganizations();
                            })
                            .catch(function () {
                                GlobalLoading.hide();
                                MessageBox.error("Could not reach the server. Is xyra-core running?");
                            });
                    }
                }
            );
        },

        navToRoute: function (sRouteName, oParams) {
            var oRouter = UIComponent.getRouterFor(this) || (this.getOwnerComponent() && this.getOwnerComponent().getRouter());
            if (oRouter) {
                oRouter.navTo(sRouteName, oParams || {});
            } else {
                window.location.hash = "#/" + sRouteName + (oParams && oParams.orgId ? "/" + oParams.orgId : "");
            }
        },

        onAfterRendering: function () {
            var oToolPage = this.byId("orgToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(SidebarState.get());
            }
            var oNav = this.byId("sideNavigation");
            if (oNav) {
                oNav.setSelectedKey("Organization");
                var oList = oNav.getItem();
                if (oList && oList.setSelectedKey) {
                    oList.setSelectedKey("Organization");
                }
            }
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("orgToolPage");
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
        onOrganization: function () { this.navToRoute("Organization"); },
        onRiskAnalytics: function () { this.navToRoute("Admin"); },
        onProfile: function () { this.navToRoute("Profile"); },
        onNotificationPress: function (oEvent) {
            NotificationPopover.toggle(oEvent, this);
        },
        onLogout: function () {
            GlobalLoading.logout(this);
        }

    });

});

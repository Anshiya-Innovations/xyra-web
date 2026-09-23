sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "xyraweb/model/sidebarState",
    "xyraweb/model/NotificationPopover",
    "xyraweb/model/GlobalLoading",
    "xyraweb/service/DeviationClient",
  ],
  function (
    Controller,
    JSONModel,
    MessageToast,
    SidebarState,
    NotificationPopover,
    GlobalLoading,
    DeviationClient,
  ) {
    "use strict";

    return Controller.extend("xyraweb.controller.RiskAnalytics", {
      onInit: function () {
        this.getView().setModel(
          new JSONModel({
            filters: { domain: "All", severity: "All", status: "All" },
            kpis: { score: 0, critical: 0, open: 0, evidence: 0 },
            domains: [],
            findings: [],
            generatedAt: "",
            loading: true,
            error: "",
          }),
          "riskModel",
        );
        this._loadRiskData();
      },

      _loadRiskData: function () {
        var oModel = this.getView().getModel("riskModel");
        oModel.setProperty("/loading", true);
        oModel.setProperty("/error", "");
        GlobalLoading.show("Loading Risk Analytics", 0, true, true);
        return DeviationClient.queryDeviations({})
          .then(function (oData) {
            var aHeaders = oData.headers || [];
            var mDomains = {};
            aHeaders.forEach(function (h) {
              var sDomain =
                h.controlName || h.controlId || "Unclassified control";
              if (!mDomains[sDomain]) {
                mDomains[sDomain] = {
                  name: sDomain,
                  total: 0,
                  critical: 0,
                  open: 0,
                };
              }
              mDomains[sDomain].total += 1;
              if ((h.severity || "").toLowerCase() === "critical") {
                mDomains[sDomain].critical += 1;
              }
              if ((h.status || "").toLowerCase() !== "resolved") {
                mDomains[sDomain].open += 1;
              }
            });
            var aDomains = Object.keys(mDomains).map(function (sName) {
              var d = mDomains[sName];
              var iScore = Math.max(0, 100 - d.critical * 25 - d.open * 10);
              return {
                name: sName,
                score: iScore,
                risk: iScore < 60 ? "High" : iScore < 80 ? "Medium" : "Low",
                findings: d.total,
              };
            });
            var oKpi = oData.kpi || {};
            var iTotal = oKpi.totalIncidents || aHeaders.length;
            var iOpen =
              oKpi.openItems ||
              aHeaders.filter(function (h) {
                return h.status !== "Resolved";
              }).length;
            var iCritical = aHeaders.filter(function (h) {
              return (h.severity || "").toLowerCase() === "critical";
            }).length;
            var iScore = iTotal
              ? Math.max(
                  0,
                  Math.round(100 - (iCritical * 25 + iOpen * 10) / iTotal),
                )
              : 0;
            var sCompliance = String(oKpi.complianceRate || "0").replace(
              "%",
              "",
            );
            oModel.setProperty("/kpis", {
              score: iScore,
              critical: iCritical,
              open: iOpen,
              evidence: sCompliance,
            });
            oModel.setProperty("/domains", aDomains);
            oModel.setProperty(
              "/findings",
              aHeaders.map(function (h) {
                return {
                  title:
                    h.description ||
                    h.controlDescription ||
                    "Deviation detected",
                  domain:
                    h.controlName || h.controlId || "Unclassified control",
                  severity: h.severity || "Unknown",
                  status: h.status || "Unknown",
                  owner: h.systemId || "Unassigned",
                  due: h.alertDate || "-",
                  source: h.alertId || h.id || "-",
                };
              }),
            );
            oModel.setProperty("/generatedAt", new Date().toISOString());
          })
          .catch(function (oError) {
            oModel.setProperty(
              "/error",
              oError.message || "Risk data could not be loaded.",
            );
            oModel.setProperty("/domains", []);
            oModel.setProperty("/findings", []);
          })
          .then(function () {
            oModel.setProperty("/loading", false);
            GlobalLoading.hide();
          });
      },

      onAfterRendering: function () {
        var oToolPage = this.byId("riskAnalyticsToolPage");
        if (oToolPage) {
          oToolPage.setSideExpanded(SidebarState.get());
        }
        var oNav = this.byId("sideNavigation");
        if (oNav) {
          oNav.setSelectedKey("RiskAnalytics");
          var oList = oNav.getItem();
          if (oList && oList.setSelectedKey) {
            oList.setSelectedKey("RiskAnalytics");
          }
        }
      },

      onSideNavToggle: function () {
        var oToolPage = this.byId("riskAnalyticsToolPage");
        if (oToolPage) {
          var bExpanded = !oToolPage.getSideExpanded();
          oToolPage.setSideExpanded(bExpanded);
          SidebarState.save(bExpanded);
        }
      },

      onSideNavItemSelect: function (oEvent) {
        var oItem = oEvent.getParameter("item");
        if (!oItem) {
          return;
        }
        var sKey = oItem.getKey();
        if (sKey && this[sKey]) {
          this[sKey]();
        }
      },

      onResetFilters: function () {
        this.getView()
          .getModel("riskModel")
          .setProperty("/filters", {
            domain: "All",
            severity: "All",
            status: "All",
          });
        MessageToast.show("Risk filters reset.");
      },

      onRefresh: function () {
        this._loadRiskData().then(function () {
          MessageToast.show("Risk posture refreshed.");
        });
      },

      onNotificationPress: function (oEvent) {
        NotificationPopover.toggle(oEvent, this);
      },
      onLogout: function () {
        GlobalLoading.logout(this);
      },
      onAdmin: function () {
        this.getOwnerComponent().getRouter().navTo("Admin");
      },
      onControlManagement: function () {
        this.getOwnerComponent().getRouter().navTo("ControlManagement");
      },
      onAIInsights: function () {
        MessageToast.show("AI Insights is not available yet.");
      },
      onSOXCompliance: function () {
        this.getOwnerComponent().getRouter().navTo("SOXCompliance");
      },
      onReports: function () {
        this.getOwnerComponent().getRouter().navTo("Reports");
      },
      onAuditLogs: function () {
        this.getOwnerComponent().getRouter().navTo("AuditLogs");
      },
      onConfiguration: function () {
        this.getOwnerComponent().getRouter().navTo("Configuration");
      },
      onAccessManagement: function () {
        this.getOwnerComponent().getRouter().navTo("AccessManagement");
      },
      onOrganization: function () {
        this.getOwnerComponent().getRouter().navTo("Organization");
      },
      onProfile: function () {
        this.getOwnerComponent().getRouter().navTo("Profile");
      },
    });
  },
);

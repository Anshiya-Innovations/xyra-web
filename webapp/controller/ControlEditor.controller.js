sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "xyraweb/model/sidebarState",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationPopover",
    "xyraweb/model/config",
    "xyraweb/model/session",
    "xyraweb/model/mockData",
    "xyraweb/model/controlFrequency",
  ],
  function (
    Controller,
    UIComponent,
    JSONModel,
    MessageToast,
    MessageBox,
    SidebarState,
    GlobalLoading,
    NotificationPopover,
    Config,
    Session,
    MockData,
    ControlFrequency,
  ) {
    "use strict";

    // Validation/operator: UI select label <-> backend ControlRules.operator enum.
    var OPERATOR_UI_TO_BE = {
      Equals: "EQUALS",
      "Not Equals": "NOT_EQUALS",
      Contains: "CONTAINS",
      "Not Contains": "NOT_CONTAINS",
      Exists: "EXISTS",
      "Not Exists": "NOT_EXISTS",
      "Greater Than": "GT",
      "Less Than": "LT",
      "Greater Than or Equal": "GTE",
      "Less Than or Equal": "LTE",
    };
    var OPERATOR_BE_TO_UI = {
      EQUALS: "Equals",
      NOT_EQUALS: "Not Equals",
      CONTAINS: "Contains",
      NOT_CONTAINS: "Not Contains",
      EXISTS: "Exists",
      NOT_EXISTS: "Not Exists",
      GT: "Greater Than",
      LT: "Less Than",
      GTE: "Greater Than or Equal",
      LTE: "Less Than or Equal",
    };

    // Parameter Type: UI select key <-> backend ControlRules.parameterType enum
    // (also byte-identical to xyra-s4's object_parameters.parameter_type).
    var PARAM_TYPE_UI_TO_BE = {
      "SET/GET Parameter": "SETGET",
      "User Default Value": "DEFAULT",
      General: "GENERAL",
      "": "GENERAL",
    };
    var PARAM_TYPE_BE_TO_UI = {
      SETGET: "SET/GET Parameter",
      DEFAULT: "User Default Value",
      GENERAL: "General",
    };

    // The exact preset option lists from the view XML - used to detect whether a
    // resolved backend value matches a known preset (show it selected) or needs
    // the "Custom"/"Other Clients" fallback (see unresolveRule).
    var KNOWN_CLIENTS = ["All", "000", "001", "066", "100", "200", "300"];
    var KNOWN_SETGET = ["BUK", "WRK", "VKO", "VTEG", "SPA", "KOK", "EKO"];
    var KNOWN_USERDEF = [
      "Decimal Notation",
      "Date Format",
      "Time Zone",
      "Logon Language",
      "Spool Output (DEST)",
      "Output Device (PRINTER)",
    ];
    var KNOWN_GENERAL = [
      "Password Changed",
      "User Type",
      "Locked",
      "Failed Logins",
      "Roles Assigned",
      "Security Policy",
      "SDMI_* Exists",
      "Super User",
      "SAP_ALL",
      "S_A.TMSADM",
      "Update Tool",
    ];
    var KNOWN_EXPECTED = [
      "1000",
      "Yes",
      "No",
      "A (Dialog User)",
      "B (System User)",
      "C (Communication User)",
      "S (Service User)",
      "L (Reference User)",
      "G (Guest User)",
      "0",
      "1",
      "Z_NOEXPIRY",
      "SUPER",
      "SWPM (Software Provisioning Manager)",
      "SAPup (System Upgrade)",
      "SAPehpi (Enhancement Package Installer)",
      "STARTUP (Software Update Manager)",
      "SUM (SAP Upgrade Manager)",
      "None",
      "SAP delivered roles",
    ];

    // Save direction: one working rule row (with its preset+custom pairs) -> the
    // single resolved-value-only shape the backend expects.
    function resolveRule(r) {
      return {
        sapObject: (r.sapObject || "").trim(),
        client:
          r.client === "Other Clients"
            ? (r.customClient || "").trim()
            : (r.client || "").trim(),
        parameterType: PARAM_TYPE_UI_TO_BE[r.parameterType] || "GENERAL",
        parameter:
          r.parameter === "Custom"
            ? (r.customParameter || "").trim()
            : (r.parameter || "").trim(),
        operator: OPERATOR_UI_TO_BE[r.operator] || r.operator,
        expectedValue:
          r.parameter !== "Failed Logins" && r.expectedValue === "Custom"
            ? (r.customExpectedValue || "").trim()
            : String(r.expectedValue || "").trim(),
      };
    }

    // Load-for-edit direction: a resolved backend rule -> a working rule row,
    // reverse-detecting "Custom"/"Other Clients" for values that aren't a known
    // preset. Called as aRules.map(unresolveRule, oController) so `this` inside is
    // the controller (for this._getRuleLabel).
    function unresolveRule(rule, index) {
      var out = {
        id: rule.id || Date.now() + index,
        stepLabel: this._getRuleLabel(index),
        sapObject: rule.sapObject,
        operator: OPERATOR_BE_TO_UI[rule.operator] || rule.operator,
        parameterType: PARAM_TYPE_BE_TO_UI[rule.parameterType] || "General",
      };

      out.client =
        KNOWN_CLIENTS.indexOf(rule.client) !== -1
          ? rule.client
          : "Other Clients";
      out.customClient = out.client === "Other Clients" ? rule.client : "";

      var presetList =
        out.parameterType === "SET/GET Parameter"
          ? KNOWN_SETGET
          : out.parameterType === "User Default Value"
            ? KNOWN_USERDEF
            : KNOWN_GENERAL;
      out.parameter =
        presetList.indexOf(rule.parameter) !== -1 ? rule.parameter : "Custom";
      out.customParameter = out.parameter === "Custom" ? rule.parameter : "";
      // mirror into the 3 shadow selects the view actually binds to
      out.parameterSetGet =
        out.parameterType === "SET/GET Parameter" ? out.parameter : "";
      out.parameterUserDef =
        out.parameterType === "User Default Value" ? out.parameter : "";
      out.parameterGeneral =
        out.parameterType !== "SET/GET Parameter" &&
        out.parameterType !== "User Default Value"
          ? out.parameter
          : "";

      if (rule.parameter === "Failed Logins") {
        out.expectedValue = rule.expectedValue;
        out.customExpectedValue = "";
      } else {
        out.expectedValue =
          KNOWN_EXPECTED.indexOf(rule.expectedValue) !== -1
            ? rule.expectedValue
            : "Custom";
        out.customExpectedValue =
          out.expectedValue === "Custom" ? rule.expectedValue : "";
      }
      return out;
    }

    // Dedupe + drop empty/"None" slots from the 3 System Type selects.
    function collectSystemIds(s1, s2, s3) {
      var out = [];
      [s1, s2, s3].forEach(function (id) {
        if (id && id !== "None" && out.indexOf(id) === -1) {
          out.push(id);
        }
      });
      return out;
    }

    return Controller.extend("xyraweb.controller.ControlEditor", {
      onInit: function () {
        this.getView().setModel(
          new JSONModel({ systems: [], systemsWithNone: [], allSystems: [] }),
          "systemsModel",
        );
        this.getView().setModel(
          new JSONModel({ organizations: [] }),
          "organizationsModel",
        );
        this.getView().setModel(
          new JSONModel({ rules: [], draft: {} }),
          "ruleModel",
        );
        this.getView().setModel(
          new JSONModel({
            title: "Create Security Control Master",
            isEdit: false,
          }),
          "editorModel",
        );

        var oRouter = UIComponent.getRouterFor(this);
        oRouter
          .getRoute("ControlEditor")
          .attachPatternMatched(this._onRouteMatched, this);
      },

      onAfterRendering: function () {
        var oToolPage = this.byId("controlEditorToolPage");
        if (oToolPage) {
          oToolPage.setSideExpanded(SidebarState.get());
        }
        // XML selectedKey alone doesn't reliably stick - every other page's
        // controller sets it explicitly after rendering too (see
        // ControlManagement.controller.js), or the SideNavigation falls
        // back to highlighting the wrong (often first-with-a-tag) item.
        var oNav = this.byId("sideNavigation");
        if (oNav) {
          oNav.setSelectedKey("ControlManagement");
          var oList = oNav.getItem();
          if (oList && oList.setSelectedKey) {
            oList.setSelectedKey("ControlManagement");
          }
        }
      },

      _getSubdomain: function () {
        var oSession = Session.get();
        return (oSession && oSession.subdomain) || Config.TEST_SUBDOMAIN;
      },

      _getRuleLabel: function (iIndex) {
        var iNum = iIndex + 1;
        if (iNum === 1) {
          return "Rule 1";
        }
        if (iNum === 2) {
          return "Then another rule: Rule 2";
        }
        return "Then: Rule " + iNum;
      },

      _loadSystems: function () {
        var that = this;
        return Promise.all([
          fetch(Config.AUTH_BASE_URL + "/api/system-config/listSystems", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subdomain: this._getSubdomain() }),
          }).then(function (r) {
            return r.json();
          }),
          fetch(Config.AUTH_BASE_URL + "/api/organization/listOrganizations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subdomain: this._getSubdomain() }),
          }).then(function (r) {
            return r.json();
          }),
        ])
          .then(function (aResults) {
            var oSystemsData = aResults[0],
              oOrgData = aResults[1];
            if (!oSystemsData.success) {
              throw new Error(oSystemsData.message || "listSystems failed");
            }
            that
              .getView()
              .getModel("organizationsModel")
              .setProperty(
                "/organizations",
                (oOrgData.success && oOrgData.organizations) || [],
              );
            that
              .getView()
              .getModel("systemsModel")
              .setProperty("/allSystems", oSystemsData.systems || []);
          })
          .catch(function () {
            MockData.notice(MessageToast);
            that
              .getView()
              .getModel("systemsModel")
              .setProperty(
                "/allSystems",
                (MockData.systems || []).map(function (s) {
                  return { id: s.id, sysId: s.sysId };
                }),
              );
          });
      },

      // Control creation is scoped to one Organization at a time - picking
      // an Organization narrows the 3 System Type selects down to just
      // that org's Systems (Tenant -> many Organizations -> each org's own
      // Systems). No Organization selected yet = nothing selectable, same
      // "narrow before you pick" flow the org selector implies.
      _filterSystemsByOrg: function (sOrgId) {
        var aAll =
          this.getView().getModel("systemsModel").getProperty("/allSystems") ||
          [];
        var aFiltered = sOrgId
          ? aAll.filter(function (s) {
              return s.organizationId === sOrgId;
            })
          : [];
        var oSystemsModel = this.getView().getModel("systemsModel");
        oSystemsModel.setProperty("/systems", aFiltered);
        oSystemsModel.setProperty(
          "/systemsWithNone",
          [{ id: "None", sysId: "-- None --" }].concat(aFiltered),
        );
      },

      onOrganizationChange: function (oEvent) {
        this._filterSystemsByOrg(oEvent.getParameter("selectedItem").getKey());
        // Previously-picked systems belonged to the old org - clear them
        // rather than silently leaving a stale, now-invisible selection.
        if (this.byId("sysType1Select")) {
          this.byId("sysType1Select").setSelectedKey("");
        }
        if (this.byId("sysType2Select")) {
          this.byId("sysType2Select").setSelectedKey("None");
        }
        if (this.byId("sysType3Select")) {
          this.byId("sysType3Select").setSelectedKey("None");
        }
      },

      // One continuous busy period covering the systems-list fetch AND
      // the control-detail fetch that follows it - previously used
      // sap.ui.core.BusyIndicator here, but GlobalLoading.js patches
      // BusyIndicator.show into a complete no-op app-wide ("Suppress
      // native 3-dot overlay") - it was never visible, on this page or any
      // other. GlobalLoading's own overlay is the only one that actually
      // renders anything, and it doesn't require the route to be in its
      // Component.js allowlist when called directly like this.
      //
      // Edit mode only: there's an actual Security Control record being
      // fetched, worth the overlay. Create mode has nothing to "load" -
      // the systems-list fetch behind it is just populating dropdowns on
      // an otherwise-blank form, not worth a full-page overlay for.
      _onRouteMatched: function (oEvent) {
        var sControlId = oEvent.getParameter("arguments").controlId;
        if (sControlId) {
          GlobalLoading.show("Loading Security Control", 0, true, true);
        }
        this._loadSystems()
          .then(
            function () {
              return sControlId
                ? this._enterEditMode(sControlId)
                : this._enterCreateMode();
            }.bind(this),
          )
          .then(function () {
            if (sControlId) {
              GlobalLoading.hide();
            }
          });
      },

      // ponytail: sap.m.Select defaults to forceSelection=true - setting
      // selectedKey to "" once items exist gets silently corrected back to
      // the first item, but that correction doesn't fire "change" (only a
      // real user pick does), so onOrganizationChange never ran and the
      // System Type selects stayed empty even though Organization visibly
      // showed one selected. Pick the same default ourselves and filter
      // against it directly, instead of trusting a blank selectedKey to
      // stick.
      _resetForm: function () {
        var aOrgs =
          this.getView()
            .getModel("organizationsModel")
            .getProperty("/organizations") || [];
        var sDefaultOrgId = aOrgs.length ? aOrgs[0].id : "";
        if (this.byId("organizationSelect")) {
          this.byId("organizationSelect").setSelectedKey(sDefaultOrgId);
        }
        this._filterSystemsByOrg(sDefaultOrgId);
        if (this.byId("controlIdInput")) {
          this.byId("controlIdInput").setValue("");
        }
        if (this.byId("controlDescInput")) {
          this.byId("controlDescInput").setValue("");
        }
        if (this.byId("sysType1Select")) {
          this.byId("sysType1Select").setSelectedKey("");
        }
        if (this.byId("sysType2Select")) {
          this.byId("sysType2Select").setSelectedKey("None");
        }
        if (this.byId("sysType3Select")) {
          this.byId("sysType3Select").setSelectedKey("None");
        }
        if (this.byId("frequencySelect")) {
          this.byId("frequencySelect").setSelectedKey("Daily");
        }
        if (this.byId("controlTypeSelect")) {
          this.byId("controlTypeSelect").setSelectedKey("SECURITY");
        }
        if (this.byId("cronInput")) {
          this.byId("cronInput").setValue("");
        }
        if (this.byId("vboxCron")) {
          this.byId("vboxCron").setVisible(false);
        }
        if (this.byId("totalRunInput")) {
          this.byId("totalRunInput").setValue("365");
        }
        this.getView().getModel("ruleModel").setProperty("/rules", []);
        this._resetRuleDraft();
      },

      _enterCreateMode: function () {
        this._mode = "create";
        this._editingControl = null;
        this.getView()
          .getModel("editorModel")
          .setData({ title: "Create Security Control Master", isEdit: false });
        this._resetForm();
      },

      // Returns its promise (doesn't manage the busy indicator itself) -
      // _onRouteMatched owns one continuous busy period covering this and
      // the systems-list fetch before it.
      _enterEditMode: function (sDbId) {
        this._mode = "edit";
        this.getView().getModel("editorModel").setProperty("/isEdit", true);

        return fetch(Config.AUTH_BASE_URL + "/api/control/getControl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subdomain: this._getSubdomain(), id: sDbId }),
        })
          .then(function (r) {
            return r.json();
          })
          .then(
            function (oData) {
              if (!oData.success || !oData.control) {
                MessageBox.error(
                  oData.message || "Could not load this control.",
                );
                UIComponent.getRouterFor(this).navTo("ControlManagement");
                return;
              }
              this._applyControlToForm(oData.control);
            }.bind(this),
          )
          .catch(
            function () {
              MessageBox.error(
                "Could not reach the server. Is xyra-core running?",
              );
              UIComponent.getRouterFor(this).navTo("ControlManagement");
            }.bind(this),
          );
      },

      _applyControlToForm: function (oControl) {
        this._editingControl = oControl;
        this.getView()
          .getModel("editorModel")
          .setProperty(
            "/title",
            "Edit Security Control Master: " + oControl.code,
          );

        if (this.byId("controlIdInput")) {
          this.byId("controlIdInput").setValue(oControl.code);
        }
        if (this.byId("controlDescInput")) {
          this.byId("controlDescInput").setValue(oControl.description);
        }

        var aIds = (oControl.systemIds || []).slice();
        if (aIds.length > 3) {
          aIds = aIds.slice(0, 3);
        }

        // A Control's systems all belong to one Organization (that's the
        // whole point of the org picker narrowing the System selects) -
        // infer it from whichever system this control already has, then
        // filter before setting the selected keys so those keys exist in
        // the (now-filtered) items list.
        var aAllSystems =
          this.getView().getModel("systemsModel").getProperty("/allSystems") ||
          [];
        var oPrimarySystem = aAllSystems.filter(function (s) {
          return s.id === aIds[0];
        })[0];
        var sOrgId = (oPrimarySystem && oPrimarySystem.organizationId) || "";
        if (this.byId("organizationSelect")) {
          this.byId("organizationSelect").setSelectedKey(sOrgId);
        }
        this._filterSystemsByOrg(sOrgId);

        if (this.byId("sysType1Select")) {
          this.byId("sysType1Select").setSelectedKey(aIds[0] || "");
        }
        if (this.byId("sysType2Select")) {
          this.byId("sysType2Select").setSelectedKey(aIds[1] || "None");
        }
        if (this.byId("sysType3Select")) {
          this.byId("sysType3Select").setSelectedKey(aIds[2] || "None");
        }

        var sFreqUi =
          ControlFrequency.FREQ_BE_TO_UI[oControl.frequency] || "Daily";
        if (this.byId("frequencySelect")) {
          this.byId("frequencySelect").setSelectedKey(sFreqUi);
        }
        if (this.byId("controlTypeSelect")) {
          this.byId("controlTypeSelect").setSelectedKey(
            oControl.controlType || "SECURITY",
          );
        }
        if (this.byId("cronInput")) {
          this.byId("cronInput").setValue(oControl.cronExpression || "");
        }
        if (this.byId("vboxCron")) {
          this.byId("vboxCron").setVisible(sFreqUi === "Cron Expression");
        }
        if (this.byId("totalRunInput")) {
          this.byId("totalRunInput").setValue(
            ControlFrequency.calculateTotalRun(
              sFreqUi,
              oControl.cronExpression,
            ),
          );
        }

        var aRules =
          oControl.rules && oControl.rules.length
            ? oControl.rules.map(unresolveRule, this)
            : [];
        this.getView().getModel("ruleModel").setProperty("/rules", aRules);
        this._resetRuleDraft();
      },

      _resetRuleDraft: function () {
        this.getView().getModel("ruleModel").setProperty("/draft", {
          id: Date.now(),
          sapObject: "",
          client: "",
          customClient: "",
          parameterType: "",
          parameter: "",
          parameterSetGet: "",
          parameterUserDef: "",
          parameterGeneral: "",
          customParameter: "",
          operator: "",
          expectedValue: "",
          customExpectedValue: "",
        });
      },

      _getRuleDialog: function () {
        return this.byId("ruleDialog");
      },

      _openRuleDialog: function () {
        this._resetRuleDraft();
        var oDialog = this._getRuleDialog();
        if (oDialog) {
          oDialog.open();
        }
      },

      onParameterSelectChange: function (oEvent) {
        var oSelect = oEvent.getSource();
        var sKey = oSelect.getSelectedKey();
        var oContext = oSelect.getBindingContext("ruleModel");
        if (oContext) {
          var oRuleModel = this.getView().getModel("ruleModel");
          var sPath = oContext.getPath();
          oRuleModel.setProperty(sPath + "/parameter", sKey);
          if (sKey !== "Custom") {
            oRuleModel.setProperty(sPath + "/customParameter", "");
          }
        }
      },

      onDraftParameterSelectChange: function (oEvent) {
        var oModel = this.getView().getModel("ruleModel");
        var sKey = oEvent.getSource().getSelectedKey();
        oModel.setProperty("/draft/parameter", sKey);
        if (sKey !== "Custom") {
          oModel.setProperty("/draft/customParameter", "");
        }
      },

      onDraftParameterTypeChange: function (oEvent) {
        var oModel = this.getView().getModel("ruleModel");
        oModel.setProperty(
          "/draft/parameterType",
          oEvent.getSource().getSelectedKey(),
        );
        oModel.setProperty("/draft/parameter", "");
        oModel.setProperty("/draft/parameterSetGet", "");
        oModel.setProperty("/draft/parameterUserDef", "");
        oModel.setProperty("/draft/parameterGeneral", "");
        oModel.setProperty("/draft/customParameter", "");
      },

      onDraftParameterValueChange: function (oEvent) {
        var oModel = this.getView().getModel("ruleModel");
        var sKey = oEvent.getSource().getSelectedKey();
        oModel.setProperty("/draft/parameter", sKey);
      },

      onParameterTypeChange: function (oEvent) {
        var oContext = oEvent.getSource().getBindingContext("ruleModel");
        if (oContext) {
          var oRuleModel = this.getView().getModel("ruleModel");
          var sPath = oContext.getPath();
          oRuleModel.setProperty(sPath + "/parameter", "");
          oRuleModel.setProperty(sPath + "/parameterSetGet", "");
          oRuleModel.setProperty(sPath + "/parameterUserDef", "");
          oRuleModel.setProperty(sPath + "/parameterGeneral", "");
          oRuleModel.setProperty(sPath + "/customParameter", "");
        }
      },

      _validateRules: function (aRules) {
        if (!aRules || aRules.length === 0) {
          MessageBox.error(
            "Must fill the rule: Please add at least one Rule before saving.",
          );
          return false;
        }
        for (var i = 0; i < aRules.length; i++) {
          var r = aRules[i];
          var sObj = (r.sapObject || "").trim();
          var sCli = (
            r.client === "Other Clients" ? r.customClient || "" : r.client || ""
          ).trim();
          var sParam = (
            r.parameter === "Custom"
              ? r.customParameter || ""
              : r.parameter || ""
          ).trim();
          var sOp = (r.operator || "").trim();
          var sVal = (
            r.expectedValue === "Custom"
              ? r.customExpectedValue || ""
              : r.expectedValue || ""
          ).trim();
          var sRuleNum = r.stepLabel || "Rule " + (i + 1);

          if (!sObj || sObj.indexOf("-- Select") === 0) {
            MessageBox.error(
              "Rule Validation Failure: Please select SAP Object for " +
                sRuleNum +
                ".",
            );
            return false;
          }
          if (!sCli || sCli.indexOf("-- Select") === 0) {
            MessageBox.error(
              "Rule Validation Failure: Please select Client for " +
                sRuleNum +
                ".",
            );
            return false;
          }
          if (!sParam || sParam.indexOf("-- Select") === 0) {
            MessageBox.error(
              "Rule Validation Failure: Please select Parameter for " +
                sRuleNum +
                ".",
            );
            return false;
          }
          if (!sOp || sOp.indexOf("-- Select") === 0) {
            MessageBox.error(
              "Rule Validation Failure: Please select Validation operator for " +
                sRuleNum +
                ".",
            );
            return false;
          }
          if (!sVal || sVal.indexOf("-- Select") === 0) {
            MessageBox.error(
              "Rule Validation Failure: Please specify Expected Value for " +
                sRuleNum +
                ".",
            );
            return false;
          }

          // Business Rule Parameter-Value Combination Checks
          if (sParam === "Failed Logins" && isNaN(sVal)) {
            MessageBox.error(
              "Business Rule Validation Error for " +
                sRuleNum +
                ": 'Failed Logins' expected value must be a valid numeric value.",
            );
            return false;
          }
          if (
            (sParam === "Password Changed" ||
              sParam === "Locked" ||
              sParam === "SDMI_* Exists") &&
            sVal !== "Yes" &&
            sVal !== "No" &&
            sVal !== "True" &&
            sVal !== "False"
          ) {
            MessageBox.error(
              "Business Rule Validation Error for " +
                sRuleNum +
                ": '" +
                sParam +
                "' expected value must be 'Yes' or 'No'.",
            );
            return false;
          }
        }
        return true;
      },

      _validateSystemTypes: function (sSys1, sSys2, sSys3) {
        if (!sSys1 || sSys1 === "None") {
          MessageBox.error("System Type is mandatory.");
          return false;
        }
        var aSelected = [sSys1];
        if (sSys2 && sSys2 !== "None") {
          if (aSelected.indexOf(sSys2) !== -1) {
            MessageBox.error(
              "Do not allow duplicate environment selections (" + sSys2 + ").",
            );
            return false;
          }
          aSelected.push(sSys2);
        }
        if (sSys3 && sSys3 !== "None") {
          if (aSelected.indexOf(sSys3) !== -1) {
            MessageBox.error(
              "Do not allow duplicate environment selections (" + sSys3 + ").",
            );
            return false;
          }
          aSelected.push(sSys3);
        }
        return true;
      },

      onAddRule: function () {
        this._openRuleDialog();
      },

      onConfirmAddRule: function () {
        var oRuleModel = this.getView().getModel("ruleModel");
        var oDraft = Object.assign({}, oRuleModel.getProperty("/draft"));
        oDraft.stepLabel = this._getRuleLabel(
          (oRuleModel.getProperty("/rules") || []).length,
        );
        if (!this._validateRules([oDraft])) {
          return;
        }
        var aRules = oRuleModel.getProperty("/rules") || [];
        aRules.push(oDraft);
        oRuleModel.setProperty("/rules", aRules);
        var oDialog = this._getRuleDialog();
        if (oDialog) {
          oDialog.close();
        }
      },

      onCancelAddRule: function () {
        var oDialog = this._getRuleDialog();
        if (oDialog) {
          oDialog.close();
        }
      },

      onDeleteRule: function (oEvent) {
        var oContext = oEvent.getSource().getBindingContext("ruleModel");
        if (!oContext) {
          return;
        }
        var iIndex = parseInt(oContext.getPath().split("/").pop(), 10);
        var oRuleModel = this.getView().getModel("ruleModel");
        var aRules = oRuleModel.getProperty("/rules") || [];
        aRules.splice(iIndex, 1);
        var that = this;
        aRules.forEach(function (r, idx) {
          r.stepLabel = that._getRuleLabel(idx);
        });
        oRuleModel.setProperty("/rules", aRules);
      },

      onFrequencyChange: function (oEvent) {
        var sKey = oEvent.getParameter("selectedItem").getKey();
        var oVboxCron = this.byId("vboxCron");
        var oTotalRunInput = this.byId("totalRunInput");
        var sCron = this.byId("cronInput")
          ? this.byId("cronInput").getValue()
          : "";

        if (oVboxCron) {
          oVboxCron.setVisible(sKey === "Cron Expression");
        }
        if (oTotalRunInput) {
          oTotalRunInput.setValue(
            ControlFrequency.calculateTotalRun(sKey, sCron),
          );
        }
      },

      onCronInputChange: function (oEvent) {
        var sCron = oEvent.getParameter("value") || "";
        if (this.byId("totalRunInput")) {
          this.byId("totalRunInput").setValue(
            ControlFrequency.calculateCronRunCount(sCron),
          );
        }
      },

      onCancel: function () {
        UIComponent.getRouterFor(this).navTo("ControlManagement");
      },

      onSaveControl: function () {
        var sId = this.byId("controlIdInput").getValue().trim();
        var sDesc = this.byId("controlDescInput").getValue().trim();
        var sOrgId = this.byId("organizationSelect").getSelectedKey();
        var sSys1 = this.byId("sysType1Select").getSelectedKey();
        var sSys2 = this.byId("sysType2Select").getSelectedKey();
        var sSys3 = this.byId("sysType3Select").getSelectedKey();
        var sFreq = this.byId("frequencySelect").getSelectedKey();
        var sCron = this.byId("cronInput").getValue().trim();
        var sControlType = this.byId("controlTypeSelect").getSelectedKey();

        if (!sId || !sDesc) {
          MessageBox.error("Control ID and Control Description are mandatory.");
          return;
        }
        if (!sOrgId) {
          MessageBox.error("Please select an Organization first.");
          return;
        }
        if (!this._validateSystemTypes(sSys1, sSys2, sSys3)) {
          return;
        }
        if (sFreq === "Cron Expression" && !sCron) {
          MessageBox.error("Please specify a Cron Expression.");
          return;
        }

        var aRules =
          this.getView().getModel("ruleModel").getProperty("/rules") || [];
        if (!this._validateRules(aRules)) {
          return;
        }

        var aSystemIds = collectSystemIds(sSys1, sSys2, sSys3);
        var aResolvedRules = aRules.map(resolveRule);
        var oRouter = UIComponent.getRouterFor(this);

        if (this._mode === "edit") {
          this._saveEdit(
            sDesc,
            sFreq,
            sCron,
            sControlType,
            aSystemIds,
            aResolvedRules,
            oRouter,
          );
        } else {
          this._saveCreate(
            sId,
            sDesc,
            sFreq,
            sCron,
            sControlType,
            aSystemIds,
            aResolvedRules,
            oRouter,
          );
        }
      },

      _saveCreate: function (
        sId,
        sDesc,
        sFreq,
        sCron,
        sControlType,
        aSystemIds,
        aResolvedRules,
        oRouter,
      ) {
        GlobalLoading.show("Saving Security Control", 0, true, true);
        fetch(Config.AUTH_BASE_URL + "/api/control/createControl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subdomain: this._getSubdomain(),
            code: sId,
            description: sDesc,
            category: null,
            controlType: sControlType,
            frequency: ControlFrequency.FREQ_UI_TO_BE[sFreq] || "DAILY",
            cronExpression: sCron || null,
            critical: false,
            systemIds: aSystemIds,
            rules: aResolvedRules,
            performedBy: (Session.get() || {}).email,
            performedByRole: (Session.get() || {}).role,
          }),
        })
          .then(function (r) {
            return r.json();
          })
          .then(function (oData) {
            GlobalLoading.hide();
            if (!oData.success) {
              MessageBox.error(oData.message || "Could not create control.");
              return;
            }
            MessageToast.show(
              "Security Control '" + sId + "' Created Successfully!",
            );
            oRouter.navTo("ControlManagement");
          })
          .catch(function () {
            GlobalLoading.hide();
            MessageBox.error(
              "Could not reach the server. Is xyra-core running?",
            );
          });
      },

      _saveEdit: function (
        sDesc,
        sFreq,
        sCron,
        sControlType,
        aSystemIds,
        aResolvedRules,
        oRouter,
      ) {
        var oEditing = this._editingControl;
        if (!oEditing) {
          return;
        }

        GlobalLoading.show("Saving Security Control", 0, true, true);
        fetch(Config.AUTH_BASE_URL + "/api/control/updateControl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subdomain: this._getSubdomain(),
            id: oEditing.id,
            description: sDesc,
            // No UI collects category/critical/enabled - round-trip the
            // control's own last-known values so updateControl's
            // overwrite-not-merge behavior doesn't silently reset them.
            // controlType now IS collected (controlTypeSelect), so the
            // real selected value is sent instead of an echo.
            category: oEditing.category,
            controlType: sControlType,
            critical: oEditing.critical,
            enabled: oEditing.enabled,
            frequency: ControlFrequency.FREQ_UI_TO_BE[sFreq] || "DAILY",
            cronExpression: sCron || null,
            systemIds: aSystemIds,
            rules: aResolvedRules,
            performedBy: (Session.get() || {}).email,
            performedByRole: (Session.get() || {}).role,
          }),
        })
          .then(function (r) {
            return r.json();
          })
          .then(function (oData) {
            GlobalLoading.hide();
            if (!oData.success) {
              MessageBox.error(oData.message || "Could not update control.");
              return;
            }
            MessageToast.show("Security Control Updated Successfully!");
            oRouter.navTo("ControlManagement");
          })
          .catch(function () {
            GlobalLoading.hide();
            MessageBox.error(
              "Could not reach the server. Is xyra-core running?",
            );
          });
      },

      onSideNavToggle: function () {
        var oToolPage = this.byId("controlEditorToolPage");
        if (oToolPage) {
          var bExpanded = !oToolPage.getSideExpanded();
          oToolPage.setSideExpanded(bExpanded);
          SidebarState.save(bExpanded);
        }
      },

      // Group headers ("Control Management") have sub-items and no key of
      // their own - select="onToggleSideNavGroup" on that item handles the
      // actual toggle; this guard is defense-in-depth in case the click
      // also bubbles up here, so it can never fall through to a navTo.
      onToggleSideNavGroup: function (oEvent) {
        var oItem = oEvent.getSource();
        oItem.setExpanded(!oItem.getExpanded());
      },

      onSideNavItemSelect: function (oEvent) {
        var oItem = oEvent.getParameter("item");
        if (!oItem) {
          return;
        }
        if (oItem.getItems && oItem.getItems().length) {
          oItem.setExpanded(!oItem.getExpanded());
          return;
        }
        var sKey = oItem.getKey();
        if (sKey && this[sKey]) {
          this[sKey]();
        } else if (sKey) {
          UIComponent.getRouterFor(this).navTo(sKey);
        }
      },

      onAdmin: function () {
        UIComponent.getRouterFor(this).navTo("Admin");
      },
      onControlManagement: function () {
        UIComponent.getRouterFor(this).navTo("ControlManagement");
      },
      onDeviationReport: function () {
        UIComponent.getRouterFor(this).navTo("DeviationReport");
      },
      onAIInsights: function () {
        UIComponent.getRouterFor(this).navTo("AIInsights");
      },
      onSOXCompliance: function () {
        UIComponent.getRouterFor(this).navTo("SOXCompliance");
      },
      onReports: function () {
        UIComponent.getRouterFor(this).navTo("Reports");
      },
      onAuditLogs: function () {
        UIComponent.getRouterFor(this).navTo("AuditLogs");
      },
      onConfiguration: function () {
        UIComponent.getRouterFor(this).navTo("Configuration");
      },
      onAccessManagement: function () {
        UIComponent.getRouterFor(this).navTo("AccessManagement");
      },
      onOrganization: function () {
        UIComponent.getRouterFor(this).navTo("Organization");
      },
      onRiskAnalytics: function () {
        UIComponent.getRouterFor(this).navTo("RiskAnalytics");
      },
      onProfile: function () {
        UIComponent.getRouterFor(this).navTo("Profile");
      },

      onNotificationPress: function (oEvent) {
        NotificationPopover.toggle(oEvent, this);
      },
      onLogout: function () {
        GlobalLoading.logout(this);
      },
    });
  },
);

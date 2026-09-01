sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/BusyIndicator",
    "xyraweb/model/sidebarState",
    "xyraweb/model/auditLogService",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationPopover",
    "xyraweb/model/config",
    "xyraweb/model/session",
    "xyraweb/model/mockData"
], function (Controller, JSONModel, MessageToast, MessageBox, Filter, FilterOperator, BusyIndicator, SidebarState, AuditLogService, GlobalLoading, NotificationPopover, Config, Session, MockData) {
    "use strict";

    // Frequency: UI select label <-> backend Controls.frequency enum.
    var FREQ_UI_TO_BE = {
        "Monthly (Last day of month)": "MONTHLY",
        "Weekly (Every Monday)": "WEEKLY",
        "Daily": "DAILY",
        "Realtime": "REALTIME",
        "Cron Expression": "CRON"
    };
    var FREQ_BE_TO_UI = {
        MONTHLY: "Monthly (Last day of month)",
        WEEKLY: "Weekly (Every Monday)",
        DAILY: "Daily",
        REALTIME: "Realtime",
        CRON: "Cron Expression"
    };

    // Validation/operator: UI select label <-> backend ControlRules.operator enum.
    var OPERATOR_UI_TO_BE = {
        "Equals": "EQUALS", "Not Equals": "NOT_EQUALS", "Contains": "CONTAINS", "Not Contains": "NOT_CONTAINS",
        "Exists": "EXISTS", "Not Exists": "NOT_EXISTS", "Greater Than": "GT", "Less Than": "LT",
        "Greater Than or Equal": "GTE", "Less Than or Equal": "LTE"
    };
    var OPERATOR_BE_TO_UI = {
        EQUALS: "Equals", NOT_EQUALS: "Not Equals", CONTAINS: "Contains", NOT_CONTAINS: "Not Contains",
        EXISTS: "Exists", NOT_EXISTS: "Not Exists", GT: "Greater Than", LT: "Less Than",
        GTE: "Greater Than or Equal", LTE: "Less Than or Equal"
    };

    // Parameter Type: UI select key <-> backend ControlRules.parameterType enum
    // (also byte-identical to xyra-s4's object_parameters.parameter_type).
    var PARAM_TYPE_UI_TO_BE = { "SET/GET Parameter": "SETGET", "User Default Value": "DEFAULT", "General": "GENERAL", "": "GENERAL" };
    var PARAM_TYPE_BE_TO_UI = { SETGET: "SET/GET Parameter", DEFAULT: "User Default Value", GENERAL: "General" };

    // The exact preset option lists from the view XML - used to detect whether a
    // resolved backend value matches a known preset (show it selected) or needs
    // the "Custom"/"Other Clients" fallback (see unresolveRule).
    var KNOWN_CLIENTS = ["All", "000", "001", "066", "100", "200", "300"];
    var KNOWN_SETGET = ["BUK", "WRK", "VKO", "VTEG", "SPA", "KOK", "EKO"];
    var KNOWN_USERDEF = ["Decimal Notation", "Date Format", "Time Zone", "Logon Language", "Spool Output (DEST)", "Output Device (PRINTER)"];
    var KNOWN_GENERAL = ["Password Changed", "User Type", "Locked", "Failed Logins", "Roles Assigned", "Security Policy", "SDMI_* Exists", "Super User", "SAP_ALL", "S_A.TMSADM", "Update Tool"];
    var KNOWN_EXPECTED = ["1000", "Yes", "No", "A (Dialog User)", "B (System User)", "C (Communication User)", "S (Service User)", "L (Reference User)", "G (Guest User)", "0", "1", "Z_NOEXPIRY", "SUPER", "SWPM (Software Provisioning Manager)", "SAPup (System Upgrade)", "SAPehpi (Enhancement Package Installer)", "STARTUP (Software Update Manager)", "SUM (SAP Upgrade Manager)", "None", "SAP delivered roles"];

    // Save direction: one working rule row (with its preset+custom pairs) -> the
    // single resolved-value-only shape the backend expects.
    function resolveRule(r) {
        return {
            sapObject: (r.sapObject || "").trim(),
            client: r.client === "Other Clients" ? (r.customClient || "").trim() : (r.client || "").trim(),
            parameterType: PARAM_TYPE_UI_TO_BE[r.parameterType] || "GENERAL",
            parameter: r.parameter === "Custom" ? (r.customParameter || "").trim() : (r.parameter || "").trim(),
            operator: OPERATOR_UI_TO_BE[r.operator] || r.operator,
            expectedValue: (r.parameter !== "Failed Logins" && r.expectedValue === "Custom")
                ? (r.customExpectedValue || "").trim() : String(r.expectedValue || "").trim()
        };
    }

    // Load-for-edit direction: a resolved backend rule -> a working rule row,
    // reverse-detecting "Custom"/"Other Clients" for values that aren't a known
    // preset. Called as aRules.map(unresolveRule, oController) so `this` inside is
    // the controller (for this._getRuleLabel).
    function unresolveRule(rule, index) {
        var out = {
            id: rule.id || (Date.now() + index),
            stepLabel: this._getRuleLabel(index),
            sapObject: rule.sapObject,
            operator: OPERATOR_BE_TO_UI[rule.operator] || rule.operator,
            parameterType: PARAM_TYPE_BE_TO_UI[rule.parameterType] || "General"
        };

        out.client = KNOWN_CLIENTS.indexOf(rule.client) !== -1 ? rule.client : "Other Clients";
        out.customClient = out.client === "Other Clients" ? rule.client : "";

        var presetList = out.parameterType === "SET/GET Parameter" ? KNOWN_SETGET
            : out.parameterType === "User Default Value" ? KNOWN_USERDEF
                : KNOWN_GENERAL;
        out.parameter = presetList.indexOf(rule.parameter) !== -1 ? rule.parameter : "Custom";
        out.customParameter = out.parameter === "Custom" ? rule.parameter : "";
        // mirror into the 3 shadow selects the view actually binds to
        out.parameterSetGet = out.parameterType === "SET/GET Parameter" ? out.parameter : "";
        out.parameterUserDef = out.parameterType === "User Default Value" ? out.parameter : "";
        out.parameterGeneral = (out.parameterType !== "SET/GET Parameter" && out.parameterType !== "User Default Value") ? out.parameter : "";

        if (rule.parameter === "Failed Logins") {
            out.expectedValue = rule.expectedValue;
            out.customExpectedValue = "";
        } else {
            out.expectedValue = KNOWN_EXPECTED.indexOf(rule.expectedValue) !== -1 ? rule.expectedValue : "Custom";
            out.customExpectedValue = out.expectedValue === "Custom" ? rule.expectedValue : "";
        }
        return out;
    }

    // Dedupe + drop empty/"None" slots from the 3 System Type selects.
    function collectSystemIds(s1, s2, s3) {
        var out = [];
        [s1, s2, s3].forEach(function (id) {
            if (id && id !== "None" && out.indexOf(id) === -1) { out.push(id); }
        });
        return out;
    }

    return Controller.extend("xyraweb.controller.ControlManagement", {

        onAfterRendering: function () {
            var oToolPage = this.byId("controlManagementToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(SidebarState.get());
            }
            var oNav = this.byId("sideNavigation");
            if (oNav) {
                oNav.setSelectedKey("ControlManagement");
                var oList = oNav.getItem();
                if (oList && oList.setSelectedKey) {
                    oList.setSelectedKey("ControlManagement");
                }
            }
        },

        onInit: function () {
            this.getView().setModel(new JSONModel({ controls: [] }), "controlsModel");
            this.getView().setModel(new JSONModel({ systems: [], systemsWithNone: [] }), "systemsModel");

            // Initialize Rule Builder Model
            var oRuleData = {
                createRules: [
                    { id: 1, stepLabel: "Rule 1", sapObject: "SAP*", client: "All", parameterType: "SET/GET Parameter", parameter: "", operator: "", expectedValue: "" }
                ],
                editRules: []
            };
            var oRuleModel = new JSONModel(oRuleData);
            this.getView().setModel(oRuleModel, "ruleModel");

            var that = this;
            this._loadSystemsForDialogs().then(function () { that._loadControls(); });
        },

        _getSubdomain: function () {
            var oSession = Session.get();
            return (oSession && oSession.subdomain) || Config.TEST_SUBDOMAIN;
        },

        // Real Systems, used to populate the 3 System Type selects (replacing the
        // old hardcoded DEV/QAS/PRD strings) and to translate a Control's
        // systemIds back into display text for the table.
        _loadSystemsForDialogs: function () {
            var that = this;
            return fetch(Config.AUTH_BASE_URL + "/api/system-config/listSystems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: this._getSubdomain() })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { throw new Error(oData.message || "listSystems failed"); }
                    that._applySystemsList(oData.systems || []);
                })
                .catch(function () {
                    MockData.notice(MessageToast);
                    that._applySystemsList((MockData.systems || []).map(function (s) { return { id: s.id, sysId: s.sysId }; }));
                });
        },

        _applySystemsList: function (aSystems) {
            this._systemsById = {};
            aSystems.forEach(function (s) { this._systemsById[s.id] = s.sysId; }.bind(this));
            var oSystemsModel = this.getView().getModel("systemsModel");
            oSystemsModel.setProperty("/systems", aSystems);
            oSystemsModel.setProperty("/systemsWithNone", [{ id: "None", sysId: "-- None --" }].concat(aSystems));
        },

        _sysDisplay: function (sId) {
            if (!sId) { return "None"; }
            return (this._systemsById && this._systemsById[sId]) || sId;
        },

        // Bridges one backend ControlEntry to a table row - carries both the
        // display-only fields the table renders (sysType1/2/3, frequencyRun,
        // totalRun) and the raw fields edit/delete/run need (dbId, code as `id`
        // for display continuity, systemIds, frequency, rules unresolved).
        _mapControlEntryToRow: function (c) {
            var aIds = c.systemIds || [];
            var sFreqUi = FREQ_BE_TO_UI[c.frequency] || "Daily";
            return {
                id: c.code,
                dbId: c.id,
                description: c.description,
                sysType1: this._sysDisplay(aIds[0]),
                sysType2: this._sysDisplay(aIds[1]),
                sysType3: this._sysDisplay(aIds[2]),
                frequencyRun: sFreqUi,
                cronExpr: c.cronExpression || "",
                totalRun: this._calculateTotalRun(sFreqUi, c.cronExpression),
                category: c.category,
                controlType: c.controlType,
                critical: c.critical,
                enabled: c.enabled,
                systemIds: aIds,
                frequency: c.frequency,
                rules: c.rules || [],
                lastRunAt: c.lastRunAt,
                lastRunStatus: c.lastRunStatus,
                nextRunAt: c.nextRunAt,
                createdBy: c.createdBy,
                createdDate: c.createdAt,
                modifiedBy: c.modifiedBy,
                modifiedDate: c.modifiedAt
            };
        },

        _loadControls: function () {
            var that = this;
            BusyIndicator.show(0);
            return fetch(Config.AUTH_BASE_URL + "/api/control/listControls", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: this._getSubdomain() })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();
                    if (!oData.success) { throw new Error(oData.message || "listControls failed"); }
                    var aRows = (oData.controls || []).map(that._mapControlEntryToRow, that);
                    that.getView().getModel("controlsModel").setProperty("/controls", aRows);
                })
                .catch(function () {
                    BusyIndicator.hide();
                    MockData.notice(MessageToast);
                    var aRows = (MockData.controls || []).map(that._mapControlEntryToRow, that);
                    that.getView().getModel("controlsModel").setProperty("/controls", aRows);
                });
        },

        _resetCreateForm: function () {
            if (this.byId("createControlIdInput")) { this.byId("createControlIdInput").setValue(""); }
            if (this.byId("createControlDescInput")) { this.byId("createControlDescInput").setValue(""); }
            this.getView().getModel("ruleModel").setProperty("/createRules", [
                { id: 1, stepLabel: "Rule 1", sapObject: "SAP*", client: "All", parameterType: "SET/GET Parameter", parameter: "", operator: "", expectedValue: "" }
            ]);
        },

        _getRuleLabel: function (iIndex) {
            var iNum = iIndex + 1;
            if (iNum === 1) { return "Rule 1"; }
            if (iNum === 2) { return "Then another rule: Rule 2"; }
            return "Then: Rule " + iNum;
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
                MessageBox.error("Must fill the rule: Please add at least one Rule before saving.");
                return false;
            }
            for (var i = 0; i < aRules.length; i++) {
                var r = aRules[i];
                var sObj = (r.sapObject || "").trim();
                var sCli = (r.client === "Other Clients" ? (r.customClient || "") : (r.client || "")).trim();
                var sParam = (r.parameter === "Custom" ? (r.customParameter || "") : (r.parameter || "")).trim();
                var sOp = (r.operator || "").trim();
                var sVal = (r.expectedValue === "Custom" ? (r.customExpectedValue || "") : (r.expectedValue || "")).trim();
                var sRuleNum = r.stepLabel || ("Rule " + (i + 1));

                if (!sObj || sObj.indexOf("-- Select") === 0) {
                    MessageBox.error("Rule Validation Failure: Please select SAP Object for " + sRuleNum + ".");
                    return false;
                }

                if (!sCli || sCli.indexOf("-- Select") === 0) {
                    MessageBox.error("Rule Validation Failure: Please select Client for " + sRuleNum + ".");
                    return false;
                }

                if (!sParam || sParam.indexOf("-- Select") === 0) {
                    MessageBox.error("Rule Validation Failure: Please select Parameter for " + sRuleNum + ".");
                    return false;
                }

                if (!sOp || sOp.indexOf("-- Select") === 0) {
                    MessageBox.error("Rule Validation Failure: Please select Validation operator for " + sRuleNum + ".");
                    return false;
                }

                if (!sVal || sVal.indexOf("-- Select") === 0) {
                    MessageBox.error("Rule Validation Failure: Please specify Expected Value for " + sRuleNum + ".");
                    return false;
                }

                // Business Rule Parameter-Value Combination Checks
                if (sParam === "Failed Logins" && isNaN(sVal)) {
                    MessageBox.error("Business Rule Validation Error for " + sRuleNum + ": 'Failed Logins' expected value must be a valid numeric value.");
                    return false;
                }

                if ((sParam === "Password Changed" || sParam === "Locked" || sParam === "SDMI_* Exists") && sVal !== "Yes" && sVal !== "No" && sVal !== "True" && sVal !== "False") {
                    MessageBox.error("Business Rule Validation Error for " + sRuleNum + ": '" + sParam + "' expected value must be 'Yes' or 'No'.");
                    return false;
                }
            }
            return true;
        },

        onAddCreateRule: function () {
            var oRuleModel = this.getView().getModel("ruleModel");
            var aRules = oRuleModel.getProperty("/createRules") || [];
            var sLabel = this._getRuleLabel(aRules.length);
            aRules.push({
                id: Date.now(),
                stepLabel: sLabel,
                sapObject: "SAP*",
                client: "000",
                parameterType: "SET/GET Parameter",
                parameter: "",
                operator: "",
                expectedValue: ""
            });
            oRuleModel.setProperty("/createRules", aRules);
        },

        onDeleteCreateRule: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("ruleModel");
            if (oContext) {
                var sPath = oContext.getPath();
                var iIndex = parseInt(sPath.split("/").pop(), 10);
                var oRuleModel = this.getView().getModel("ruleModel");
                var aRules = oRuleModel.getProperty("/createRules") || [];
                aRules.splice(iIndex, 1);
                var that = this;
                aRules.forEach(function (r, idx) {
                    r.stepLabel = that._getRuleLabel(idx);
                });
                oRuleModel.setProperty("/createRules", aRules);
            }
        },

        onAddEditRule: function () {
            var oRuleModel = this.getView().getModel("ruleModel");
            var aRules = oRuleModel.getProperty("/editRules") || [];
            var sLabel = this._getRuleLabel(aRules.length);
            aRules.push({
                id: Date.now(),
                stepLabel: sLabel,
                sapObject: "SAP*",
                client: "000",
                parameterType: "SET/GET Parameter",
                parameter: "",
                operator: "",
                expectedValue: ""
            });
            oRuleModel.setProperty("/editRules", aRules);
        },

        onDeleteEditRule: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("ruleModel");
            if (oContext) {
                var sPath = oContext.getPath();
                var iIndex = parseInt(sPath.split("/").pop(), 10);
                var oRuleModel = this.getView().getModel("ruleModel");
                var aRules = oRuleModel.getProperty("/editRules") || [];
                aRules.splice(iIndex, 1);
                var that = this;
                aRules.forEach(function (r, idx) {
                    r.stepLabel = that._getRuleLabel(idx);
                });
                oRuleModel.setProperty("/editRules", aRules);
            }
        },

        _calculateCronRunCount: function (sCron) {
            if (!sCron) {
                return "12";
            }
            var sClean = sCron.trim().replace(/\s+/g, " ");

            // Realtime: * * * * * or */1 * * * *
            if (sClean === "* * * * *" || sClean.indexOf("*/1 ") === 0) {
                return "Continuous";
            }

            var aParts = sClean.split(" ");
            if (aParts.length < 5) {
                return "12";
            }

            var min = aParts[0];
            var hour = aParts[1];
            var dom = aParts[2];
            var mon = aParts[3];
            var dow = aParts[4];

            // 1. Realtime check: * * * * *
            if (min === "*" && hour === "*" && dom === "*" && mon === "*" && dow === "*") {
                return "Continuous";
            }

            // 2. Monthly check: 0 0 1 * * or 0 0 L * *
            if ((dom === "1" || dom === "L" || dom === "28" || dom === "30" || dom === "31") && mon === "*" && dow === "*") {
                return "12";
            }

            // 3. Weekly check: 0 0 * * 1 or 0 0 * * MON
            if (dom === "*" && (dow === "1" || dow === "MON" || dow === "mon")) {
                return "52";
            }

            // 4. Daily check: 0 0 * * *
            if (min !== "*" && hour !== "*" && dom === "*" && mon === "*" && dow === "*") {
                return "365";
            }

            // 5. Hourly check: 0 * * * *
            if (min !== "*" && hour === "*" && dom === "*") {
                return "8,760 Runs/Year";
            }

            // 6. Every X mins: */5 * * * *
            if (min.indexOf("*/") === 0) {
                var step = parseInt(min.replace("*/", ""), 10);
                if (!isNaN(step) && step > 0) {
                    var runsPerDay = (24 * 60) / step;
                    var total = Math.round(runsPerDay * 365);
                    return total.toLocaleString() + " Runs/Year";
                }
            }

            if (dom !== "*") {
                return "12";
            }

            return "365";
        },

        _calculateTotalRun: function (sFrequency, sCron) {
            switch (sFrequency) {
                case "Monthly (Last day of month)":
                    return "12";
                case "Weekly (Every Monday)":
                    return "52";
                case "Daily":
                    return "365";
                case "Realtime":
                    return "Continuous";
                case "Cron Expression":
                    return this._calculateCronRunCount(sCron);
                default:
                    return "365";
            }
        },

        _validateSystemTypes: function (sSys1, sSys2, sSys3) {
            if (!sSys1 || sSys1 === "None") {
                MessageBox.error("System Type is mandatory.");
                return false;
            }

            var aSelected = [sSys1];

            if (sSys2 && sSys2 !== "None") {
                if (aSelected.indexOf(sSys2) !== -1) {
                    MessageBox.error("Do not allow duplicate environment selections (" + sSys2 + ").");
                    return false;
                }
                aSelected.push(sSys2);
            }

            if (sSys3 && sSys3 !== "None") {
                if (aSelected.indexOf(sSys3) !== -1) {
                    MessageBox.error("Do not allow duplicate environment selections (" + sSys3 + ").");
                    return false;
                }
                aSelected.push(sSys3);
            }

            return true;
        },

        onCronInputChange: function (oEvent) {
            var sCron = oEvent.getParameter("value") || "";
            var sCalculated = this._calculateCronRunCount(sCron);

            if (this.byId("createTotalRunInput")) {
                this.byId("createTotalRunInput").setValue(sCalculated);
            }
            if (this.byId("editTotalRunInput")) {
                this.byId("editTotalRunInput").setValue(sCalculated);
            }
        },

        onRowSysTypeChange: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("controlsModel");
            if (oContext) {
                var oItem = oContext.getObject();
                if (!this._validateSystemTypes(oItem.sysType1, oItem.sysType2, oItem.sysType3)) {
                    this.getView().getModel("controlsModel").refresh(true);
                    return;
                }
                MessageToast.show("Updated System Type environment mapping for " + oItem.id);
            }
        },

        onRowFrequencyChange: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("controlsModel");
            if (oContext) {
                var oItem = oContext.getObject();
                var sNewTotalRun = this._calculateTotalRun(oItem.frequencyRun, oItem.cronExpr);
                var oModel = this.getView().getModel("controlsModel");
                oModel.setProperty(oContext.getPath() + "/totalRun", sNewTotalRun);
                MessageToast.show("Updated Frequency Run for " + oItem.id + " to " + oItem.frequencyRun);
            }
        },

        onCreateFrequencyChange: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            var oVboxCron = this.byId("vboxCreateCron");
            var oTotalRunInput = this.byId("createTotalRunInput");
            var sCron = this.byId("createCronInput") ? this.byId("createCronInput").getValue() : "";

            var bIsCron = (sKey === "Cron Expression");
            if (oVboxCron) {
                oVboxCron.setVisible(bIsCron);
            }
            if (oTotalRunInput) {
                oTotalRunInput.setValue(this._calculateTotalRun(sKey, sCron));
            }
        },

        onEditFrequencyChange: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            var oVboxCron = this.byId("vboxEditCron");
            var oTotalRunInput = this.byId("editTotalRunInput");
            var sCron = this.byId("editCronInput") ? this.byId("editCronInput").getValue() : "";

            var bIsCron = (sKey === "Cron Expression");
            if (oVboxCron) {
                oVboxCron.setVisible(bIsCron);
            }
            if (oTotalRunInput) {
                oTotalRunInput.setValue(this._calculateTotalRun(sKey, sCron));
            }
        },

        onSysTypeChange: function () {
            // Dialog dropdown selection change handler
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("controlManagementToolPage");
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

        onNavAutomationMonitoring: function () {
            this.getOwnerComponent().getRouter().navTo("AutomationMonitoring");
        },

        onCreateControl: function () {
            this._loadSystemsForDialogs();
            var oDialog = this.byId("createControlDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseCreateControlDialog: function () {
            var oDialog = this.byId("createControlDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onSubmitCreateControl: function () {
            var sId = this.byId("createControlIdInput") ? this.byId("createControlIdInput").getValue().trim() : "";
            var sDesc = this.byId("createControlDescInput") ? this.byId("createControlDescInput").getValue().trim() : "";
            var sSys1 = this.byId("createSysType1Select") ? this.byId("createSysType1Select").getSelectedKey() : "";
            var sSys2 = this.byId("createSysType2Select") ? this.byId("createSysType2Select").getSelectedKey() : "None";
            var sSys3 = this.byId("createSysType3Select") ? this.byId("createSysType3Select").getSelectedKey() : "None";
            var sFreq = this.byId("createFrequencySelect") ? this.byId("createFrequencySelect").getSelectedKey() : "Daily";
            var sCron = this.byId("createCronInput") ? this.byId("createCronInput").getValue().trim() : "";

            if (!sId || !sDesc) {
                MessageBox.error("Control ID and Control Description are mandatory.");
                return;
            }

            if (!this._validateSystemTypes(sSys1, sSys2, sSys3)) {
                return;
            }

            if (sFreq === "Cron Expression" && !sCron) {
                MessageBox.error("Please specify a Cron Expression.");
                return;
            }

            var oRuleModel = this.getView().getModel("ruleModel");
            var aCreateRules = oRuleModel.getProperty("/createRules") || [];

            if (!this._validateRules(aCreateRules)) {
                return;
            }

            var that = this;
            var aSystemIds = collectSystemIds(sSys1, sSys2, sSys3);
            var aRules = aCreateRules.map(resolveRule);

            BusyIndicator.show(0);
            fetch(Config.AUTH_BASE_URL + "/api/control/createControl", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subdomain: this._getSubdomain(),
                    code: sId,
                    description: sDesc,
                    category: null,
                    controlType: "SECURITY",
                    frequency: FREQ_UI_TO_BE[sFreq] || "DAILY",
                    cronExpression: sCron || null,
                    critical: false,
                    systemIds: aSystemIds,
                    rules: aRules
                })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();
                    if (!oData.success) {
                        MessageBox.error(oData.message || "Could not create control.");
                        return;
                    }
                    MessageToast.show("Security Control '" + sId + "' Created Successfully!");
                    AuditLogService.addLog({
                        action: "Create",
                        module: "Control Management",
                        objectId: sId,
                        description: "Created new Security Control Master rule '" + sId + "': " + sDesc,
                        previousValue: "None (New Record)",
                        newValue: "Desc: " + sDesc + " | Freq: " + sFreq + " | Envs: " + sSys1 + "/" + sSys2 + "/" + sSys3,
                        result: "Success"
                    });
                    that._resetCreateForm();
                    that.onCloseCreateControlDialog();
                    that._loadControls();
                })
                .catch(function () {
                    BusyIndicator.hide();
                    MockData.notice(MessageToast);
                    var aMockControls = MockData.controls || [];
                    aMockControls.unshift({
                        id: "mock-" + Date.now(),
                        code: sId,
                        description: sDesc,
                        category: null,
                        controlType: "SECURITY",
                        frequency: FREQ_UI_TO_BE[sFreq] || "DAILY",
                        cronExpression: sCron || null,
                        critical: false,
                        enabled: true,
                        systemIds: aSystemIds,
                        rules: aRules,
                        lastRunAt: null,
                        lastRunStatus: "",
                        nextRunAt: null,
                        createdAt: new Date().toISOString(),
                        createdBy: "offline",
                        modifiedAt: new Date().toISOString(),
                        modifiedBy: "offline"
                    });
                    that._resetCreateForm();
                    that.onCloseCreateControlDialog();
                    that._loadControls();
                });
        },

        onEditControl: function (oEvent) {
            this._loadSystemsForDialogs();
            var oContext = oEvent.getSource().getBindingContext("controlsModel");
            var oItem = oContext.getObject();
            this._oEditingControl = oItem;

            if (this.byId("editControlIdInput")) { this.byId("editControlIdInput").setValue(oItem.id); }
            if (this.byId("editControlDescInput")) { this.byId("editControlDescInput").setValue(oItem.description); }

            var aIds = (oItem.systemIds || []).slice();
            if (aIds.length > 3) {
                console.warn("Control " + oItem.id + " has " + aIds.length + " systemIds; ControlManagement UI only shows 3. Extra ids: " + aIds.slice(3).join(", "));
                aIds = aIds.slice(0, 3);
            }
            if (this.byId("editSysType1Select")) { this.byId("editSysType1Select").setSelectedKey(aIds[0] || ""); }
            if (this.byId("editSysType2Select")) { this.byId("editSysType2Select").setSelectedKey(aIds[1] || "None"); }
            if (this.byId("editSysType3Select")) { this.byId("editSysType3Select").setSelectedKey(aIds[2] || "None"); }

            if (this.byId("editFrequencySelect")) { this.byId("editFrequencySelect").setSelectedKey(oItem.frequencyRun || "Daily"); }
            if (this.byId("editCronInput")) { this.byId("editCronInput").setValue(oItem.cronExpr || ""); }

            var bIsCron = (oItem.frequencyRun === "Cron Expression");
            if (this.byId("vboxEditCron")) { this.byId("vboxEditCron").setVisible(bIsCron); }
            if (this.byId("editTotalRunInput")) {
                this.byId("editTotalRunInput").setValue(oItem.totalRun || this._calculateTotalRun(oItem.frequencyRun, oItem.cronExpr));
            }

            // Load Rules into Rule Model - reverse-mapped from resolved backend
            // values back into preset-or-Custom working rows (see unresolveRule).
            var aItemRules = oItem.rules && oItem.rules.length ? oItem.rules.map(unresolveRule, this) : [
                {
                    id: 1, stepLabel: "Rule 1", sapObject: "", client: "", customClient: "",
                    parameterType: "General", parameter: "", customParameter: "",
                    parameterSetGet: "", parameterUserDef: "", parameterGeneral: "",
                    operator: "", expectedValue: "", customExpectedValue: ""
                }
            ];
            this.getView().getModel("ruleModel").setProperty("/editRules", aItemRules);

            var oDialog = this.byId("editControlDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseEditControlDialog: function () {
            var oDialog = this.byId("editControlDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onSubmitEditControl: function () {
            var oEditing = this._oEditingControl;
            if (!oEditing) { return; }

            var sDesc = this.byId("editControlDescInput").getValue().trim();
            var sSys1 = this.byId("editSysType1Select").getSelectedKey();
            var sSys2 = this.byId("editSysType2Select").getSelectedKey();
            var sSys3 = this.byId("editSysType3Select").getSelectedKey();
            var sFreq = this.byId("editFrequencySelect").getSelectedKey();
            var sCron = this.byId("editCronInput").getValue().trim();

            if (!sDesc) {
                MessageBox.error("Control Description cannot be empty.");
                return;
            }

            if (!this._validateSystemTypes(sSys1, sSys2, sSys3)) {
                return;
            }

            if (sFreq === "Cron Expression" && !sCron) {
                MessageBox.error("Please specify a Cron Expression.");
                return;
            }

            var oRuleModel = this.getView().getModel("ruleModel");
            var aEditRules = oRuleModel.getProperty("/editRules") || [];

            if (!this._validateRules(aEditRules)) {
                return;
            }

            var that = this;
            var aSystemIds = collectSystemIds(sSys1, sSys2, sSys3);
            var aRules = aEditRules.map(resolveRule);

            BusyIndicator.show(0);
            fetch(Config.AUTH_BASE_URL + "/api/control/updateControl", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subdomain: this._getSubdomain(),
                    id: oEditing.dbId,
                    description: sDesc,
                    // No UI collects these - round-trip the control's own last-known
                    // values so updateControl's overwrite-not-merge behavior doesn't
                    // silently reset them.
                    category: oEditing.category,
                    controlType: oEditing.controlType,
                    critical: oEditing.critical,
                    enabled: oEditing.enabled,
                    frequency: FREQ_UI_TO_BE[sFreq] || "DAILY",
                    cronExpression: sCron || null,
                    systemIds: aSystemIds,
                    rules: aRules
                })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();
                    if (!oData.success) {
                        MessageBox.error(oData.message || "Could not update control.");
                        return;
                    }
                    AuditLogService.addLog({
                        action: "Update",
                        module: "Control Management",
                        objectId: oEditing.id,
                        description: "Updated Security Control Master rule '" + oEditing.id + "'.",
                        previousValue: "Desc: " + oEditing.description + " | Freq: " + oEditing.frequencyRun,
                        newValue: "Desc: " + sDesc + " | Freq: " + sFreq + " | Envs: " + sSys1 + "/" + sSys2 + "/" + sSys3,
                        result: "Success"
                    });
                    MessageToast.show("Security Control Updated Successfully!");
                    that.onCloseEditControlDialog();
                    that._loadControls();
                })
                .catch(function () {
                    BusyIndicator.hide();
                    MockData.notice(MessageToast);
                    var oFound = (MockData.controls || []).filter(function (c) { return c.id === oEditing.dbId; })[0];
                    if (oFound) {
                        oFound.description = sDesc;
                        oFound.frequency = FREQ_UI_TO_BE[sFreq] || "DAILY";
                        oFound.cronExpression = sCron || null;
                        oFound.systemIds = aSystemIds;
                        oFound.rules = aRules;
                    }
                    that.onCloseEditControlDialog();
                    that._loadControls();
                });
        },

        onDeleteControl: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("controlsModel");
            var oItem = oContext.getObject();
            var that = this;

            MessageBox.confirm("Are you sure you want to delete Security Control '" + oItem.id + "'?", {
                onClose: function (oAction) {
                    if (oAction !== MessageBox.Action.OK) { return; }

                    BusyIndicator.show(0);
                    fetch(Config.AUTH_BASE_URL + "/api/control/deleteControl", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ subdomain: that._getSubdomain(), id: oItem.dbId })
                    })
                        .then(function (r) { return r.json(); })
                        .then(function (oData) {
                            BusyIndicator.hide();
                            if (!oData.success) {
                                MessageBox.error(oData.message || "Could not delete control.");
                                return;
                            }
                            MessageToast.show("Security Control '" + oItem.id + "' deleted.");
                            AuditLogService.addLog({
                                action: "Delete",
                                module: "Control Management",
                                objectId: oItem.id,
                                description: "Deleted Security Control Master rule '" + oItem.id + "': " + oItem.description,
                                previousValue: "Control ID: " + oItem.id + " | Desc: " + oItem.description + " | Freq: " + oItem.frequencyRun,
                                newValue: "Record Deleted",
                                result: "Success"
                            });
                            that._loadControls();
                        })
                        .catch(function () {
                            BusyIndicator.hide();
                            MockData.notice(MessageToast);
                            var aMockControls = MockData.controls || [];
                            var iIndex = -1;
                            aMockControls.forEach(function (c, idx) { if (c.id === oItem.dbId) { iIndex = idx; } });
                            if (iIndex !== -1) { aMockControls.splice(iIndex, 1); }
                            that._loadControls();
                        });
                }
            });
        },

        onRunControlNow: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("controlsModel");
            var oItem = oContext.getObject();
            var that = this;

            BusyIndicator.show(0);
            fetch(Config.AUTH_BASE_URL + "/api/control/runControlNow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: this._getSubdomain(), id: oItem.dbId })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    BusyIndicator.hide();
                    if (!oData.success) {
                        MessageBox.error(oData.message || "Run failed.");
                        return;
                    }
                    MessageToast.show("Run complete: " + oData.deviationsFound + " deviation(s) found, " + oData.alertsCreated + " alert(s) created.");
                    that._loadControls();
                })
                .catch(function () {
                    BusyIndicator.hide();
                    MessageBox.error("Could not reach the server to run this control.");
                });
        },

        onSearchControls: function (oEvent) {
            var sQuery = "";
            if (oEvent && typeof oEvent.getParameter === "function") {
                var sParamQuery = oEvent.getParameter("query");
                var sParamNewVal = oEvent.getParameter("newValue");
                sQuery = (sParamQuery !== undefined && sParamQuery !== null && sParamQuery !== "") ? sParamQuery : ((sParamNewVal !== undefined && sParamNewVal !== null) ? sParamNewVal : "");
            }
            if ((!sQuery || sQuery === "") && this.byId("searchControlId")) {
                sQuery = this.byId("searchControlId").getValue();
            }
            sQuery = sQuery ? sQuery.trim() : "";

            var aFilters = [];
            if (sQuery) {
                var oFilterId = new Filter("id", FilterOperator.Contains, sQuery);
                var oFilterDesc = new Filter("description", FilterOperator.Contains, sQuery);
                var oFilterSys1 = new Filter("sysType1", FilterOperator.Contains, sQuery);
                var oFilterSys2 = new Filter("sysType2", FilterOperator.Contains, sQuery);
                var oFilterSys3 = new Filter("sysType3", FilterOperator.Contains, sQuery);
                var oFilterFreq = new Filter("frequencyRun", FilterOperator.Contains, sQuery);

                aFilters.push(new Filter({
                    filters: [oFilterId, oFilterDesc, oFilterSys1, oFilterSys2, oFilterSys3, oFilterFreq],
                    and: false
                }));
            }

            var oTable = this.byId("controlsTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },

        onAdmin: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
        onNavAutomationMonitoring: function () { this.getOwnerComponent().getRouter().navTo("AutomationMonitoring"); },
        onNavDeviationReport: function () { this.getOwnerComponent().getRouter().navTo("DeviationReport"); },
        onControlManagement: function () { this.getOwnerComponent().getRouter().navTo("ControlManagement"); },
        onAIInsights: function () { this.getOwnerComponent().getRouter().navTo("AIInsights"); },
        onSOXCompliance: function () { this.getOwnerComponent().getRouter().navTo("SOXCompliance"); },
        onReports: function () { this.getOwnerComponent().getRouter().navTo("Reports"); },
        onDeviationReport: function () { this.getOwnerComponent().getRouter().navTo("DeviationReport"); },
        onAuditLogs: function () { this.getOwnerComponent().getRouter().navTo("AuditLogs"); },
        onConfiguration: function () { this.getOwnerComponent().getRouter().navTo("Configuration"); },
        onAccessManagement: function () { this.getOwnerComponent().getRouter().navTo("AccessManagement"); },
        onRiskAnalytics: function () { this.getOwnerComponent().getRouter().navTo("RiskAnalytics"); },
        onSystemHealth: function () { this.getOwnerComponent().getRouter().navTo("SystemHealth"); },
        onProfile: function () { this.getOwnerComponent().getRouter().navTo("Profile"); },

        onNotificationPress: function (oEvent) {
            NotificationPopover.toggle(oEvent, this);
        },
        onLogout: function () {
            GlobalLoading.logout(this);
        }

    });

});

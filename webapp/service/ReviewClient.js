sap.ui.define(["xyraweb/model/config", "xyraweb/model/session", "sap/m/MessageToast", "xyraweb/service/apiClient"], function (Config, Session, MessageToast, ApiClient) {
    "use strict";

    var bNoticeShown = false;
    function notice() {
        if (bNoticeShown) { return; }
        bNoticeShown = true;
        MessageToast.show("xyra-core is offline — showing sample review data for testing purposes only.", { duration: 5000 });
    }

    function getSubdomain() {
        var oSession = Session.get();
        return (oSession && oSession.subdomain) || Config.TEST_SUBDOMAIN;
    }

    function getActingUserId() {
        var oSession = Session.get();
        return oSession ? oSession.userId : null;
    }

    function post(action, body) {
        return ApiClient.postJson(Config.AUTH_BASE_URL + "/api/review/" + action, Object.assign({ subdomain: getSubdomain() }, body));
    }

    // decideLevel1/2 have no offline-mock fallback (a decision can't be
    // faked) - but a network failure or timeout must still resolve to the
    // same {success:false, message, ticketNumber:null} shape every caller
    // already checks, instead of leaving their .then() waiting forever on a
    // promise that silently never settles.
    function decide(action, body) {
        return post(action, body).catch(function (err) {
            return { success: false, message: (err && err.name === "AbortError") ? "Request timed out - xyra-core may be unreachable." : "Could not reach xyra-core.", ticketNumber: null };
        });
    }

    function formatDate(sIso) {
        if (!sIso) { return ""; }
        var d = new Date(sIso);
        if (isNaN(d.getTime())) { return ""; }
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }

    // One Reviews row = exactly one AlertItems row, always - fields the old
    // mock treated as variable per-report (deviation count, remediation/
    // reviewer status while pending) become fixed display constants here.
    // Cosmetic mock fields with no backend equivalent (evidence, automation
    // logs, attachments, screenshots) stay empty - there's no evidence-
    // storage subsystem in this schema, and building one is out of scope.
    function toReportRow(r) {
        var oSession = Session.get();
        return {
            reportId: r.id,
            reportName: r.controlDescription,
            controlId: r.controlId,
            alertId: r.alertId,
            controlName: r.controlDescription,
            businessProcess: "",
            riskLevel: r.severity === "CRITICAL" ? "High Risk" : "Medium Risk",
            riskState: r.severity === "CRITICAL" ? "Error" : "Warning",
            system: r.systemId + " (Client " + r.client + ")",
            generatedDate: formatDate(r.generatedDate),
            deviations: "1 Deviation",
            deviationState: "Error",
            remediationStatus: "Pending Basis Action",
            remediationState: "Warning",
            reviewerStatus: "Pending Review",
            reviewerState: "Warning",
            comments: r.message,
            rcaText: "",
            reviewerName: (oSession && oSession.name) || "",
            employeeId: (oSession && oSession.userId) || "",
            decisionDate: "",
            sigStatus: "Pending Signature",
            elecSigConfirmed: false,
            evidenceFilesCount: 0,
            evidenceFiles: [],
            automationLogs: [],
            attachments: [],
            screenshots: [],
            reviewHistory: [],
            // Level 2 / Escalation extras - harmless extra properties on
            // Reviewer1's row shape, populated for real on the other levels.
            reviewer1Decision: r.reviewer1Status === "APPROVE" ? "Approved" : r.reviewer1Status,
            rev1Date: formatDate(r.reviewer1At),
            rev1Signature: r.reviewer1ByName ? (r.reviewer1ByName + " • Reviewed") : "",
            rev1Comments: r.reviewer1Comment,
            rev1RcaText: r.reviewer1Comment,
            evidenceStatus: "N/A",
            reviewer2Status: "Pending Technical Review",
            reviewer2State: "Warning",
            rev2RcaText: "",
            reviewer2Name: (oSession && oSession.name) || "",
            reviewer1Comments: r.reviewer1Comment,
            reviewer2Comments: r.reviewer2Comment,
            evidence: "N/A",
            complianceStatus: "Pending Review",
            complianceState: "Warning",
            workflowStatus: "Pending Review",
            workflowState: "Warning",
            managerNotes: ""
        };
    }

    // level: 1 or 2. Per SOP-8865 6.3.1 the chain is exactly 2 levels - reject
    // at either level tickets and ends the chain, level 2 approve is final
    // closure. No third state exists here.
    function toHistoryRow(r, level) {
        var status = level === 1 ? r.reviewer1Status : r.reviewer2Status;
        var comment = level === 1 ? r.reviewer1Comment : r.reviewer2Comment;
        var byName = level === 1 ? r.reviewer1ByName : r.reviewer2ByName;
        var at = level === 1 ? r.reviewer1At : r.reviewer2At;
        var forwardLabel = level === 1 ? "Forwarded to Reviewer 2" : "Closed - Approved";
        var state = status === "APPROVE" ? "Success" : "Error";

        return {
            ticketId: r.ticketNumber || "",
            reportId: r.id,
            controlId: r.controlId,
            reportName: r.controlDescription,
            system: r.systemId + " (Client " + r.client + ")",
            decision: status === "APPROVE" ? "Approved" : "Rejected",
            reviewedDate: formatDate(at),
            ticketStatus: status === "APPROVE" ? forwardLabel : "Remediation Required",
            ticketStatusState: state,
            remediatedItem: r.parameter,
            previousValue: r.expectedValue,
            updatedValue: r.actualValue,
            rcaText: comment,
            changedBy: byName,
            employeeId: "",
            sigStatus: "Reviewed",
            reviewerComment: comment,
            // EscalationManager's monitoring view uses this alternate field
            // naming - aliased here rather than a second mapper function.
            reviewerName: byName,
            removedRemediatedItem: r.parameter,
            reason: comment,
            reviewComment: comment,
            complianceStatus: status === "APPROVE" ? "Compliant" : "Non-Compliant",
            complianceState: state,
            remediationStatus: status === "APPROVE" ? "Remediated & Verified" : "Action Required",
            remediationState: state
        };
    }

    return {
        // Level 1 (Reviewer1)
        listLevel1Queue: function () {
            return post("listLevel1Queue", {}).then(function (d) {
                if (!d.success) { throw new Error(d.message); }
                return d.reviews.map(toReportRow);
            }).catch(function () { notice(); return []; });
        },
        listLevel1History: function () {
            return post("listLevel1History", {}).then(function (d) {
                if (!d.success) { throw new Error(d.message); }
                return d.reviews.map(function (r) { return toHistoryRow(r, 1); });
            }).catch(function () { notice(); return []; });
        },
        decideLevel1: function (reviewId, decision, comment) {
            return decide("decideLevel1", { reviewId: reviewId, decision: decision, comment: comment, actingUserId: getActingUserId() });
        },

        // Level 2 (Reviewer2)
        listLevel2Queue: function () {
            return post("listLevel2Queue", {}).then(function (d) {
                if (!d.success) { throw new Error(d.message); }
                return d.reviews.map(toReportRow);
            }).catch(function () { notice(); return []; });
        },
        listLevel2History: function () {
            return post("listLevel2History", {}).then(function (d) {
                if (!d.success) { throw new Error(d.message); }
                return d.reviews.map(function (r) { return toHistoryRow(r, 2); });
            }).catch(function () { notice(); return []; });
        },
        decideLevel2: function (reviewId, decision, comment) {
            return decide("decideLevel2", { reviewId: reviewId, decision: decision, comment: comment, actingUserId: getActingUserId() });
        }
    };
});

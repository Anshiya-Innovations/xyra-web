sap.ui.define(["xyraweb/model/config", "xyraweb/model/session", "xyraweb/service/apiClient"], function (Config, Session, ApiClient) {
    "use strict";

    function getSubdomain() {
        var oSession = Session.get();
        return (oSession && oSession.subdomain) || Config.TEST_SUBDOMAIN;
    }

    function getActingUser() {
        var oSession = Session.get();
        return { performedBy: (oSession && oSession.email) || null, performedByRole: (oSession && oSession.role) || null };
    }

    return {
        getActingUser: getActingUser,

        // Fire-and-forget - only for actions that have no backend write to
        // piggyback a tx onto (viewing an alert/report). Every other action
        // is logged server-side, inside the same tx as the real write.
        logEvent: function (oPayload) {
            var oUser = getActingUser();
            return ApiClient.postJson(Config.AUTH_BASE_URL + "/api/audit-log/logEvent", Object.assign(
                { subdomain: getSubdomain(), performedBy: oUser.performedBy, performedByRole: oUser.performedByRole },
                oPayload
            )).catch(function () { /* best-effort - never blocks the UI it's called from */ });
        },

        listAuditLogs: function () {
            return ApiClient.postJson(Config.AUTH_BASE_URL + "/api/audit-log/listAuditLogs", { subdomain: getSubdomain() })
                .then(function (oData) {
                    if (!oData.success) { throw new Error(oData.message || "listAuditLogs failed"); }
                    return (oData.logs || []).map(function (r) {
                        return {
                            logId: r.id,
                            timestamp: r.createdAt,
                            adminUser: r.performedBy,
                            action: r.action,
                            module: r.module,
                            objectType: r.objectType,
                            objectId: r.objectLabel || r.objectId,
                            description: r.description,
                            previousValue: r.previousValue,
                            newValue: r.newValue,
                            result: r.result === "SUCCESS" ? "Success" : "Failure",
                            resultState: r.result === "SUCCESS" ? "Success" : "Error",
                            systemId: r.systemId,
                            controlId: r.controlId
                        };
                    });
                });
        }
    };
});

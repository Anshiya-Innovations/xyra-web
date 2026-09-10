sap.ui.define(["xyraweb/model/config", "xyraweb/model/session", "sap/m/MessageToast", "xyraweb/service/apiClient"], function (Config, Session, MessageToast, ApiClient) {
    "use strict";

    var bNoticeShown = false;
    function notice() {
        if (bNoticeShown) { return; }
        bNoticeShown = true;
        MessageToast.show("xyra-core is offline — showing sample dashboard data for testing purposes only.", { duration: 5000 });
    }

    function getSubdomain() {
        var oSession = Session.get();
        return (oSession && oSession.subdomain) || Config.TEST_SUBDOMAIN;
    }

    function post(domain, action, body) {
        return ApiClient.postJson(Config.AUTH_BASE_URL + "/api/" + domain + "/" + action, Object.assign({ subdomain: getSubdomain() }, body));
    }

    function postList(domain, action, key) {
        return post(domain, action, {}).then(function (d) {
            if (!d.success) { throw new Error(d.message); }
            return d[key];
        });
    }

    // One failed call shouldn't blank the whole dashboard - each source
    // resolves to null on failure and is defaulted below; only if every
    // source fails do we show the offline fallback dataset.
    function safe(promise) {
        return promise.catch(function () { return null; });
    }

    function countTickets(rows) {
        return (rows || []).filter(function (r) { return r.ticketNumber; }).length;
    }

    function formatDate(sIso) {
        if (!sIso) { return ""; }
        var d = new Date(sIso);
        if (isNaN(d.getTime())) { return ""; }
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }

    function formatDateTime(sIso) {
        if (!sIso) { return "Never"; }
        var d = new Date(sIso);
        if (isNaN(d.getTime())) { return "Never"; }
        return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    }

    // Failing/erroring controls surface first, then whichever is soonest due -
    // the two things an admin actually needs to see first on a health table.
    function statusRank(s) { return s === "FAIL" ? 0 : s === "ERROR" ? 1 : s === "PASS" ? 2 : 3; }
    function byControlHealth(a, b) {
        var r = statusRank(a.lastRunStatus) - statusRank(b.lastRunStatus);
        if (r !== 0) { return r; }
        return new Date(a.nextRunAt || 0) - new Date(b.nextRunAt || 0);
    }

    function toControlRow(c) {
        var sStatus = c.lastRunStatus || "NEVER_RUN";
        return {
            code: c.code,
            description: c.description,
            frequency: c.frequency,
            enabledText: c.enabled ? "Enabled" : "Disabled",
            enabledState: c.enabled ? "Success" : "None",
            lastRunStatus: sStatus === "NEVER_RUN" ? "Never Run" : sStatus,
            lastRunState: sStatus === "PASS" ? "Success" : (sStatus === "FAIL" || sStatus === "ERROR") ? "Error" : "None",
            lastRunAt: formatDateTime(c.lastRunAt),
            nextRunAt: formatDateTime(c.nextRunAt)
        };
    }

    // sap.m.ProgressIndicator's own state coloring (Error=red, Warning=amber,
    // Success=green, None=neutral blue-gray) - a real, always-rendering
    // control instead of a hand-rolled empty-div fill bar.
    var VALUE_STATE = { Error: "Error", Critical: "Warning", Good: "Success", Neutral: "None" };

    // Bars are scaled relative to the largest value in their own set (the
    // same "comparison chart" semantics as the microchart control this
    // replaced), not to a global max - each mini bar-chart reads on its own.
    // `pct` is a CSSSize string ("37%") for binding directly to a FlexBox's
    // real `width` property (verified against the actual FlexBoxRenderer
    // source: it writes width as a literal inline style unconditionally -
    // not a flex-basis/animation trick like sap.m.ProgressIndicator uses).
    function withBarStyling(items) {
        var max = Math.max.apply(null, items.map(function (i) { return i.value; }).concat([1]));
        return items.map(function (i) {
            return {
                label: i.label, value: i.value,
                pct: Math.round((i.value / max) * 100) + "%",
                state: VALUE_STATE[i.color] || "None"
            };
        });
    }

    function toFindingRow(h) {
        return {
            finding: h.description,
            control: h.controlId,
            severity: h.severity,
            severityState: h.severity === "Critical" ? "Error" : h.severity === "Medium" ? "Warning" : "Success",
            status: h.status,
            // ponytail: was a "class={binding}" pill - that's a dead binding
            // in SAPUI5 XML views (see Admin.view.xml's comment), so this is
            // now consumed by ObjectStatus's genuinely-bound `state` property.
            statusState: h.status === "Resolved" ? "Success" : h.status === "In Progress" ? "Warning" : "Error",
            detected: formatDate(h.alertDate)
        };
    }

    // ponytail: offline-fallback fixtures only, used when xyra-core can't be
    // reached at all - same role as ReviewClient/DeviationClient's own
    // fallback data, kept small since it's never meant to look authoritative.
    function getFallback() {
        return {
            controlsTotal: 6, controlsEnabled: 5,
            openDeviations: 8, resolvedDeviations: 34, complianceRatePct: 92,
            systemsTotal: 4, systemsOnline: 3,
            alertBreakdown: withBarStyling([
                { label: "Open", value: 8, color: "Error" },
                { label: "In Progress", value: 3, color: "Critical" },
                { label: "Resolved", value: 34, color: "Good" }
            ]),
            reviewPipeline: withBarStyling([
                { label: "Level 1 Pending", value: 3, color: "Error" },
                { label: "Level 2 Pending", value: 2, color: "Critical" },
                { label: "Tickets Created", value: 3, color: "Neutral" }
            ]),
            controls: [
                { code: "NLG08", description: "Basis Kernel Audit Logging & Parameter Validation", frequency: "DAILY", enabledText: "Enabled", enabledState: "Success", lastRunStatus: "FAIL", lastRunState: "Error", lastRunAt: "09 Sep 2026, 06:00", nextRunAt: "10 Sep 2026, 06:00" },
                { code: "NLG01", description: "SAP System Security Baseline & Parameter Enforcement", frequency: "WEEKLY", enabledText: "Enabled", enabledState: "Success", lastRunStatus: "PASS", lastRunState: "Success", lastRunAt: "08 Sep 2026, 06:00", nextRunAt: "15 Sep 2026, 06:00" }
            ],
            recentFindings: [
                { finding: "Kernel parameter changed outside maintenance window.", control: "NLG08", severity: "Critical", severityState: "Error", status: "Open", statusState: "Error", detected: "09 Sep 2026" },
                { finding: "Super user account logged in with default password.", control: "NLG01", severity: "High", severityState: "Warning", status: "In Progress", statusState: "Warning", detected: "08 Sep 2026" }
            ]
        };
    }

    function loadDashboard() {
        return Promise.all([
            safe(postList("control", "listControls", "controls")),
            safe(post("deviation", "listDeviations", {}).then(function (d) { if (!d.success) { throw new Error(d.message); } return d; })),
            safe(postList("system-config", "listSystems", "systems")),
            safe(postList("review", "listLevel1Queue", "reviews")),
            safe(postList("review", "listLevel2Queue", "reviews")),
            safe(postList("review", "listLevel1History", "reviews")),
            safe(postList("review", "listLevel2History", "reviews"))
        ]).then(function (a) {
            var controls = a[0], deviation = a[1], systems = a[2];
            var l1q = a[3], l2q = a[4], l1h = a[5], l2h = a[6];

            if (!controls && !deviation && !systems && !l1q && !l2q && !l1h && !l2h) {
                notice();
                return getFallback();
            }

            controls = controls || [];
            var headers = (deviation && deviation.headers) || [];
            var kpi = (deviation && deviation.kpi) || {};
            systems = systems || [];
            l1q = l1q || []; l2q = l2q || []; l1h = l1h || []; l2h = l2h || [];

            var statusCounts = { Open: 0, "In Progress": 0, Resolved: 0 };
            headers.forEach(function (h) { if (statusCounts[h.status] !== undefined) { statusCounts[h.status]++; } });

            var ticketsCreated = countTickets(l1h) + countTickets(l2h);

            return {
                controlsTotal: controls.length,
                controlsEnabled: controls.filter(function (c) { return c.enabled; }).length,
                openDeviations: kpi.openItems || 0,
                resolvedDeviations: kpi.resolvedItems || 0,
                complianceRatePct: parseFloat(kpi.complianceRate) || 0,
                systemsTotal: systems.length,
                systemsOnline: systems.filter(function (s) { return s.lastConnectionStatus === "ONLINE"; }).length,
                alertBreakdown: withBarStyling([
                    { label: "Open", value: statusCounts.Open, color: "Error" },
                    { label: "In Progress", value: statusCounts["In Progress"], color: "Critical" },
                    { label: "Resolved", value: statusCounts.Resolved, color: "Good" }
                ]),
                reviewPipeline: withBarStyling([
                    { label: "Level 1 Pending", value: l1q.length, color: "Error" },
                    { label: "Level 2 Pending", value: l2q.length, color: "Critical" },
                    { label: "Tickets Created", value: ticketsCreated, color: "Neutral" }
                ]),
                controls: controls.slice().sort(byControlHealth).slice(0, 10).map(toControlRow),
                recentFindings: headers.slice().sort(function (a, b) { return new Date(b.alertDate) - new Date(a.alertDate); }).slice(0, 8).map(toFindingRow)
            };
        });
    }

    return { loadDashboard: loadDashboard };
});

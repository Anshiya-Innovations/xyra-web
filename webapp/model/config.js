sap.ui.define([], function () {
    "use strict";

    // xyra-core runs as its own separate server/module — not bundled with this
    // UI5 app — so every call to it is a plain cross-origin fetch(), not an
    // OData model binding. Point this at wherever `cds watch` is actually
    // serving xyra-core.
    var AUTH_BASE_URL = "http://localhost:4004";

    // ponytail: hardcoded to the one fixed test tenant for now — there's no
    // Host-header-based Tenant Resolver yet, so the frontend can't discover the
    // subdomain any other way. Replace with real tenant resolution once that
    // exists (e.g. reading it from the browser's own hostname).
    var TEST_SUBDOMAIN = "xyrademo";

    return {
        AUTH_BASE_URL: AUTH_BASE_URL,
        TEST_SUBDOMAIN: TEST_SUBDOMAIN
    };
});

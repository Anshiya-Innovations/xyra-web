sap.ui.define([], function () {
    "use strict";

    // ponytail: in-memory fixtures used only when xyra-core can't be reached.
    // Mutated locally so Create/Update/Delete "work" in the demo; resets on
    // reload. Swap for the real API once xyra-core is actually hosted.
    var users = [
        { id: "u1", name: "Admin User", email: "admin@xyrademo.test", role: "ADMIN", status: "Active", createdDate: "2026-01-15" },
        { id: "u2", name: "Escalation Manager", email: "manager@xyrademo.test", role: "ESCALATION_MANAGER", status: "Active", createdDate: "2026-01-15" },
        { id: "u3", name: "Reviewer One", email: "reviewer1@xyrademo.test", role: "REVIEWER", status: "Active", createdDate: "2026-02-02" },
        { id: "u4", name: "Reviewer Two", email: "reviewer2@xyrademo.test", role: "REVIEWER", status: "Active", createdDate: "2026-02-02" },
        { id: "u5", name: "Auditor User", email: "auditor@xyrademo.test", role: "AUDITOR", status: "Active", createdDate: "2026-02-10" }
    ];

    var systems = [
        { id: "sys1", sysId: "MY8", client: "000", sysType: "Development", hostName: "sapdev01.xyra.com", sysDetails: "Development box", sector: "Manufacturing", platform: "S/4HANA", region: "APAC", clientType: "ABAP", sysVersion: "2023", logonGroup: "PUBLIC", portNumber: "3200", instanceNo: "00" },
        { id: "sys2", sysId: "MQ8", client: "100", sysType: "Quality", hostName: "sapqas01.xyra.com", sysDetails: "Quality box", sector: "Manufacturing", platform: "S/4HANA", region: "APAC", clientType: "ABAP", sysVersion: "2023", logonGroup: "PUBLIC", portNumber: "3600", instanceNo: "00" },
        { id: "sys3", sysId: "MP8", client: "800", sysType: "Production", hostName: "sapprd01.xyra.com", sysDetails: "Production box", sector: "Manufacturing", platform: "S/4HANA", region: "APAC", clientType: "ABAP", sysVersion: "2023", logonGroup: "PUBLIC", portNumber: "3200", instanceNo: "00" }
    ];

    var profile = {
        phone: "+1 555-0100",
        department: "IT Governance",
        organization: "Xyra Demo Tenant"
    };

    var bNoticeShown = false;

    // Shows the "dummy data" disclaimer once per session, not once per failed
    // call — a page with several fetches shouldn't spam four toasts.
    function notice(MessageToast) {
        if (bNoticeShown) { return; }
        bNoticeShown = true;
        MessageToast.show("xyra-core is offline — this screen is showing dummy data for testing purposes only.", { duration: 5000 });
    }

    return {
        users: users,
        systems: systems,
        profile: profile,
        notice: notice
    };
});

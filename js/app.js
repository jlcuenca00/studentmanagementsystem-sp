window.AppState = {
    session: window.StorageManager.getSession(),
    grades: window.StorageManager.getGrades(),
    announcements: window.StorageManager.getAnnouncements(),
    searchQuery: "",
    gradeClassId: "",
    sidebarCollapsed: localStorage.getItem("sms_sidebar_collapsed") === "true",
    sidebarMobileOpen: false,
};

window.App = (() => {
    const app = document.getElementById("app");

    function showToast(message, type = "success") {
        const toast = document.createElement("div");
        Object.assign(toast.style, {
            position: "fixed",
            bottom: "24px",
            right: "24px",
            padding: "1rem 1.5rem",
            background: type === "success" ? "#166534" : "#b91c1c",
            color: "#fff",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            zIndex: "9999",
            fontWeight: "600",
            fontSize: "0.95rem",
            transform: "translateY(100px)",
            opacity: "0",
            transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
        });
        toast.innerText = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transform = "translateY(0)";
            toast.style.opacity = "1";
        }, 10);
        setTimeout(() => {
            toast.style.transform = "translateY(100px)";
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function parseRoute() {
        const hash = location.hash || "";
        const clean = hash.replace(/^#\/?/, "");
        if (!clean) return { role: null, name: "landing" };

        const [pathOnly, queryString] = clean.split("?");
        const parts = pathOnly.split("/").filter(Boolean);
        const params = new URLSearchParams(queryString || "");
        if (params.get("classId"))
            window.AppState.gradeClassId = params.get("classId");

        return {
            role: parts[0] || null,
            name: parts[1] || "dashboard",
            classId: parts[2] || null,
        };
    }

    function getCurrentUser() {
        if (!window.AppState.session) return null;
        return window.AppState.session.role === "student"
            ? window.Utils.studentById(window.AppState.session.userId)
            : window.Utils.teacherById(window.AppState.session.userId);
    }

    function navConfig(role) {
        return role === "student"
            ? [
                  ["◫", "Dashboard", "#/student/dashboard"],
                  ["◎", "Profile", "#/student/profile"],
                  ["▣", "Classes", "#/student/classes"],
                  ["≣", "Grades", "#/student/grades"],
                  ["✦", "Announcements", "#/student/announcements"],
                  ["◷", "Calendar", "#/student/calendar"],
              ]
            : [
                  ["◫", "Dashboard", "#/teacher/dashboard"],
                  ["◎", "Profile", "#/teacher/profile"],
                  ["▣", "Classes", "#/teacher/classes"],
                  ["☰", "Student Records", "#/teacher/student-records"],
                  ["≣", "Grades", "#/teacher/grades"],
                  ["✦", "Announcements", "#/teacher/announcements"],
                  ["◷", "Calendar", "#/teacher/calendar"],
              ];
    }

    function renderSidebar(role, currentPage) {
        const userLabel =
            role === "student" ? "Student Portal" : "Faculty Portal";
        return `
      <aside id="mainSidebar" class="sidebar ${window.AppState.sidebarMobileOpen ? "mobile-open" : ""}">
        <div class="sidebar-inner">
          <div class="brand">
            <div class="brand-badge">SM</div>
            <div class="brand-text">
              <strong>School MS</strong>
              <small>${userLabel}</small>
            </div>
            ${
                window.innerWidth <= 920
                    ? `
              <button id="closeMobileSidebar" class="btn btn-ghost" style="margin-left: auto; color: white;">✕</button>
            `
                    : ""
            }
          </div>

          <button id="sidebarToggle" class="btn sidebar-toggle" style="color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.2);">
            <span class="nav-icon">◂▸</span>
            <span class="btn-text">Toggle Sidebar</span>
          </button>

          <nav class="nav-group" style="margin-top: 1rem;">
            ${navConfig(role)
                .map(
                    ([icon, label, href]) => `
              <a class="nav-link ${href.includes(`/${currentPage}`) ? "active" : ""}" href="${href}" title="${label}">
                <span class="nav-icon">${icon}</span>
                <span class="nav-label">${label}</span>
              </a>
            `,
                )
                .join("")}
          </nav>

          <div class="sidebar-footer">
            <button id="logoutBtn" class="btn" style="width: 100%; color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">
              <span class="nav-icon">↩</span>
              <span class="footer-text">Sign out</span>
            </button>
          </div>
        </div>
      </aside>
    `;
    }

    function renderLayout(routeInfo) {
        const session = window.AppState.session;
        if (!session) {
            app.innerHTML = window.LandingView.render();
            window.LandingView.bind();
            return;
        }

        const user = getCurrentUser();

        // THE FAILSAFE: Fixed the URL hash bug here!
        if (!user) {
            window.AppState.session = null;
            window.StorageManager.clearSession();
            location.hash = ""; // This forces the browser to realize we left the dashboard
            return;
        }

        let selectionStart = null;
        try {
            if (
                document.activeElement &&
                "selectionStart" in document.activeElement
            ) {
                selectionStart = document.activeElement.selectionStart;
            }
        } catch (e) {}
        const activeElementId = document.activeElement
            ? document.activeElement.id
            : null;

        const role = session.role;
        const view =
            role === "student" ? window.StudentViews : window.TeacherViews;
        const pageTitle = view.getPageTitle(routeInfo.name);
        const body = view.render(routeInfo);
        const showSearch =
            role === "teacher" &&
            ["student-records", "classes", "grades"].includes(routeInfo.name);

        app.innerHTML = `
      <div class="app-shell ${window.AppState.sidebarCollapsed ? "sidebar-collapsed" : ""}">
        ${renderSidebar(role, routeInfo.name)}
        <div class="main-shell">
          <header class="topbar">
            <div class="topbar-left" style="display: flex; align-items: center; gap: 1rem;">
              <button id="mobileMenuBtn" class="btn btn-ghost" style="padding: 0.5rem; display: ${window.innerWidth <= 920 ? "block" : "none"};">
                <span style="font-size: 1.4rem; line-height: 1;">☰</span>
              </button>
              <div>
                <h1>${pageTitle}</h1>
                <div class="breadcrumb">${role === "student" ? "Student" : "Teacher"} / ${pageTitle}</div>
              </div>
            </div>
            <div class="topbar-right">
              ${showSearch ? `<div class="search-wrap"><input id="pageSearch" type="text" placeholder="Search records..." value="${window.AppState.searchQuery || ""}" /></div>` : ""}
              <div class="user-pill">
                <div class="avatar">${window.Utils.initials(user.name)}</div>
                <div style="display: ${window.innerWidth <= 640 ? "none" : "block"};">
                  <strong style="display: block; font-size: 0.9rem;">${user.name}</strong>
                  <span class="muted" style="font-size: 0.75rem;">${user.id}</span>
                </div>
              </div>
            </div>
          </header>
          <main class="page">${body}</main>
        </div>
      </div>
    `;

        if (activeElementId) {
            const el = document.getElementById(activeElementId);
            if (el) {
                el.focus();
                if (el.setSelectionRange && selectionStart !== null)
                    el.setSelectionRange(selectionStart, selectionStart);
            }
        }

        document.getElementById("logoutBtn").addEventListener("click", () => {
            window.AppState.session = null;
            window.StorageManager.clearSession();
            location.hash = "";
            render();
        });

        const toggle = document.getElementById("sidebarToggle");
        if (toggle) {
            toggle.addEventListener("click", () => {
                window.AppState.sidebarCollapsed =
                    !window.AppState.sidebarCollapsed;
                localStorage.setItem(
                    "sms_sidebar_collapsed",
                    String(window.AppState.sidebarCollapsed),
                );

                const shell = document.querySelector(".app-shell");
                if (shell) {
                    shell.classList.toggle(
                        "sidebar-collapsed",
                        window.AppState.sidebarCollapsed,
                    );
                }
            });
        }

        const closeMobileSidebar = () => {
            window.AppState.sidebarMobileOpen = false;
            const sidebar = document.getElementById("mainSidebar");
            if (sidebar) sidebar.classList.remove("mobile-open");
            const backdrop = document.getElementById("sidebarBackdrop");
            if (backdrop) {
                backdrop.style.opacity = "0";
                setTimeout(() => backdrop.remove(), 300);
            }
        };

        const mobileBtn = document.getElementById("mobileMenuBtn");
        if (mobileBtn) {
            mobileBtn.addEventListener("click", () => {
                window.AppState.sidebarMobileOpen = true;
                const sidebar = document.getElementById("mainSidebar");
                if (sidebar) sidebar.classList.add("mobile-open");

                let backdrop = document.getElementById("sidebarBackdrop");
                if (!backdrop) {
                    backdrop = document.createElement("div");
                    backdrop.id = "sidebarBackdrop";
                    backdrop.style.cssText =
                        "position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 90; opacity: 0; transition: opacity 0.3s ease;";
                    document.body.appendChild(backdrop);
                    backdrop.offsetHeight;
                    backdrop.style.opacity = "1";
                    backdrop.addEventListener("click", closeMobileSidebar);
                }
            });
        }

        const closeMobileBtn = document.getElementById("closeMobileSidebar");
        if (closeMobileBtn)
            closeMobileBtn.addEventListener("click", closeMobileSidebar);

        const search = document.getElementById("pageSearch");
        if (search) {
            search.addEventListener("input", (e) => {
                window.AppState.searchQuery = e.target.value;
                render();
            });
        }

        if (
            role === "teacher" &&
            typeof window.TeacherViews.bind === "function"
        )
            window.TeacherViews.bind(routeInfo);
        if (
            role === "student" &&
            typeof window.StudentViews.bind === "function"
        )
            window.StudentViews.bind(routeInfo);
    }

    function guardRoute(routeInfo) {
        if (!window.AppState.session) return { role: null, name: "landing" };
        if (routeInfo.role !== window.AppState.session.role)
            return { role: window.AppState.session.role, name: "dashboard" };
        return routeInfo;
    }

    function render() {
        renderLayout(guardRoute(parseRoute()));
    }

    window.addEventListener("resize", () => {
        if (window.innerWidth > 920 && window.AppState.sidebarMobileOpen) {
            window.AppState.sidebarMobileOpen = false;
            const sidebar = document.getElementById("mainSidebar");
            if (sidebar) sidebar.classList.remove("mobile-open");
            const backdrop = document.getElementById("sidebarBackdrop");
            if (backdrop) backdrop.remove();
        }
    });

    return { render, showToast };
})();

window.addEventListener("hashchange", window.App.render);
window.addEventListener("DOMContentLoaded", () => {
    if (window.AppState.session && !location.hash) {
        location.hash =
            window.AppState.session.role === "student"
                ? "#/student/dashboard"
                : "#/teacher/dashboard";
    }
    window.App.render();
});

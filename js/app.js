window.AppState = {
  session: window.StorageManager.getSession(),
  grades: window.StorageManager.getGrades(),
  announcements: window.StorageManager.getAnnouncements(),
  searchQuery: "",
  gradeClassId: "",
  sidebarCollapsed: localStorage.getItem("sms_sidebar_collapsed") === "true"
};

window.App = (() => {
  const app = document.getElementById("app");

  function parseRoute() {
    const hash = location.hash || "";
    const clean = hash.replace(/^#\/?/, "");
    if (!clean) return { role: null, name: "landing" };

    const [pathOnly, queryString] = clean.split("?");
    const parts = pathOnly.split("/").filter(Boolean);
    const params = new URLSearchParams(queryString || "");
    if (params.get("classId")) window.AppState.gradeClassId = params.get("classId");

    return {
      role: parts[0] || null,
      name: parts[1] || "dashboard",
      classId: parts[2] || null
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
          ["◷", "Calendar", "#/student/calendar"]
        ]
      : [
          ["◫", "Dashboard", "#/teacher/dashboard"],
          ["◎", "Profile", "#/teacher/profile"],
          ["▣", "Classes", "#/teacher/classes"],
          ["☰", "Student Records", "#/teacher/student-records"],
          ["≣", "Grades", "#/teacher/grades"],
          ["✦", "Announcements", "#/teacher/announcements"],
          ["◷", "Calendar", "#/teacher/calendar"]
        ];
  }

  function renderSidebar(role, currentPage) {
    const userLabel = role === "student" ? "Student Portal" : "Faculty Portal";
    return `
      <aside class="sidebar">
        <div class="sidebar-inner">
          <div class="brand">
            <div class="brand-badge">SM</div>
            <div class="brand-text">
              <strong>Student MS</strong>
              <small>${userLabel}</small>
            </div>
          </div>

          <button id="sidebarToggle" class="btn btn-secondary sidebar-toggle">
            <span class="nav-icon">☰</span>
            <span class="btn-text">Collapse sidebar</span>
          </button>

          <nav class="nav-group">
            ${navConfig(role).map(([icon, label, href]) => `
              <a class="nav-link ${href.includes(`/${currentPage}`) ? "active" : ""}" href="${href}" title="${label}">
                <span class="nav-icon">${icon}</span>
                <span class="nav-label">${label}</span>
              </a>
            `).join("")}
          </nav>

          <div class="sidebar-footer">
            <button id="logoutBtn" class="btn btn-secondary">
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

    const role = session.role;
    const user = getCurrentUser();
    const view = role === "student" ? window.StudentViews : window.TeacherViews;
    const pageTitle = view.getPageTitle(routeInfo.name);
    const body = view.render(routeInfo);
    const showSearch = role === "teacher" && ["student-records", "classes", "grades"].includes(routeInfo.name);

    app.innerHTML = `
      <div class="app-shell ${window.AppState.sidebarCollapsed ? "sidebar-collapsed" : ""}">
        ${renderSidebar(role, routeInfo.name)}
        <div class="main-shell">
          <header class="topbar">
            <div class="topbar-left">
              <h1>${pageTitle}</h1>
              <div class="breadcrumb">${role === "student" ? "Student" : "Teacher"} / ${pageTitle}</div>
            </div>
            <div class="topbar-right">
              ${showSearch ? `<div class="search-wrap"><input id="pageSearch" type="text" placeholder="Search by name, class, section, or ID" value="${window.AppState.searchQuery || ""}" /></div>` : ""}
              <div class="user-pill">
                <div class="avatar">${window.Utils.initials(user.name)}</div>
                <div>
                  <strong>${user.name}</strong>
                  <div class="muted small">${user.id}</div>
                </div>
              </div>
            </div>
          </header>
          <main class="page">${body}</main>
        </div>
      </div>
    `;

    document.getElementById("logoutBtn").addEventListener("click", () => {
      window.AppState.session = null;
      window.StorageManager.clearSession();
      location.hash = "";
      render();
    });

    const toggle = document.getElementById("sidebarToggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        window.AppState.sidebarCollapsed = !window.AppState.sidebarCollapsed;
        localStorage.setItem("sms_sidebar_collapsed", String(window.AppState.sidebarCollapsed));
        render();
      });
    }

    const search = document.getElementById("pageSearch");
    if (search) {
      search.addEventListener("input", () => {
        window.AppState.searchQuery = search.value;
        render();
      });
    }

    if (role === "teacher") window.TeacherViews.bind(routeInfo);
  }

  function guardRoute(routeInfo) {
    if (!window.AppState.session) return { role: null, name: "landing" };
    if (routeInfo.role !== window.AppState.session.role) {
      return { role: window.AppState.session.role, name: "dashboard" };
    }
    return routeInfo;
  }

  function render() {
    const route = guardRoute(parseRoute());
    renderLayout(route);
  }

  return { render };
})();

window.addEventListener("hashchange", window.App.render);
window.addEventListener("DOMContentLoaded", () => {
  if (window.AppState.session && !location.hash) {
    location.hash = window.AppState.session.role === "student" ? "#/student/dashboard" : "#/teacher/dashboard";
  }
  window.App.render();
});

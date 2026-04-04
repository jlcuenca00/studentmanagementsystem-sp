window.LandingView = (() => {
  function render() {
    return `
      <div class="auth-shell">
        <section class="portal-login-card">
          <div class="portal-login-head">
            <div class="portal-login-mark">SM</div>
            <div>
              <h1>Student Management System</h1>
              <p>Institutional portal access</p>
            </div>
          </div>

          <div class="login-tabs">
            <button class="login-tab active" data-role-select="student">Student</button>
            <button class="login-tab" data-role-select="teacher">Teacher</button>
          </div>

          <div class="login-grid">
            <div>
              <label class="muted small" for="loginUsername">Institution Username</label>
              <input id="loginUsername" type="text" placeholder="Enter username" autocomplete="username" />
            </div>

            <div>
              <label class="muted small" for="loginPassword">Password</label>
              <input id="loginPassword" type="password" placeholder="Enter password" autocomplete="current-password" />
            </div>

            <div>
              <label class="muted small" for="accountSelect">Account Directory</label>
              <select id="accountSelect"></select>
            </div>
          </div>

          <div class="login-actions-row">
            <span id="portalHint" class="muted small">Student portal</span>
            <button id="signInBtn" class="btn btn-primary">Sign In</button>
          </div>
        </section>
      </div>
    `;
  }

  function bind() {
    let selectedRole = "student";
    const tabs = document.querySelectorAll("[data-role-select]");
    const accountSelect = document.getElementById("accountSelect");
    const usernameInput = document.getElementById("loginUsername");
    const passwordInput = document.getElementById("loginPassword");
    const hint = document.getElementById("portalHint");
    const signInBtn = document.getElementById("signInBtn");

    function fillAccounts(role) {
      const list = role === "student" ? window.STUDENTS : window.TEACHERS;
      accountSelect.innerHTML = list
        .map(item => `<option value="${item.id}">${item.name} • ${item.id}</option>`)
        .join("");
      const current = list[0];
      if (current) usernameInput.value = current.id.toLowerCase();
      hint.textContent = role === "student" ? "Student portal" : "Faculty portal";
    }

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(item => item.classList.remove("active"));
        tab.classList.add("active");
        selectedRole = tab.dataset.roleSelect;
        fillAccounts(selectedRole);
        passwordInput.value = "";
      });
    });

    accountSelect.addEventListener("change", () => {
      usernameInput.value = accountSelect.value.toLowerCase();
    });

    signInBtn.addEventListener("click", () => {
      window.AppState.session = { role: selectedRole, userId: accountSelect.value };
      window.StorageManager.saveSession(window.AppState.session);
      location.hash = selectedRole === "student" ? "#/student/dashboard" : "#/teacher/dashboard";
    });

    fillAccounts(selectedRole);
  }

  return { render, bind };
})();

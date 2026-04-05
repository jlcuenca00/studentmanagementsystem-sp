window.LandingView = (() => {
    function render() {
        return `
      <div class="auth-shell" style="background: linear-gradient(135deg, var(--bg-alt), #e2daef); display: flex; align-items: center; justify-content: center; min-height: 100vh;">
        
        <section class="portal-login-card" style="background: var(--panel); padding: 2.5rem; border-radius: var(--radius-xl); box-shadow: 0 20px 40px rgba(45, 30, 80, 0.12); border: 1px solid var(--line-soft); width: 100%; max-width: 420px; display: grid; gap: 1.5rem;">
          
          <div class="portal-login-head" style="flex-direction: column; text-align: center; padding-bottom: 0.5rem; justify-content: center; width: 100%;">
            <div style="width: 80px; height: 80px; border-radius: 16px; background: var(--panel-3); border: 2px dashed var(--muted); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem auto; color: var(--muted); font-size: 0.85rem; font-weight: 600;">
              LOGO
            </div>
            <h1 style="font-size: 1.5rem; text-align: center; width: 100%;">School Management System</h1>
          </div>

          <div class="login-tabs">
            <button class="login-tab active" data-role-select="student">Student</button>
            <button class="login-tab" data-role-select="teacher">Teacher</button>
          </div>

          <div class="login-grid">
            <div>
              <label class="muted small" for="loginUsername">Username</label>
              <input id="loginUsername" type="text" placeholder="Enter username (e.g. S001)" autocomplete="username" />
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

          <button id="signInBtn" class="btn btn-primary" style="width: 100%; padding: 0.85rem; font-size: 1.05rem; margin-top: 0.5rem; transition: background 0.3s ease;">
            Login
          </button>
          
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
        const signInBtn = document.getElementById("signInBtn");

        function fillAccounts(role) {
            const list = role === "student" ? window.STUDENTS : window.TEACHERS;
            accountSelect.innerHTML = list
                .map(
                    (item) =>
                        `<option value="${item.id}">${item.name} • ${item.id}</option>`,
                )
                .join("");
            const current = list[0];
            if (current) usernameInput.value = current.id.toLowerCase();
        }

        tabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                tabs.forEach((item) => item.classList.remove("active"));
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
            const typedUsername = usernameInput.value.trim().toLowerCase();
            const list =
                selectedRole === "student" ? window.STUDENTS : window.TEACHERS;

            // Look for the user based strictly on what is typed in the box
            const user = list.find((u) => u.id.toLowerCase() === typedUsername);

            if (!user) {
                // Show an error on the button if they typed a bad ID
                const originalText = signInBtn.innerText;
                signInBtn.innerText = "User not found!";
                signInBtn.style.background = "var(--danger)";
                setTimeout(() => {
                    signInBtn.innerText = originalText;
                    signInBtn.style.background = "var(--accent)";
                }, 2000);
                return;
            }

            window.AppState.session = { role: selectedRole, userId: user.id };
            window.StorageManager.saveSession(window.AppState.session);

            const targetHash =
                selectedRole === "student"
                    ? "#/student/dashboard"
                    : "#/teacher/dashboard";

            // Force render if the URL is stuck
            if (location.hash === targetHash) {
                window.App.render();
            } else {
                location.hash = targetHash;
            }
        });

        fillAccounts(selectedRole);
    }

    return { render, bind };
})();

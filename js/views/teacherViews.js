window.TeacherViews = (() => {
  function getTeacher() {
    return window.Utils.teacherById(window.AppState.session.userId);
  }

  function getClasses(teacher) {
    return window.CLASSES.filter(item => teacher.assignedClassIds.includes(item.id));
  }

  function studentsForClass(classId) {
    return window.STUDENTS.filter(student => student.classIds.includes(classId));
  }

  function classAverage(classId) {
    const grades = window.Utils.gradesForClass(classId);
    return window.Utils.round(window.Utils.average(grades.map(window.Utils.computeGradeAverage)));
  }

  function allTeacherStudents(teacher) {
    const ids = new Set();
    getClasses(teacher).forEach(item => studentsForClass(item.id).forEach(student => ids.add(student.id)));
    return [...ids].map(id => window.Utils.studentById(id));
  }

  function classCard(item) {
    const studentCount = studentsForClass(item.id).length;
    return `
      <article class="class-card">
        <div class="class-card-top">
          <div>
            <div class="course-code">${item.code}</div>
            <h3>${item.title}</h3>
          </div>
          <span class="badge badge-primary">${item.section}</span>
        </div>
        <div class="class-meta-list">
          <div>${item.schedule}</div>
          <div>${item.room}</div>
          <div>${studentCount} enrolled students</div>
        </div>
        <div class="class-card-footer">
          <span class="badge badge-success">Avg ${classAverage(item.id) || "N/A"}</span>
          <a class="btn btn-secondary" href="#/teacher/classes/${item.id}">Open Class</a>
        </div>
      </article>
    `;
  }

  function getPageTitle(name) {
    const map = {
      dashboard: "Teacher Dashboard",
      profile: "Teacher Profile",
      classes: "Assigned Classes",
      "student-records": "Student Records",
      grades: "Grade Management",
      announcements: "Announcements",
      calendar: "Calendar"
    };
    return map[name] || "Teacher Dashboard";
  }

  function renderDashboard() {
    const teacher = getTeacher();
    const classes = getClasses(teacher);
    const students = allTeacherStudents(teacher);
    const activeAnnouncements = window.AppState.announcements.filter(item => item.target === "General" || teacher.assignedClassIds.includes(item.target));
    const events = window.Utils.sortByDateAsc(window.EVENTS).slice(0, 4);

    return `
      <section class="hero-surface">
        <div class="hero-panel">
          <div class="hero-eyebrow">Class Management Center</div>
          <h2>${teacher.name}</h2>
          <p>Monitor assigned classes, maintain grade records, review student standing, and publish announcements from a unified faculty workspace.</p>
          <div class="hero-strip">
            <span class="hero-chip">${teacher.department}</span>
            <span class="hero-chip">${classes.length} assigned classes</span>
            <span class="hero-chip">${students.length} active students</span>
          </div>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#/teacher/grades">Open Grade Workspace</a>
            <a class="btn btn-secondary" href="#/teacher/student-records">Browse Student Records</a>
          </div>
        </div>

        <section class="record-panel">
          <div class="section-header"><div><h3>Near-Term Schedule</h3><p class="section-subtitle">Upcoming academic items</p></div></div>
          <div class="agenda-list">
            ${events.map(item => `
              <div class="calendar-agenda-item">
                <div>
                  <strong>${item.title}</strong>
                  <div class="calendar-agenda-date">${window.Utils.formatDate(item.date)}</div>
                </div>
                <span class="badge badge-warning">Event</span>
              </div>
            `).join("")}
          </div>
        </section>
      </section>

      <section class="metric-grid">
        ${window.Utils.metricCard("Assigned Classes", classes.length, "Current teaching load")}
        ${window.Utils.metricCard("Managed Students", students.length, "Unique linked records")}
        ${window.Utils.metricCard("Posted Grades", window.AppState.grades.filter(item => teacher.assignedClassIds.includes(item.classId)).length, "Current stored entries")}
        ${window.Utils.metricCard("Announcements", activeAnnouncements.length, "Visible academic notices")}
      </section>

      <section class="dashboard-grid">
        <div class="stack">
          <section class="card">
            <div class="section-header">
              <div><h2>Assigned Classes</h2><p class="section-subtitle">Organized by course with quick access</p></div>
              <a class="btn btn-secondary" href="#/teacher/classes">View All Classes</a>
            </div>
            <div class="class-grid">${classes.map(classCard).join("")}</div>
          </section>

          <section class="table-shell">
            <div class="section-header"><div><h2>Student Snapshot</h2><p class="section-subtitle">Attendance and academic standing overview</p></div></div>
            <div class="table-wrap">
              <table class="table">
                <thead><tr><th>Student</th><th>Section</th><th>Classes</th><th>Attendance</th><th>Average</th></tr></thead>
                <tbody>
                  ${students.slice(0, 6).map(student => {
                    const avg = window.Utils.round(window.Utils.average(window.Utils.gradesForStudent(student.id).map(window.Utils.computeGradeAverage)));
                    return `
                      <tr>
                        <td>${student.name}</td>
                        <td>${student.section}</td>
                        <td>${student.classIds.length}</td>
                        <td><span class="badge badge-success">${student.attendanceRate}%</span></td>
                        <td><span class="badge badge-primary">${avg || "N/A"}</span></td>
                      </tr>
                    `;
                  }).join("")}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div class="stack">
          <section class="record-panel">
            <div class="section-header"><div><h2>Quick Actions</h2><p class="section-subtitle">Common faculty tasks</p></div></div>
            <div class="inline-actions">
              <a class="btn btn-primary" href="#/teacher/grades">Add / Edit Grades</a>
              <a class="btn btn-secondary" href="#/teacher/announcements">Create Announcement</a>
              <a class="btn btn-secondary" href="#/teacher/student-records">View Records</a>
            </div>
          </section>

          <section class="record-panel">
            <div class="section-header"><div><h2>Announcement Feed</h2><p class="section-subtitle">Most recent published notices</p></div></div>
            <div class="feed-list">
              ${window.Utils.sortByDateDesc(activeAnnouncements).slice(0, 4).map(item => `
                <article class="feed-item">
                  <div class="feed-head">
                    <div>
                      <strong>${item.title}</strong>
                      <div class="feed-meta"><span>${window.Utils.formatDate(item.date)}</span><span>${item.target}</span></div>
                    </div>
                    <span class="badge badge-neutral">Notice</span>
                  </div>
                  <p>${item.message}</p>
                </article>
              `).join("")}
            </div>
          </section>
        </div>
      </section>
    `;
  }

  function renderProfile() {
    const teacher = getTeacher();
    const classes = getClasses(teacher);
    return `
      <section class="profile-layout">
        <aside class="profile-card profile-identity">
          <div class="profile-avatar-xl">${window.Utils.initials(teacher.name)}</div>
          <div>
            <h2>${teacher.name}</h2>
            <p class="muted">${teacher.department}</p>
          </div>
          <div class="profile-line-list">
            <div class="profile-line"><span>Teacher ID</span><strong>${teacher.id}</strong></div>
            <div class="profile-line"><span>Email</span><strong>${teacher.email}</strong></div>
            <div class="profile-line"><span>Contact</span><strong>${teacher.contact}</strong></div>
            <div class="profile-line"><span>Assigned Classes</span><strong>${classes.length}</strong></div>
          </div>
        </aside>

        <div class="stack">
          <section class="profile-card">
            <div class="section-header"><div><h2>Faculty Information</h2><p class="section-subtitle">Institution profile details</p></div></div>
            <div class="kv">
              <div class="kv-item"><span>Full Name</span><strong>${teacher.name}</strong></div>
              <div class="kv-item"><span>Teacher ID</span><strong>${teacher.id}</strong></div>
              <div class="kv-item"><span>Department</span><strong>${teacher.department}</strong></div>
              <div class="kv-item"><span>Email</span><strong>${teacher.email}</strong></div>
              <div class="kv-item"><span>Contact</span><strong>${teacher.contact}</strong></div>
              <div class="kv-item"><span>Status</span><strong>Active Faculty</strong></div>
            </div>
          </section>
          <section class="profile-card">
            <div class="section-header"><div><h2>Teaching Load</h2><p class="section-subtitle">Assigned classes this term</p></div></div>
            <div class="class-grid">${classes.map(classCard).join("")}</div>
          </section>
        </div>
      </section>
    `;
  }

  function renderClasses() {
    const teacher = getTeacher();
    const classes = getClasses(teacher);
    const query = (window.AppState.searchQuery || "").toLowerCase();
    const filtered = classes.filter(item => !query || [item.code, item.title, item.section, item.room].some(value => value.toLowerCase().includes(query)));

    return `
      <section class="hero-panel">
        <div class="hero-eyebrow">Classes</div>
        <h2>Assigned classes</h2>
        <p>Use this view to monitor class schedules, student volume, and course-level performance before opening detailed management pages.</p>
      </section>
      <section class="class-grid">${filtered.map(classCard).join("") || window.Utils.emptyState("No classes match the current search.")}</section>
    `;
  }

  function renderClassDetails(classId) {
    const teacher = getTeacher();
    if (!teacher.assignedClassIds.includes(classId)) return window.Utils.emptyState("This class is not assigned to the current teacher.");

    const classInfo = window.Utils.classById(classId);
    const students = studentsForClass(classId);
    const announcements = window.AppState.announcements.filter(item => item.target === "General" || item.target === classId);

    return `
      <section class="hero-surface">
        <div class="hero-panel">
          <div class="hero-eyebrow">${classInfo.code}</div>
          <h2>${classInfo.title}</h2>
          <p>${classInfo.section} • ${classInfo.schedule} • ${classInfo.room}</p>
          <div class="hero-strip">
            <span class="hero-chip">${students.length} Students</span>
            <span class="hero-chip">Class Average ${classAverage(classId) || "N/A"}</span>
          </div>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#/teacher/grades?classId=${classId}">Edit Grades</a>
          </div>
        </div>
        <section class="record-panel">
          <div class="section-header"><div><h3>Class Snapshot</h3><p class="section-subtitle">Quick overview</p></div></div>
          <div class="kv">
            <div class="kv-item"><span>Room</span><strong>${classInfo.room}</strong></div>
            <div class="kv-item"><span>Section</span><strong>${classInfo.section}</strong></div>
            <div class="kv-item"><span>Students</span><strong>${students.length}</strong></div>
            <div class="kv-item"><span>Average</span><strong>${classAverage(classId) || "N/A"}</strong></div>
          </div>
        </section>
      </section>

      <section class="split-grid">
        <div class="stack">
          <section class="table-shell">
            <div class="section-header"><div><h2>Roster and Grades</h2><p class="section-subtitle">Attendance view and current marks</p></div></div>
            <div class="table-wrap">
              <table class="table">
                <thead><tr><th>Student</th><th>Attendance</th><th>Prelim</th><th>Midterm</th><th>Final</th><th>Average</th></tr></thead>
                <tbody>
                  ${students.map(student => {
                    const grade = window.AppState.grades.find(entry => entry.studentId === student.id && entry.classId === classId);
                    return `
                      <tr>
                        <td>${student.name}</td>
                        <td>${student.attendanceRate}%</td>
                        <td>${grade?.prelim ?? "-"}</td>
                        <td>${grade?.midterm ?? "-"}</td>
                        <td>${grade?.final ?? "-"}</td>
                        <td>${grade ? `<span class="badge badge-success">${window.Utils.computeGradeAverage(grade)}</span>` : "-"}</td>
                      </tr>
                    `;
                  }).join("")}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        <aside class="stack">
          <section class="record-panel">
            <div class="section-header"><div><h2>Class Notices</h2><p class="section-subtitle">Visible announcements</p></div></div>
            <div class="feed-list">
              ${announcements.length ? announcements.map(item => `
                <article class="feed-item">
                  <div class="feed-head">
                    <strong>${item.title}</strong>
                    <span class="badge badge-neutral">${window.Utils.formatDate(item.date)}</span>
                  </div>
                  <p>${item.message}</p>
                </article>
              `).join("") : window.Utils.emptyState("No announcements for this class.")}
            </div>
          </section>
        </aside>
      </section>
    `;
  }

  function renderStudentRecords() {
    const teacher = getTeacher();
    const query = (window.AppState.searchQuery || "").toLowerCase();
    const rows = allTeacherStudents(teacher).filter(student => !query || [student.name, student.id, student.section, student.course].some(value => value.toLowerCase().includes(query)));

    return `
      <section class="record-summary">
        <section class="record-panel"><div class="muted">Visible Records</div><div class="record-value">${rows.length}</div></section>
        <section class="record-panel"><div class="muted">Average Attendance</div><div class="record-value">${window.Utils.round(window.Utils.average(rows.map(item => item.attendanceRate)))}%</div></section>
        <section class="record-panel"><div class="muted">Faculty Coverage</div><div class="record-value">${getClasses(teacher).length}</div></section>
      </section>

      <section class="table-shell">
        <div class="section-header"><div><h2>Student Records</h2><p class="section-subtitle">Searchable list of linked student records</p></div></div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Student</th><th>ID</th><th>Section</th><th>Classes</th><th>Attendance</th><th>Average</th></tr></thead>
            <tbody>
              ${rows.map(student => {
                const avg = window.Utils.round(window.Utils.average(window.Utils.gradesForStudent(student.id).map(window.Utils.computeGradeAverage)));
                return `
                  <tr>
                    <td>${student.name}</td>
                    <td>${student.id}</td>
                    <td>${student.section}</td>
                    <td>${student.classIds.length}</td>
                    <td><span class="badge badge-success">${student.attendanceRate}%</span></td>
                    <td><span class="badge badge-primary">${avg || "N/A"}</span></td>
                  </tr>
                `;
              }).join("") || `<tr><td colspan="6">No records found.</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderGrades() {
    const teacher = getTeacher();
    const classes = getClasses(teacher);
    const selectedClassId = window.AppState.gradeClassId || classes[0]?.id || "";
    const query = (window.AppState.searchQuery || "").toLowerCase();
    const students = selectedClassId ? studentsForClass(selectedClassId).filter(student => !query || [student.name, student.id, student.section].some(value => value.toLowerCase().includes(query))) : [];
    const selectedClass = selectedClassId ? window.Utils.classById(selectedClassId) : null;

    return `
      <section class="hero-panel">
        <div class="hero-eyebrow">Grade Management</div>
        <h2>Grade workspace</h2>
        <p>Maintain Prelim, Midterm, and Final records using one class-focused worksheet tied to the shared academic dataset.</p>
      </section>

      <section class="table-shell">
        <div class="workspace-toolbar">
          <div>
            <label class="muted small" for="gradeClassSelector">Select class</label>
            <select id="gradeClassSelector">
              ${classes.map(item => `<option value="${item.id}" ${item.id === selectedClassId ? "selected" : ""}>${item.code} • ${item.title}</option>`).join("")}
            </select>
          </div>
          <div class="muted small" style="display:flex;align-items:flex-end;">${selectedClass ? `${selectedClass.section} • ${selectedClass.schedule}` : "No class selected"}</div>
          <div class="inline-actions" style="justify-content:flex-end;align-items:flex-end;display:flex;">
            <button id="saveGradeChanges" class="btn btn-primary">Save Changes</button>
          </div>
        </div>

        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Student</th><th>Prelim</th><th>Midterm</th><th>Final</th><th>Average</th></tr></thead>
            <tbody>
              ${students.map(student => {
                const grade = window.AppState.grades.find(entry => entry.studentId === student.id && entry.classId === selectedClassId) || { prelim: "", midterm: "", final: "" };
                const average = grade.prelim !== "" && grade.midterm !== "" && grade.final !== "" ? window.Utils.computeGradeAverage(grade) : "—";
                return `
                  <tr data-grade-row="${student.id}">
                    <td>
                      <strong>${student.name}</strong>
                      <div class="muted small">${student.id} • ${student.section}</div>
                    </td>
                    <td><input data-grade-field="prelim" type="number" min="0" max="100" value="${grade.prelim}"></td>
                    <td><input data-grade-field="midterm" type="number" min="0" max="100" value="${grade.midterm}"></td>
                    <td><input data-grade-field="final" type="number" min="0" max="100" value="${grade.final}"></td>
                    <td><span class="badge badge-primary grade-average-cell">${average}</span></td>
                  </tr>
                `;
              }).join("") || `<tr><td colspan="5">No students found for this class.</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderAnnouncements() {
    const teacher = getTeacher();
    const classOptions = getClasses(teacher);
    const list = window.Utils.sortByDateDesc(window.AppState.announcements.filter(item => item.target === "General" || teacher.assignedClassIds.includes(item.target)));

    return `
      <section class="split-grid">
        <div class="stack">
          <section class="table-shell">
            <div class="section-header"><div><h2>Create Announcement</h2><p class="section-subtitle">Publish to a general audience or specific class</p></div></div>
            <form id="announcementForm">
              <div class="form-grid">
                <div>
                  <label class="muted small" for="announcementTitle">Title</label>
                  <input id="announcementTitle" type="text" required placeholder="Enter announcement title">
                </div>
                <div>
                  <label class="muted small" for="announcementTarget">Target</label>
                  <select id="announcementTarget">
                    <option value="General">General</option>
                    ${classOptions.map(item => `<option value="${item.id}">${item.code} • ${item.title}</option>`).join("")}
                  </select>
                </div>
                <div>
                  <label class="muted small" for="announcementDate">Date</label>
                  <input id="announcementDate" type="date" value="2026-04-01" required>
                </div>
                <div style="grid-column:1 / -1;">
                  <label class="muted small" for="announcementMessage">Message</label>
                  <textarea id="announcementMessage" required placeholder="Write the announcement message"></textarea>
                </div>
              </div>
              <div class="form-actions"><button class="btn btn-primary" type="submit">Publish Announcement</button></div>
            </form>
          </section>
        </div>

        <aside class="stack">
          <section class="record-panel">
            <div class="section-header"><div><h2>Published Feed</h2><p class="section-subtitle">Most recent notices</p></div></div>
            <div class="feed-list">
              ${list.map(item => `
                <article class="feed-item">
                  <div class="feed-head">
                    <div>
                      <strong>${item.title}</strong>
                      <div class="feed-meta"><span>${window.Utils.formatDate(item.date)}</span><span>${item.target}</span></div>
                    </div>
                    <button class="btn btn-ghost announcement-edit-btn" data-announcement-id="${item.id}">Edit</button>
                  </div>
                  <p>${item.message}</p>
                </article>
              `).join("")}
            </div>
          </section>
        </aside>
      </section>
    `;
  }

  function renderCalendar() {
    const calendar = window.Utils.calendarData(window.EVENTS, new Date("2026-04-01"));
    const cells = [];
    for (let i = 0; i < calendar.startWeekday; i++) cells.push('<div class="calendar-day is-empty"></div>');
    for (let day = 1; day <= calendar.totalDays; day++) {
      const events = calendar.eventsByDay[day] || [];
      cells.push(`
        <div class="calendar-day ${calendar.todayDay === day ? "is-today" : ""}">
          <div class="calendar-date">${day}</div>
          <div class="agenda-list">${events.map(event => `<div class="calendar-event-pill">${event.title}</div>`).join("")}</div>
        </div>
      `);
    }

    return `
      <div class="calendar-layout">
        <section class="calendar-shell">
          <div class="calendar-toolbar">
            <div class="calendar-title">
              <h2>${calendar.monthLabel}</h2>
              <p class="section-subtitle">Institution calendar</p>
            </div>
            <span class="badge badge-primary">Faculty View</span>
          </div>
          <div class="calendar-weekdays">${calendar.weekdays.map(day => `<div>${day}</div>`).join("")}</div>
          <div class="calendar-grid">${cells.join("")}</div>
        </section>
        <aside class="calendar-sidebar">
          <section class="record-panel">
            <div class="section-header"><div><h2>Agenda</h2><p class="section-subtitle">Scheduled academic events</p></div></div>
            <div class="agenda-list">
              ${window.Utils.sortByDateAsc(window.EVENTS).map(item => `
                <div class="calendar-agenda-item">
                  <div>
                    <strong>${item.title}</strong>
                    <div class="calendar-agenda-date">${window.Utils.formatDate(item.date)}</div>
                  </div>
                  <span class="badge badge-neutral">Event</span>
                </div>
              `).join("")}
            </div>
          </section>
        </aside>
      </div>
    `;
  }

  function bind(routeInfo) {
    const classSelector = document.getElementById("gradeClassSelector");
    if (classSelector) {
      classSelector.addEventListener("change", () => {
        window.AppState.gradeClassId = classSelector.value;
        location.hash = `#/teacher/grades?classId=${classSelector.value}`;
      });
    }

    const saveGradesBtn = document.getElementById("saveGradeChanges");
    if (saveGradesBtn) {
      saveGradesBtn.addEventListener("click", () => {
        const classId = window.AppState.gradeClassId || classSelector?.value;
        const rows = document.querySelectorAll("[data-grade-row]");
        const allGrades = [...window.AppState.grades];

        rows.forEach(row => {
          const studentId = row.dataset.gradeRow;
          const prelim = row.querySelector('[data-grade-field="prelim"]').value;
          const midterm = row.querySelector('[data-grade-field="midterm"]').value;
          const final = row.querySelector('[data-grade-field="final"]').value;
          const existingIndex = allGrades.findIndex(item => item.studentId === studentId && item.classId === classId);
          const payload = {
            studentId,
            classId,
            prelim: Number(prelim || 0),
            midterm: Number(midterm || 0),
            final: Number(final || 0)
          };

          if (existingIndex >= 0) allGrades[existingIndex] = payload;
          else allGrades.push(payload);
        });

        window.AppState.grades = allGrades;
        window.StorageManager.saveGrades(allGrades);
        window.App.render();
      });
    }

    document.querySelectorAll("[data-grade-row]").forEach(row => {
      const inputs = row.querySelectorAll("input[data-grade-field]");
      const avgCell = row.querySelector(".grade-average-cell");
      const updateAverage = () => {
        const values = [...inputs].map(input => Number(input.value || 0));
        const allBlank = [...inputs].every(input => input.value === "");
        avgCell.textContent = allBlank ? "—" : window.Utils.round((values[0] + values[1] + values[2]) / 3);
      };
      inputs.forEach(input => input.addEventListener("input", updateAverage));
    });

    const announcementForm = document.getElementById("announcementForm");
    if (announcementForm) {
      announcementForm.addEventListener("submit", event => {
        event.preventDefault();
        const title = document.getElementById("announcementTitle").value.trim();
        const target = document.getElementById("announcementTarget").value;
        const date = document.getElementById("announcementDate").value;
        const message = document.getElementById("announcementMessage").value.trim();
        const editingId = announcementForm.dataset.editingId;

        if (editingId) {
          window.AppState.announcements = window.AppState.announcements.map(item => item.id === editingId ? { ...item, title, target, date, message } : item);
          delete announcementForm.dataset.editingId;
        } else {
          window.AppState.announcements.unshift({
            id: `ANN-${Date.now()}`,
            title,
            target,
            date,
            message
          });
        }

        window.StorageManager.saveAnnouncements(window.AppState.announcements);
        window.App.render();
      });
    }

    document.querySelectorAll(".announcement-edit-btn").forEach(button => {
      button.addEventListener("click", () => {
        const announcement = window.AppState.announcements.find(item => item.id === button.dataset.announcementId);
        if (!announcement) return;
        document.getElementById("announcementTitle").value = announcement.title;
        document.getElementById("announcementTarget").value = announcement.target;
        document.getElementById("announcementDate").value = announcement.date;
        document.getElementById("announcementMessage").value = announcement.message;
        document.getElementById("announcementForm").dataset.editingId = announcement.id;
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function render(routeInfo) {
    switch (routeInfo.name) {
      case "profile":
        return renderProfile();
      case "classes":
        return routeInfo.classId ? renderClassDetails(routeInfo.classId) : renderClasses();
      case "student-records":
        return renderStudentRecords();
      case "grades":
        return renderGrades();
      case "announcements":
        return renderAnnouncements();
      case "calendar":
        return renderCalendar();
      default:
        return renderDashboard();
    }
  }

  return { render, bind, getPageTitle };
})();

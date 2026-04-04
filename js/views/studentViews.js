window.StudentViews = (() => {
  function getStudent() {
    return window.Utils.studentById(window.AppState.session.userId);
  }

  function getClasses(student) {
    return window.CLASSES.filter(item => student.classIds.includes(item.id));
  }

  function studentAverage(studentId) {
    const grades = window.Utils.gradesForStudent(studentId);
    return window.Utils.round(window.Utils.average(grades.map(window.Utils.computeGradeAverage)));
  }

  function recentAnnouncements(student, limit = 4) {
    return window.Utils.sortByDateDesc(window.Utils.announcementsForStudent(student)).slice(0, limit);
  }

  function upcomingEvents(limit = 5) {
    return window.Utils.sortByDateAsc(window.EVENTS).slice(0, limit);
  }

  function studentClassCard(student, item) {
    const teacher = window.Utils.teacherById(item.teacherId);
    const grade = window.AppState.grades.find(entry => entry.studentId === student.id && entry.classId === item.id);
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
          <div>${teacher.name}</div>
          <div>${item.schedule}</div>
          <div>${item.room}</div>
        </div>
        <div class="class-card-footer">
          ${grade ? `<span class="badge badge-success">Avg ${window.Utils.computeGradeAverage(grade)}</span>` : `<span class="badge badge-neutral">No grade posted</span>`}
          <a class="btn btn-secondary" href="#/student/classes/${item.id}">Open Class</a>
        </div>
      </article>
    `;
  }

  function calendarLayout() {
    const calendar = window.Utils.calendarData(window.EVENTS, new Date("2026-04-01"));
    const cells = [];
    for (let i = 0; i < calendar.startWeekday; i++) {
      cells.push('<div class="calendar-day is-empty"></div>');
    }
    for (let day = 1; day <= calendar.totalDays; day++) {
      const events = calendar.eventsByDay[day] || [];
      cells.push(`
        <div class="calendar-day ${calendar.todayDay === day ? "is-today" : ""}">
          <div class="calendar-date">${day}</div>
          <div class="agenda-list">
            ${events.map(event => `<div class="calendar-event-pill" title="${window.Utils.safeText(event.description)}">${window.Utils.safeText(event.title)}</div>`).join("")}
          </div>
        </div>
      `);
    }

    return `
      <div class="calendar-layout">
        <section class="calendar-shell">
          <div class="calendar-toolbar">
            <div class="calendar-title">
              <h2>${calendar.monthLabel}</h2>
              <p class="section-subtitle">Academic event calendar</p>
            </div>
            <span class="badge badge-primary">Monthly View</span>
          </div>
          <div class="calendar-weekdays">${calendar.weekdays.map(day => `<div>${day}</div>`).join("")}</div>
          <div class="calendar-grid">${cells.join("")}</div>
        </section>
        <aside class="calendar-sidebar">
          <section class="record-panel">
            <div class="section-header"><div><h3>Agenda</h3><p class="section-subtitle">Scheduled items this month</p></div></div>
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

  function getPageTitle(name) {
    const map = {
      dashboard: "Student Dashboard",
      profile: "My Profile",
      classes: "My Classes",
      grades: "My Grades",
      announcements: "Announcements",
      calendar: "Calendar"
    };
    return map[name] || "Student Dashboard";
  }

  function renderDashboard() {
    const student = getStudent();
    const classes = getClasses(student);
    const gradeRecords = window.Utils.gradesForStudent(student.id);
    const averageGrade = studentAverage(student.id);
    const events = upcomingEvents(4);
    const announcements = recentAnnouncements(student, 3);

    return `
      <section class="hero-surface">
        <div class="hero-panel">
          <div class="hero-eyebrow">Academic Overview</div>
          <h2>Welcome back, ${student.name.split(" ")[0]}.</h2>
          <p>Your current academic snapshot highlights class load, term standing, attendance, and upcoming campus dates.</p>
          <div class="hero-strip">
            <span class="hero-chip">${student.course}</span>
            <span class="hero-chip">${student.section}</span>
            <span class="hero-chip">Attendance ${student.attendanceRate}%</span>
          </div>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#/student/grades">View Grades</a>
            <a class="btn btn-secondary" href="#/student/classes">Open Classes</a>
          </div>
        </div>
        <section class="record-panel">
          <div class="section-header"><div><h3>Upcoming Deadline Window</h3><p class="section-subtitle">Next scheduled activities</p></div></div>
          <div class="agenda-list">
            ${events.map(item => `
              <div class="calendar-agenda-item">
                <div>
                  <strong>${item.title}</strong>
                  <div class="calendar-agenda-date">${window.Utils.formatDate(item.date)}</div>
                </div>
                <span class="badge badge-warning">Scheduled</span>
              </div>
            `).join("")}
          </div>
        </section>
      </section>

      <section class="metric-grid">
        ${window.Utils.metricCard("Enrolled Classes", classes.length, "Current academic load")}
        ${window.Utils.metricCard("Average Grade", averageGrade || "N/A", "Across posted subjects")}
        ${window.Utils.metricCard("Attendance Rate", `${student.attendanceRate}%`, "Display-only summary")}
        ${window.Utils.metricCard("New Announcements", announcements.length, "Latest visible updates")}
      </section>

      <section class="dashboard-grid">
        <div class="stack">
          <section class="card">
            <div class="section-header">
              <div><h2>Current Classes</h2><p class="section-subtitle">Your enrolled subjects this term</p></div>
              <a href="#/student/classes" class="btn btn-secondary">See All</a>
            </div>
            <div class="class-grid">${classes.map(item => studentClassCard(student, item)).join("")}</div>
          </section>

          <section class="table-shell">
            <div class="section-header"><div><h2>Grade Digest</h2><p class="section-subtitle">Recent academic performance by subject</p></div></div>
            <div class="table-wrap">
              <table class="table">
                <thead><tr><th>Subject</th><th>Prelim</th><th>Midterm</th><th>Final</th><th>Average</th></tr></thead>
                <tbody>
                  ${gradeRecords.map(record => {
                    const classInfo = window.Utils.classById(record.classId);
                    return `
                      <tr>
                        <td>${classInfo.code} • ${classInfo.title}</td>
                        <td>${record.prelim}</td>
                        <td>${record.midterm}</td>
                        <td>${record.final}</td>
                        <td><span class="badge badge-success">${window.Utils.computeGradeAverage(record)}</span></td>
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
            <div class="section-header"><div><h2>Attendance</h2><p class="section-subtitle">View-only attendance standing</p></div></div>
            <div class="progress-track"><div class="progress-fill" style="width:${student.attendanceRate}%"></div></div>
            <div class="muted small" style="margin-top:0.7rem">Attendance rate currently recorded at ${student.attendanceRate}%.</div>
          </section>

          <section class="record-panel">
            <div class="section-header"><div><h2>Announcement Feed</h2><p class="section-subtitle">General and class-specific posts</p></div></div>
            <div class="feed-list">
              ${announcements.map(item => `
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
    const student = getStudent();
    const classes = getClasses(student);
    return `
      <section class="profile-layout">
        <aside class="profile-card profile-identity">
          <div class="profile-avatar-xl">${window.Utils.initials(student.name)}</div>
          <div>
            <h2>${student.name}</h2>
            <p class="muted">${student.course}</p>
          </div>
          <div class="profile-line-list">
            <div class="profile-line"><span>Student ID</span><strong>${student.id}</strong></div>
            <div class="profile-line"><span>Section</span><strong>${student.section}</strong></div>
            <div class="profile-line"><span>Attendance Rate</span><strong>${student.attendanceRate}%</strong></div>
            <div class="profile-line"><span>Active Classes</span><strong>${classes.length}</strong></div>
          </div>
        </aside>

        <div class="stack">
          <section class="profile-card">
            <div class="section-header"><div><h2>Personal Information</h2><p class="section-subtitle">Academic identity and contact details</p></div></div>
            <div class="kv">
              <div class="kv-item"><span>Full Name</span><strong>${student.name}</strong></div>
              <div class="kv-item"><span>Student ID</span><strong>${student.id}</strong></div>
              <div class="kv-item"><span>Course</span><strong>${student.course}</strong></div>
              <div class="kv-item"><span>Section</span><strong>${student.section}</strong></div>
              <div class="kv-item"><span>Email</span><strong>${student.email}</strong></div>
              <div class="kv-item"><span>Contact</span><strong>${student.contact}</strong></div>
              <div class="kv-item"><span>Address</span><strong>${student.address}</strong></div>
              <div class="kv-item"><span>Status</span><strong>Active</strong></div>
            </div>
          </section>

          <section class="profile-card">
            <div class="section-header"><div><h2>Academic Load</h2><p class="section-subtitle">Enrolled classes for the current term</p></div></div>
            <div class="class-grid">${classes.map(item => studentClassCard(student, item)).join("")}</div>
          </section>
        </div>
      </section>
    `;
  }

  function renderClasses() {
    const student = getStudent();
    const classes = getClasses(student);
    return `
      <section class="hero-panel">
        <div class="hero-eyebrow">Classes</div>
        <h2>My enrolled subjects</h2>
        <p>Browse class schedules, assigned teachers, current room assignments, and quick grade standing per subject.</p>
      </section>
      <section class="class-grid">${classes.map(item => studentClassCard(student, item)).join("")}</section>
    `;
  }

  function renderClassDetails(classId) {
    const student = getStudent();
    if (!student.classIds.includes(classId)) return window.Utils.emptyState("This class is not available for the selected student.");
    const classInfo = window.Utils.classById(classId);
    const teacher = window.Utils.teacherById(classInfo.teacherId);
    const grade = window.AppState.grades.find(record => record.studentId === student.id && record.classId === classId);
    const announcements = window.AppState.announcements.filter(item => item.target === "General" || item.target === classId);

    return `
      <section class="hero-surface">
        <div class="hero-panel">
          <div class="hero-eyebrow">${classInfo.code}</div>
          <h2>${classInfo.title}</h2>
          <p>${teacher.name} • ${classInfo.schedule} • ${classInfo.room}</p>
          <div class="hero-strip">
            <span class="hero-chip">${classInfo.section}</span>
            <span class="hero-chip">Attendance ${student.attendanceRate}%</span>
            ${grade ? `<span class="hero-chip">Current Average ${window.Utils.computeGradeAverage(grade)}</span>` : ""}
          </div>
        </div>
        <section class="record-panel">
          <div class="section-header"><div><h3>Grade Status</h3><p class="section-subtitle">Current record for this subject</p></div></div>
          ${grade ? `<div class="record-value">${window.Utils.computeGradeAverage(grade)}</div><div class="muted small">Subject average based on posted grades.</div>` : `<div class="muted">No grades posted yet.</div>`}
        </section>
      </section>

      <section class="split-grid">
        <div class="stack">
          <section class="table-shell">
            <div class="section-header"><div><h2>Grade Breakdown</h2><p class="section-subtitle">Prelim, Midterm, and Final</p></div></div>
            ${grade ? `
              <div class="table-wrap">
                <table class="table">
                  <thead><tr><th>Prelim</th><th>Midterm</th><th>Final</th><th>Average</th></tr></thead>
                  <tbody><tr><td>${grade.prelim}</td><td>${grade.midterm}</td><td>${grade.final}</td><td><span class="badge badge-success">${window.Utils.computeGradeAverage(grade)}</span></td></tr></tbody>
                </table>
              </div>
            ` : window.Utils.emptyState("No grades available for this class.")}
          </section>
        </div>
        <aside class="stack">
          <section class="record-panel">
            <div class="section-header"><div><h2>Class Facts</h2><p class="section-subtitle">Subject information</p></div></div>
            <div class="kv">
              <div class="kv-item"><span>Teacher</span><strong>${teacher.name}</strong></div>
              <div class="kv-item"><span>Schedule</span><strong>${classInfo.schedule}</strong></div>
              <div class="kv-item"><span>Room</span><strong>${classInfo.room}</strong></div>
              <div class="kv-item"><span>Section</span><strong>${classInfo.section}</strong></div>
            </div>
          </section>
          <section class="record-panel">
            <div class="section-header"><div><h2>Class Notices</h2><p class="section-subtitle">General and class-specific updates</p></div></div>
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

  function renderGrades() {
    const student = getStudent();
    const grades = window.Utils.gradesForStudent(student.id);
    const overallAverage = studentAverage(student.id);
    return `
      <section class="hero-panel">
        <div class="hero-eyebrow">Grades</div>
        <h2>My academic results</h2>
        <p>Review term performance by subject with a fixed grading structure of Prelim, Midterm, and Final.</p>
        <div class="hero-strip"><span class="hero-chip">Overall Average ${overallAverage || "N/A"}</span></div>
      </section>
      <section class="table-shell">
        <div class="section-header"><div><h2>Grade Table</h2><p class="section-subtitle">Posted subject grades</p></div></div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Subject</th><th>Prelim</th><th>Midterm</th><th>Final</th><th>Average</th></tr></thead>
            <tbody>
              ${grades.map(record => {
                const classInfo = window.Utils.classById(record.classId);
                return `
                  <tr>
                    <td>${classInfo.code} • ${classInfo.title}</td>
                    <td>${record.prelim}</td>
                    <td>${record.midterm}</td>
                    <td>${record.final}</td>
                    <td><span class="badge badge-primary">${window.Utils.computeGradeAverage(record)}</span></td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderAnnouncements() {
    const student = getStudent();
    const list = window.Utils.sortByDateDesc(window.Utils.announcementsForStudent(student));
    return `
      <section class="hero-panel">
        <div class="hero-eyebrow">Announcements</div>
        <h2>Academic notice feed</h2>
        <p>Announcements visible to your classes and general academic audience are listed in reverse chronological order.</p>
      </section>
      <section class="timeline">
        ${list.map(item => `
          <article class="timeline-item">
            <div class="timeline-head">
              <div>
                <h3>${item.title}</h3>
                <div class="feed-meta"><span>${window.Utils.formatDate(item.date)}</span><span>Target: ${item.target}</span></div>
              </div>
              <span class="badge badge-neutral">Update</span>
            </div>
            <p>${item.message}</p>
          </article>
        `).join("")}
      </section>
    `;
  }

  function renderCalendar() {
    return calendarLayout();
  }

  function render(routeInfo) {
    switch (routeInfo.name) {
      case "profile":
        return renderProfile();
      case "classes":
        return routeInfo.classId ? renderClassDetails(routeInfo.classId) : renderClasses();
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

  return { render, getPageTitle };
})();

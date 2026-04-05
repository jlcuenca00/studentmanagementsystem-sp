window.StudentViews = (() => {
    function getStudent() {
        return window.Utils.studentById(window.AppState.session.userId);
    }

    function getClasses(student) {
        return window.CLASSES.filter((item) =>
            student.classIds.includes(item.id),
        );
    }

    function studentAverage(studentId) {
        const grades = window.Utils.gradesForStudent(studentId);
        return window.Utils.round(
            window.Utils.average(grades.map(window.Utils.computeGradeAverage)),
        );
    }

    function recentAnnouncements(student, limit = 4) {
        return window.Utils.sortByDateDesc(
            window.Utils.announcementsForStudent(student),
        ).slice(0, limit);
    }

    function upcomingEvents(limit = 5) {
        return window.Utils.sortByDateAsc(window.EVENTS).slice(0, limit);
    }

    function studentClassCard(student, item) {
        const teacher = window.Utils.teacherById(item.teacherId);
        const grade = window.AppState.grades.find(
            (entry) =>
                entry.studentId === student.id && entry.classId === item.id,
        );
        return `
      <article class="class-card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
        <div class="class-card-top" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <div>
            <div class="course-code" style="margin-bottom: 0.25rem;">${item.code}</div>
            <h3 style="margin: 0;">${item.title}</h3>
          </div>
          <span class="badge badge-primary">${item.section}</span>
        </div>
        <div class="class-meta-list" style="display: grid; gap: 0.5rem; margin-bottom: 1rem;">
          <div>${teacher.name}</div>
          <div>${item.schedule}</div>
          <div>${item.room}</div>
        </div>
        <div class="class-card-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--line-soft); margin-top: auto;">
          ${grade ? `<span class="badge badge-success">Avg ${window.Utils.computeGradeAverage(grade)}</span>` : `<span class="badge badge-neutral">No grade</span>`}
          <a class="btn btn-secondary" href="#/student/classes/${item.id}">Open Class</a>
        </div>
      </article>
    `;
    }

    function calendarLayout() {
        const calendar = window.Utils.calendarData(window.EVENTS);
        const cells = [];
        for (let i = 0; i < calendar.startWeekday; i++)
            cells.push('<div class="calendar-day is-empty"></div>');
        for (let day = 1; day <= calendar.totalDays; day++) {
            const events = calendar.eventsByDay[day] || [];
            cells.push(`
        <div class="calendar-day ${calendar.todayDay === day ? "is-today" : ""}">
          <div class="calendar-date" style="margin-bottom: 0.5rem;">${day}</div>
          <div class="agenda-list" style="display: grid; gap: 0.4rem;">
            ${events.map((event) => `<div class="calendar-event-pill" title="${window.Utils.safeText(event.description)}">${window.Utils.safeText(event.title)}</div>`).join("")}
          </div>
        </div>
      `);
        }

        return `
      <div class="calendar-layout" style="display: grid; gap: 2rem;">
        <section class="calendar-shell">
          <div class="calendar-toolbar" style="padding: 1.5rem;">
            <div class="calendar-title" style="margin-bottom: 0.5rem;"><h2>${calendar.monthLabel}</h2><p class="section-subtitle">Academic event calendar</p></div>
            <span class="badge badge-primary">Monthly View</span>
          </div>
          <div class="calendar-weekdays">${calendar.weekdays.map((day) => `<div>${day}</div>`).join("")}</div>
          <div class="calendar-grid">${cells.join("")}</div>
        </section>
        <aside class="calendar-sidebar">
          <section class="record-panel" style="padding: 1.5rem;">
            <div class="section-header" style="margin-bottom: 1.5rem;"><div><h3 style="margin-bottom: 0.25rem;">Agenda</h3><p class="section-subtitle">Scheduled items</p></div></div>
            <div class="agenda-list" style="display: grid; gap: 1rem;">
              ${window.Utils.sortByDateAsc(window.EVENTS)
                  .map(
                      (item) => `
                <div class="calendar-agenda-item" style="padding: 1rem; margin-bottom: 0;">
                  <div>
                    <strong style="display: block; margin-bottom: 0.25rem;">${item.title}</strong>
                    <div class="calendar-agenda-date">${window.Utils.formatDate(item.date)}</div>
                  </div>
                  <span class="badge badge-neutral">Event</span>
                </div>
              `,
                  )
                  .join("")}
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
            calendar: "Calendar",
        };
        return map[name] || "Student Dashboard";
    }

    function renderDashboard() {
        const student = getStudent();
        const classes = getClasses(student);
        const gradeRecords = window.Utils.gradesForStudent(student.id);
        const averageGrade = studentAverage(student.id);
        const events = upcomingEvents(5);
        const announcements = recentAnnouncements(student, 3);

        return `
      <style>
        .top-layout { display: grid; grid-template-columns: repeat(4, 1fr) minmax(300px, 350px); gap: 1.5rem; margin-bottom: 2rem; }
        .tl-hero { grid-area: 1 / 1 / 2 / 5; margin-bottom: 0 !important; }
        .tl-agenda { grid-area: 1 / 5 / 3 / 6; }
        .tl-m1 { grid-area: 2 / 1 / 3 / 2; }
        .tl-m2 { grid-area: 2 / 2 / 3 / 3; }
        .tl-m3 { grid-area: 2 / 3 / 3 / 4; }
        .tl-m4 { grid-area: 2 / 4 / 3 / 5; }
        .tl-agenda .record-panel { height: 100%; display: flex; flex-direction: column; margin-bottom: 0; }
        .tl-agenda .agenda-list { overflow-y: auto; flex-grow: 1; padding-right: 0.5rem; scrollbar-width: thin; }
        /* Equal height fix for metric cards */
        .tl-m1 > *, .tl-m2 > *, .tl-m3 > *, .tl-m4 > * { height: 100%; display: flex; flex-direction: column; justify-content: center; margin-bottom: 0; }
        @media (max-width: 1200px) {
          .top-layout { grid-template-columns: repeat(2, 1fr); }
          .tl-hero { grid-area: auto; grid-column: 1 / -1; }
          .tl-agenda { grid-area: auto; grid-column: 1 / -1; height: 350px; }
          .tl-m1, .tl-m2, .tl-m3, .tl-m4 { grid-area: auto; grid-column: auto; }
        }
      </style>

      <div class="top-layout">
        <div class="hero-panel tl-hero" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: center;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1.5rem;">
            <div>
              <div class="hero-eyebrow" style="margin-bottom: 0.25rem;">Academic Overview</div>
              <h2 style="margin-bottom: 1rem;">Welcome back, ${student.name.split(" ")[0]}.</h2>
              <div class="hero-strip" style="gap: 0.5rem; margin-bottom: 0;">
                <span class="hero-chip">${student.course}</span>
                <span class="hero-chip">${student.section}</span>
                <span class="hero-chip">Attendance ${student.attendanceRate}%</span>
              </div>
            </div>
            <div class="hero-actions" style="display: flex; gap: 0.5rem; align-self: flex-end;">
              <a class="btn" href="#/student/classes" style="background: rgba(255,255,255,0.2); color: #fff; padding: 0.5rem 1rem;">Classes</a>
              <a class="btn btn-primary" href="#/student/grades" style="padding: 0.5rem 1rem; background: #fff; color: var(--accent);">Grades</a>
            </div>
          </div>
        </div>

        <div class="tl-agenda">
          <section class="record-panel" style="padding: 1.5rem;">
            <div class="section-header" style="margin-bottom: 1rem; padding-bottom: 0.5rem;"><div><h3 style="margin-bottom: 0;">Upcoming Deadlines</h3></div></div>
            <div class="agenda-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${events
                  .map(
                      (item) => `
                <div class="calendar-agenda-item" style="padding: 0.75rem 1rem; margin-bottom: 0; align-items: center;">
                  <div>
                    <strong style="display: block; margin-bottom: 0.1rem; font-size: 0.9rem;">${item.title}</strong>
                    <div class="calendar-agenda-date" style="font-size: 0.8rem;">${window.Utils.formatDate(item.date)}</div>
                  </div>
                  <span class="badge badge-warning" style="font-size: 0.65rem;">Event</span>
                </div>
              `,
                  )
                  .join("")}
            </div>
          </section>
        </div>

        <div class="tl-m1">${window.Utils.metricCard("Enrolled Classes", classes.length, "Current academic load")}</div>
        <div class="tl-m2">${window.Utils.metricCard("Average Grade", averageGrade || "N/A", "Across posted subjects")}</div>
        <div class="tl-m3">${window.Utils.metricCard("Attendance Rate", `${student.attendanceRate}%`, "Display-only summary")}</div>
        <div class="tl-m4">${window.Utils.metricCard("New Announcements", announcements.length, "Latest visible updates")}</div>
      </div>

      <section class="dashboard-grid">
        <div class="stack" style="gap: 2rem;">
          <section class="card" style="padding: 1.5rem;">
            <div class="section-header" style="margin-bottom: 1.5rem;">
              <div><h2 style="margin-bottom: 0.25rem;">Current Classes</h2><p class="section-subtitle">Your enrolled subjects this term</p></div>
              <a href="#/student/classes" class="btn btn-secondary">See All</a>
            </div>
            <div class="class-grid" style="gap: 1.5rem;">${classes.map((item) => studentClassCard(student, item)).join("")}</div>
          </section>

          <section class="table-shell" style="padding: 1.5rem;">
            <div class="section-header" style="margin-bottom: 1.5rem;"><div><h2 style="margin-bottom: 0.25rem;">Grade Digest</h2><p class="section-subtitle">Recent academic performance by subject</p></div></div>
            <div class="table-wrap">
              <table class="table">
                <thead><tr><th>Subject</th><th>Prelim</th><th>Midterm</th><th>Final</th><th>Average</th></tr></thead>
                <tbody>
                  ${gradeRecords
                      .map((record) => {
                          const classInfo = window.Utils.classById(
                              record.classId,
                          );
                          return `
                      <tr>
                        <td>${classInfo.code} • ${classInfo.title}</td>
                        <td>${record.prelim}</td>
                        <td>${record.midterm}</td>
                        <td>${record.final}</td>
                        <td><span class="badge badge-success">${window.Utils.computeGradeAverage(record)}</span></td>
                      </tr>
                    `;
                      })
                      .join("")}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div class="stack" style="gap: 2rem;">
          <section class="record-panel" style="padding: 1.5rem;">
            <div class="section-header" style="margin-bottom: 1.5rem;"><div><h2 style="margin-bottom: 0.25rem;">Attendance</h2><p class="section-subtitle">View-only attendance standing</p></div></div>
            <div class="progress-track" style="margin-bottom: 1rem; height: 8px; background: var(--line-soft); border-radius: 4px; overflow: hidden;"><div class="progress-fill" style="width:${student.attendanceRate}%; background: var(--accent); height: 100%;"></div></div>
            <div class="muted small">Attendance rate currently recorded at ${student.attendanceRate}%.</div>
          </section>

          <section class="record-panel" style="padding: 1.5rem;">
            <div class="section-header" style="margin-bottom: 1.5rem;"><div><h2 style="margin-bottom: 0.25rem;">Announcement Feed</h2><p class="section-subtitle">General and class-specific posts</p></div></div>
            <div class="feed-list" style="display: grid; gap: 1rem;">
              ${announcements
                  .map(
                      (item) => `
                <article class="feed-item" style="padding: 1.25rem; margin-bottom: 0;">
                  <div class="feed-head" style="margin-bottom: 0.75rem;">
                    <div>
                      <strong style="display: block; margin-bottom: 0.25rem;">${item.title}</strong>
                      <div class="feed-meta" style="display: flex; gap: 1rem;"><span>${window.Utils.formatDate(item.date)}</span><span>${item.target}</span></div>
                    </div>
                    <span class="badge badge-neutral">Notice</span>
                  </div>
                  <p style="margin-top: 0.5rem; font-size: 0.95rem;">${item.message}</p>
                </article>
              `,
                  )
                  .join("")}
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
      <section class="profile-layout" style="display: grid; gap: 2rem;">
        <aside class="profile-card profile-identity" style="padding: 2rem; text-align: center;">
          <div class="profile-avatar-xl" style="margin: 0 auto 1.5rem auto;">${window.Utils.initials(student.name)}</div>
          <div style="margin-bottom: 2rem;">
            <h2 style="margin-bottom: 0.5rem;">${student.name}</h2>
            <p class="muted">${student.course}</p>
          </div>
          <div class="profile-line-list" style="display: grid; gap: 1rem; text-align: left;">
            <div class="profile-line" style="display: flex; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--line-soft);"><span>Student ID</span><strong>${student.id}</strong></div>
            <div class="profile-line" style="display: flex; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--line-soft);"><span>Section</span><strong>${student.section}</strong></div>
            <div class="profile-line" style="display: flex; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--line-soft);"><span>Attendance</span><strong>${student.attendanceRate}%</strong></div>
            <div class="profile-line" style="display: flex; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--line-soft);"><span>Active Classes</span><strong>${classes.length}</strong></div>
          </div>
        </aside>

        <div class="stack" style="gap: 2rem;">
          <section class="profile-card" style="padding: 2rem;">
            <div class="section-header" style="margin-bottom: 2rem;"><div><h2 style="margin-bottom: 0.5rem;">Personal Information</h2><p class="section-subtitle">Academic identity and contact details</p></div></div>
            <div class="kv" style="display: grid; gap: 1.5rem;">
              <div class="kv-item" style="padding: 1.25rem;"><span>Full Name</span><strong style="display: block; margin-top: 0.5rem;">${student.name}</strong></div>
              <div class="kv-item" style="padding: 1.25rem;"><span>Student ID</span><strong style="display: block; margin-top: 0.5rem;">${student.id}</strong></div>
              <div class="kv-item" style="padding: 1.25rem;"><span>Course</span><strong style="display: block; margin-top: 0.5rem;">${student.course}</strong></div>
              <div class="kv-item" style="padding: 1.25rem;"><span>Section</span><strong style="display: block; margin-top: 0.5rem;">${student.section}</strong></div>
              <div class="kv-item" style="padding: 1.25rem;"><span>Email</span><strong style="display: block; margin-top: 0.5rem;">${student.email}</strong></div>
              <div class="kv-item" style="padding: 1.25rem;"><span>Contact</span><strong style="display: block; margin-top: 0.5rem;">${student.contact}</strong></div>
              <div class="kv-item" style="padding: 1.25rem;"><span>Address</span><strong style="display: block; margin-top: 0.5rem;">${student.address}</strong></div>
              <div class="kv-item" style="padding: 1.25rem;"><span>Status</span><strong style="display: block; margin-top: 0.5rem; color: var(--success);">Active</strong></div>
            </div>
          </section>
        </div>
      </section>
    `;
    }

    function renderClasses() {
        const student = getStudent();
        const classes = getClasses(student);
        return `
      <section class="hero-panel" style="margin-bottom: 1.5rem; padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div class="hero-eyebrow" style="margin-bottom: 0.15rem;">Classes</div>
          <h2 style="margin: 0;">My Enrolled Subjects</h2>
        </div>
      </section>
      <section class="class-grid" style="gap: 1.5rem;">${classes.map((item) => studentClassCard(student, item)).join("")}</section>
    `;
    }

    function renderClassDetails(classId) {
        const student = getStudent();
        if (!student.classIds.includes(classId))
            return window.Utils.emptyState(
                "This class is not available for the selected student.",
            );
        const classInfo = window.Utils.classById(classId);
        const teacher = window.Utils.teacherById(classInfo.teacherId);
        const grade = window.AppState.grades.find(
            (record) =>
                record.studentId === student.id && record.classId === classId,
        );
        const announcements = window.AppState.announcements.filter(
            (item) => item.target === "General" || item.target === classId,
        );

        return `
      <section class="hero-surface" style="margin-bottom: 1.5rem; align-items: stretch;">
        <div class="hero-panel" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: center;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div>
              <div class="hero-eyebrow" style="margin-bottom: 0.25rem;">${classInfo.code}</div>
              <h2 style="margin-bottom: 0.25rem;">${classInfo.title}</h2>
              <div style="font-size: 0.9rem; opacity: 0.9;">${teacher.name} • ${classInfo.schedule} • ${classInfo.room}</div>
            </div>
          </div>
          <div class="hero-strip" style="gap: 0.5rem; margin: 0;">
            <span class="hero-chip">${classInfo.section}</span>
            <span class="hero-chip">Attendance ${student.attendanceRate}%</span>
          </div>
        </div>
        <section class="record-panel" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: center;">
          <div class="section-header" style="margin-bottom: 1rem; padding-bottom: 0.5rem;"><div><h3 style="margin-bottom: 0;">Grade Status</h3></div></div>
          ${grade ? `<div class="record-value" style="font-size: 2.5rem; font-weight: 800; margin-bottom: 0.25rem; color: var(--accent);">${window.Utils.computeGradeAverage(grade)}</div><div class="muted small">Current subject average.</div>` : `<div class="muted">No grades posted yet.</div>`}
        </section>
      </section>

      <section class="split-grid" style="gap: 2rem;">
        <div class="stack" style="gap: 2rem;">
          <section class="table-shell" style="padding: 1.5rem;">
            <div class="section-header" style="margin-bottom: 1.5rem;"><div><h2 style="margin-bottom: 0.25rem;">Grade Breakdown</h2><p class="section-subtitle">Prelim, Midterm, and Final</p></div></div>
            ${
                grade
                    ? `
              <div class="table-wrap">
                <table class="table">
                  <thead><tr><th>Prelim</th><th>Midterm</th><th>Final</th><th>Average</th></tr></thead>
                  <tbody><tr><td>${grade.prelim}</td><td>${grade.midterm}</td><td>${grade.final}</td><td><span class="badge badge-success">${window.Utils.computeGradeAverage(grade)}</span></td></tr></tbody>
                </table>
              </div>
            `
                    : window.Utils.emptyState(
                          "No grades available for this class.",
                      )
            }
          </section>
        </div>
        <aside class="stack" style="gap: 2rem;">
          <section class="record-panel" style="padding: 1.5rem;">
            <div class="section-header" style="margin-bottom: 1.5rem;"><div><h2 style="margin-bottom: 0.25rem;">Class Notices</h2><p class="section-subtitle">Updates</p></div></div>
            <div class="feed-list" style="display: grid; gap: 1rem;">
              ${
                  announcements.length
                      ? announcements
                            .map(
                                (item) => `
                <article class="feed-item" style="padding: 1rem; margin-bottom: 0;">
                  <div class="feed-head" style="margin-bottom: 0.5rem;"><strong style="display: block;">${item.title}</strong><span class="badge badge-neutral">${window.Utils.formatDate(item.date)}</span></div>
                  <p style="margin-top: 0.5rem; font-size: 0.95rem;">${item.message}</p>
                </article>
              `,
                            )
                            .join("")
                      : window.Utils.emptyState(
                            "No announcements for this class.",
                        )
              }
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
      <section class="hero-panel" style="margin-bottom: 1.5rem; padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div class="hero-eyebrow" style="margin-bottom: 0.15rem;">Grades</div>
          <h2 style="margin: 0;">My Academic Results</h2>
        </div>
        <div class="hero-strip" style="margin: 0;"><span class="hero-chip" style="font-size: 1rem;">Overall Average: <strong>${overallAverage || "N/A"}</strong></span></div>
      </section>
      <section class="table-shell" style="padding: 1.5rem;">
        <div class="section-header" style="margin-bottom: 1.5rem;"><div><h2 style="margin-bottom: 0.25rem;">Grade Table</h2><p class="section-subtitle">Posted subject grades</p></div></div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Subject</th><th>Prelim</th><th>Midterm</th><th>Final</th><th>Average</th></tr></thead>
            <tbody>
              ${grades
                  .map((record) => {
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
                  })
                  .join("")}
            </tbody>
          </table>
        </div>
      </section>
    `;
    }

    function renderAnnouncements() {
        const student = getStudent();
        const list = window.Utils.sortByDateDesc(
            window.Utils.announcementsForStudent(student),
        );
        return `
      <section class="hero-panel" style="margin-bottom: 1.5rem; padding: 1.25rem 1.5rem;">
        <div class="hero-eyebrow" style="margin-bottom: 0.15rem;">Announcements</div>
        <h2 style="margin: 0;">Academic Notice Feed</h2>
      </section>
      <section class="timeline" style="display: grid; gap: 1.5rem;">
        ${list
            .map(
                (item) => `
          <article class="timeline-item" style="padding: 1.5rem;">
            <div class="timeline-head" style="margin-bottom: 1rem;">
              <div>
                <h3 style="margin-bottom: 0.5rem;">${item.title}</h3>
                <div class="feed-meta" style="display: flex; gap: 1rem;"><span>${window.Utils.formatDate(item.date)}</span><span>Target: ${item.target}</span></div>
              </div>
              <span class="badge badge-neutral">Update</span>
            </div>
            <p>${item.message}</p>
          </article>
        `,
            )
            .join("")}
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
                return routeInfo.classId
                    ? renderClassDetails(routeInfo.classId)
                    : renderClasses();
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

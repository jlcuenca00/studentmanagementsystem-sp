window.TeacherViews = (() => {
    function getTeacher() {
        return window.Utils.teacherById(window.AppState.session.userId);
    }

    function getClasses(teacher) {
        return window.CLASSES.filter((item) =>
            teacher.assignedClassIds.includes(item.id),
        );
    }

    function studentsForClass(classId) {
        return window.STUDENTS.filter((student) =>
            student.classIds.includes(classId),
        );
    }

    function classAverage(classId) {
        const grades = window.Utils.gradesForClass(classId);
        return window.Utils.round(
            window.Utils.average(grades.map(window.Utils.computeGradeAverage)),
        );
    }

    function allTeacherStudents(teacher) {
        const ids = new Set();
        getClasses(teacher).forEach((item) =>
            studentsForClass(item.id).forEach((student) => ids.add(student.id)),
        );
        return [...ids].map((id) => window.Utils.studentById(id));
    }

    function classCard(item) {
        const studentCount = studentsForClass(item.id).length;
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
          <div>${item.schedule}</div>
          <div>${item.room}</div>
          <div>${studentCount} enrolled students</div>
        </div>
        <div class="class-card-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--line-soft); margin-top: auto;">
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
            calendar: "Calendar",
        };
        return map[name] || "Teacher Dashboard";
    }

    function renderDashboard() {
        const teacher = getTeacher();
        const classes = getClasses(teacher);
        const students = allTeacherStudents(teacher);
        const activeAnnouncements = window.AppState.announcements.filter(
            (item) =>
                item.target === "General" ||
                teacher.assignedClassIds.includes(item.target),
        );
        const events = window.Utils.sortByDateAsc(window.EVENTS).slice(0, 5);

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
              <div class="hero-eyebrow" style="margin-bottom: 0.25rem;">Class Management Center</div>
              <h2 style="margin-bottom: 1rem;">${teacher.name}</h2>
              <div class="hero-strip" style="gap: 0.5rem; margin-bottom: 0;">
                <span class="hero-chip">${teacher.department}</span>
                <span class="hero-chip">${classes.length} assigned classes</span>
                <span class="hero-chip">${students.length} active students</span>
              </div>
            </div>
            <div class="hero-actions" style="display: flex; gap: 0.5rem; align-self: flex-end;">
              <a class="btn" href="#/teacher/student-records" style="background: rgba(255,255,255,0.2); color: #fff; padding: 0.5rem 1rem;">Records</a>
              <a class="btn btn-primary" href="#/teacher/grades" style="padding: 0.5rem 1rem; background: #fff; color: var(--accent);">Grades</a>
            </div>
          </div>
        </div>

        <div class="tl-agenda">
          <section class="record-panel" style="padding: 1.5rem;">
            <div class="section-header" style="margin-bottom: 1rem; padding-bottom: 0.5rem;"><div><h3 style="margin-bottom: 0;">Near-Term Schedule</h3></div></div>
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

        <div class="tl-m1">${window.Utils.metricCard("Assigned Classes", classes.length, "Current teaching load")}</div>
        <div class="tl-m2">${window.Utils.metricCard("Managed Students", students.length, "Unique linked records")}</div>
        <div class="tl-m3">${window.Utils.metricCard("Posted Grades", window.AppState.grades.filter((item) => teacher.assignedClassIds.includes(item.classId)).length, "Current stored entries")}</div>
        <div class="tl-m4">${window.Utils.metricCard("Announcements", activeAnnouncements.length, "Visible academic notices")}</div>
      </div>

      <section class="dashboard-grid">
        <div class="stack" style="gap: 2rem;">
          <section class="card" style="padding: 1.5rem;">
            <div class="section-header" style="margin-bottom: 1.5rem;">
              <div><h2 style="margin-bottom: 0.25rem;">Assigned Classes</h2><p class="section-subtitle">Organized by course with quick access</p></div>
              <a class="btn btn-secondary" href="#/teacher/classes">View All</a>
            </div>
            <div class="class-grid" style="gap: 1.5rem;">${classes.map(classCard).join("")}</div>
          </section>

          <section class="table-shell" style="padding: 1.5rem;">
            <div class="section-header" style="margin-bottom: 1.5rem;"><div><h2 style="margin-bottom: 0.25rem;">Student Snapshot</h2><p class="section-subtitle">Attendance and standing overview</p></div></div>
            <div class="table-wrap">
              <table class="table">
                <thead><tr><th>Student</th><th>Section</th><th>Classes</th><th>Attendance</th><th>Average</th></tr></thead>
                <tbody>
                  ${students
                      .slice(0, 6)
                      .map((student) => {
                          const avg = window.Utils.round(
                              window.Utils.average(
                                  window.Utils.gradesForStudent(student.id).map(
                                      window.Utils.computeGradeAverage,
                                  ),
                              ),
                          );
                          return `
                      <tr>
                        <td>${student.name}</td>
                        <td>${student.section}</td>
                        <td>${student.classIds.length}</td>
                        <td><span class="badge badge-success">${student.attendanceRate}%</span></td>
                        <td><span class="badge badge-primary">${avg || "N/A"}</span></td>
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
            <div class="section-header" style="margin-bottom: 1.5rem;"><div><h2 style="margin-bottom: 0.25rem;">Quick Actions</h2></div></div>
            <div class="inline-actions" style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <a class="btn btn-primary" href="#/teacher/grades">Add Grades</a>
              <a class="btn btn-secondary" href="#/teacher/announcements">Post Notice</a>
              <a class="btn btn-secondary" href="#/teacher/student-records">View Records</a>
            </div>
          </section>

          <section class="record-panel" style="padding: 1.5rem;">
            <div class="section-header" style="margin-bottom: 1.5rem;"><div><h2 style="margin-bottom: 0.25rem;">Announcement Feed</h2><p class="section-subtitle">Most recent published notices</p></div></div>
            <div class="feed-list" style="display: grid; gap: 1rem;">
              ${window.Utils.sortByDateDesc(activeAnnouncements)
                  .slice(0, 4)
                  .map(
                      (item) => `
                <article class="feed-item" style="padding: 1.25rem; margin-bottom: 0;">
                  <div class="feed-head" style="margin-bottom: 0.75rem;">
                    <div>
                      <strong style="display: block; margin-bottom: 0.25rem;">${item.title}</strong>
                      <div class="feed-meta" style="display: flex; gap: 1rem;"><span>${window.Utils.formatDate(item.date)}</span><span>${item.target}</span></div>
                    </div>
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
        const teacher = getTeacher();
        const classes = getClasses(teacher);
        return `
      <section class="profile-layout" style="display: grid; gap: 2rem;">
        <aside class="profile-card profile-identity" style="padding: 2rem; text-align: center;">
          <div class="profile-avatar-xl" style="margin: 0 auto 1.5rem auto;">${window.Utils.initials(teacher.name)}</div>
          <div style="margin-bottom: 2rem;">
            <h2 style="margin-bottom: 0.5rem;">${teacher.name}</h2>
            <p class="muted">${teacher.department}</p>
          </div>
          <div class="profile-line-list" style="display: grid; gap: 1rem; text-align: left;">
            <div class="profile-line" style="display: flex; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--line-soft);"><span>Teacher ID</span><strong>${teacher.id}</strong></div>
            <div class="profile-line" style="display: flex; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--line-soft);"><span>Email</span><strong>${teacher.email}</strong></div>
            <div class="profile-line" style="display: flex; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--line-soft);"><span>Contact</span><strong>${teacher.contact}</strong></div>
            <div class="profile-line" style="display: flex; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--line-soft);"><span>Assigned Classes</span><strong>${classes.length}</strong></div>
          </div>
        </aside>

        <div class="stack" style="gap: 2rem;">
          <section class="profile-card" style="padding: 2rem;">
            <div class="section-header" style="margin-bottom: 2rem;"><div><h2 style="margin-bottom: 0.5rem;">Faculty Information</h2><p class="section-subtitle">Institution profile details</p></div></div>
            <div class="kv" style="display: grid; gap: 1.5rem;">
              <div class="kv-item" style="padding: 1.25rem;"><span>Full Name</span><strong style="display: block; margin-top: 0.5rem;">${teacher.name}</strong></div>
              <div class="kv-item" style="padding: 1.25rem;"><span>Teacher ID</span><strong style="display: block; margin-top: 0.5rem;">${teacher.id}</strong></div>
              <div class="kv-item" style="padding: 1.25rem;"><span>Department</span><strong style="display: block; margin-top: 0.5rem;">${teacher.department}</strong></div>
              <div class="kv-item" style="padding: 1.25rem;"><span>Email</span><strong style="display: block; margin-top: 0.5rem;">${teacher.email}</strong></div>
              <div class="kv-item" style="padding: 1.25rem;"><span>Contact</span><strong style="display: block; margin-top: 0.5rem;">${teacher.contact}</strong></div>
              <div class="kv-item" style="padding: 1.25rem;"><span>Status</span><strong style="display: block; margin-top: 0.5rem; color: var(--success);">Active Faculty</strong></div>
            </div>
          </section>
          <section class="profile-card" style="padding: 2rem;">
            <div class="section-header" style="margin-bottom: 2rem;"><div><h2 style="margin-bottom: 0.5rem;">Teaching Load</h2><p class="section-subtitle">Assigned classes this term</p></div></div>
            <div class="class-grid" style="gap: 1.5rem;">${classes.map(classCard).join("")}</div>
          </section>
        </div>
      </section>
    `;
    }

    function renderClasses() {
        const teacher = getTeacher();
        const classes = getClasses(teacher);
        const query = (window.AppState.searchQuery || "").toLowerCase();
        const filtered = classes.filter(
            (item) =>
                !query ||
                [item.code, item.title, item.section, item.room].some((value) =>
                    value.toLowerCase().includes(query),
                ),
        );

        return `
      <section class="hero-panel" style="margin-bottom: 1.5rem; padding: 1.25rem 1.5rem;">
        <div class="hero-eyebrow" style="margin-bottom: 0.15rem;">Classes</div>
        <h2 style="margin: 0;">Assigned Classes</h2>
      </section>
      <section class="class-grid" style="gap: 1.5rem;">${filtered.map(classCard).join("") || window.Utils.emptyState("No classes match the current search.")}</section>
    `;
    }

    function renderClassDetails(classId) {
        const teacher = getTeacher();
        if (!teacher.assignedClassIds.includes(classId))
            return window.Utils.emptyState(
                "This class is not assigned to the current teacher.",
            );
        const classInfo = window.Utils.classById(classId);
        const students = studentsForClass(classId);
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
              <div style="font-size: 0.9rem; opacity: 0.9;">${classInfo.section} • ${classInfo.schedule} • ${classInfo.room}</div>
            </div>
            <div class="hero-actions"><a class="btn btn-secondary" href="#/teacher/grades?classId=${classId}" style="color: var(--text); padding: 0.4rem 0.8rem; font-size: 0.85rem; min-height: 32px; border: none;">Edit Grades</a></div>
          </div>
          <div class="hero-strip" style="gap: 0.5rem; margin: 0;">
            <span class="hero-chip">${students.length} Students</span>
            <span class="hero-chip">Class Average ${classAverage(classId) || "N/A"}</span>
          </div>
        </div>
        <section class="record-panel" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: center;">
          <div class="section-header" style="margin-bottom: 1rem; padding-bottom: 0.5rem;"><div><h3 style="margin-bottom: 0;">Class Snapshot</h3></div></div>
          <div class="kv" style="gap: 1rem;">
            <div class="kv-item" style="padding: 1rem;"><span>Students</span><strong style="display: block; margin-top: 0.25rem;">${students.length}</strong></div>
            <div class="kv-item" style="padding: 1rem;"><span>Average</span><strong style="display: block; margin-top: 0.25rem; color: var(--accent);">${classAverage(classId) || "N/A"}</strong></div>
          </div>
        </section>
      </section>

      <section class="split-grid" style="gap: 2rem;">
        <div class="stack" style="gap: 2rem;">
          <section class="table-shell" style="padding: 1.5rem;">
            <div class="section-header" style="margin-bottom: 1.5rem;"><div><h2 style="margin-bottom: 0.25rem;">Roster and Grades</h2><p class="section-subtitle">Attendance view and current marks</p></div></div>
            <div class="table-wrap">
              <table class="table">
                <thead><tr><th>Student</th><th>Attendance</th><th>Prelim</th><th>Midterm</th><th>Final</th><th>Average</th></tr></thead>
                <tbody>
                  ${students
                      .map((student) => {
                          const grade = window.AppState.grades.find(
                              (entry) =>
                                  entry.studentId === student.id &&
                                  entry.classId === classId,
                          );
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
                      })
                      .join("")}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        <aside class="stack" style="gap: 2rem;">
          <section class="record-panel" style="padding: 1.5rem;">
            <div class="section-header" style="margin-bottom: 1.5rem;"><div><h2 style="margin-bottom: 0.25rem;">Class Notices</h2><p class="section-subtitle">Visible announcements</p></div></div>
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

    function renderStudentRecords() {
        const teacher = getTeacher();
        const query = (window.AppState.searchQuery || "").toLowerCase();
        const rows = allTeacherStudents(teacher).filter(
            (student) =>
                !query ||
                [
                    student.name,
                    student.id,
                    student.section,
                    student.course,
                ].some((value) => value.toLowerCase().includes(query)),
        );

        return `
      <section class="record-summary" style="margin-bottom: 2rem; display: grid; gap: 1.5rem;">
        <section class="record-panel" style="padding: 1.5rem;"><div class="muted" style="margin-bottom: 0.5rem;">Visible Records</div><div class="record-value" style="font-size: 2rem; font-weight: 800; color: var(--accent);">${rows.length}</div></section>
        <section class="record-panel" style="padding: 1.5rem;"><div class="muted" style="margin-bottom: 0.5rem;">Average Attendance</div><div class="record-value" style="font-size: 2rem; font-weight: 800; color: var(--text);">${window.Utils.round(window.Utils.average(rows.map((item) => item.attendanceRate)))}%</div></section>
        <section class="record-panel" style="padding: 1.5rem;"><div class="muted" style="margin-bottom: 0.5rem;">Faculty Coverage</div><div class="record-value" style="font-size: 2rem; font-weight: 800; color: var(--text);">${getClasses(teacher).length}</div></section>
      </section>

      <section class="table-shell" style="padding: 1.5rem;">
        <div class="section-header" style="margin-bottom: 1.5rem;"><div><h2 style="margin-bottom: 0.25rem;">Student Records</h2><p class="section-subtitle">Searchable list of linked student records</p></div></div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Student</th><th>ID</th><th>Section</th><th>Classes</th><th>Attendance</th><th>Average</th></tr></thead>
            <tbody>
              ${
                  rows
                      .map((student) => {
                          const avg = window.Utils.round(
                              window.Utils.average(
                                  window.Utils.gradesForStudent(student.id).map(
                                      window.Utils.computeGradeAverage,
                                  ),
                              ),
                          );
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
                      })
                      .join("") ||
                  `<tr><td colspan="6" style="padding: 2rem; text-align: center; color: var(--muted);">No records found.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </section>
    `;
    }

    function renderGrades() {
        const teacher = getTeacher();
        const classes = getClasses(teacher);
        const selectedClassId =
            window.AppState.gradeClassId || classes[0]?.id || "";
        const query = (window.AppState.searchQuery || "").toLowerCase();
        const students = selectedClassId
            ? studentsForClass(selectedClassId).filter(
                  (student) =>
                      !query ||
                      [student.name, student.id, student.section].some(
                          (value) => value.toLowerCase().includes(query),
                      ),
              )
            : [];
        const selectedClass = selectedClassId
            ? window.Utils.classById(selectedClassId)
            : null;

        return `
      <section class="hero-panel" style="margin-bottom: 1.5rem; padding: 1.25rem 1.5rem;">
        <div class="hero-eyebrow" style="margin-bottom: 0.15rem;">Grade Management</div>
        <h2 style="margin: 0;">Grade Workspace</h2>
      </section>

      <section class="table-shell" style="padding: 1.5rem;">
        <div class="workspace-toolbar" style="display: flex; flex-wrap: wrap; gap: 1.5rem; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--line-soft);">
          <div style="flex: 1; min-width: 250px;">
            <label class="muted small" for="gradeClassSelector" style="margin-bottom: 0.5rem; display: block;">Select class</label>
            <select id="gradeClassSelector" style="padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--line);">
              ${classes.map((item) => `<option value="${item.id}" ${item.id === selectedClassId ? "selected" : ""}>${item.code} • ${item.title}</option>`).join("")}
            </select>
          </div>
          <div class="muted small" style="flex: 1;">${selectedClass ? `${selectedClass.section} • ${selectedClass.schedule}` : "No class selected"}</div>
          <div class="inline-actions"><button id="saveGradeChanges" class="btn btn-primary" style="padding: 0.75rem 1.5rem;">Save Changes</button></div>
        </div>

        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Student</th><th>Prelim</th><th>Midterm</th><th>Final</th><th>Average</th></tr></thead>
            <tbody>
              ${
                  students
                      .map((student) => {
                          const grade = window.AppState.grades.find(
                              (entry) =>
                                  entry.studentId === student.id &&
                                  entry.classId === selectedClassId,
                          ) || { prelim: "", midterm: "", final: "" };
                          const average =
                              grade.prelim !== "" &&
                              grade.midterm !== "" &&
                              grade.final !== ""
                                  ? window.Utils.computeGradeAverage(grade)
                                  : "—";
                          return `
                  <tr data-grade-row="${student.id}">
                    <td>
                      <strong style="display: block; margin-bottom: 0.25rem;">${student.name}</strong>
                      <div class="muted small">${student.id} • ${student.section}</div>
                    </td>
                    <td><input data-grade-field="prelim" type="number" min="0" max="100" value="${grade.prelim}" style="width: 80px; text-align: center;"></td>
                    <td><input data-grade-field="midterm" type="number" min="0" max="100" value="${grade.midterm}" style="width: 80px; text-align: center;"></td>
                    <td><input data-grade-field="final" type="number" min="0" max="100" value="${grade.final}" style="width: 80px; text-align: center;"></td>
                    <td><span class="badge badge-primary grade-average-cell" style="font-size: 1rem;">${average}</span></td>
                  </tr>
                `;
                      })
                      .join("") ||
                  `<tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--muted);">No students found for this class.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </section>
    `;
    }

    function renderAnnouncements() {
        const teacher = getTeacher();
        const classOptions = getClasses(teacher);
        const list = window.Utils.sortByDateDesc(
            window.AppState.announcements.filter(
                (item) =>
                    item.target === "General" ||
                    teacher.assignedClassIds.includes(item.target),
            ),
        );

        return `
      <section class="split-grid" style="gap: 2rem;">
        <div class="stack" style="gap: 2rem;">
          <section class="table-shell" style="padding: 2rem;">
            <div class="section-header" style="margin-bottom: 2rem;"><div><h2 style="margin-bottom: 0.25rem;">Create Announcement</h2><p class="section-subtitle">Publish to a general audience or specific class</p></div></div>
            <form id="announcementForm">
              <div class="form-grid" style="display: grid; gap: 1.5rem; grid-template-columns: repeat(2, 1fr);">
                <div style="grid-column: 1 / -1;"><label class="muted small" for="announcementTitle" style="margin-bottom: 0.5rem;">Title</label><input id="announcementTitle" type="text" required placeholder="Enter announcement title"></div>
                <div>
                  <label class="muted small" for="announcementTarget" style="margin-bottom: 0.5rem;">Target</label>
                  <select id="announcementTarget"><option value="General">General</option>${classOptions.map((item) => `<option value="${item.id}">${item.code} • ${item.title}</option>`).join("")}</select>
                </div>
                <div><label class="muted small" for="announcementDate" style="margin-bottom: 0.5rem;">Date</label><input id="announcementDate" type="date" value="2026-04-01" required></div>
                <div style="grid-column: 1 / -1;"><label class="muted small" for="announcementMessage" style="margin-bottom: 0.5rem;">Message</label><textarea id="announcementMessage" required placeholder="Write the announcement message" style="min-height: 150px;"></textarea></div>
              </div>
              <div class="form-actions" style="margin-top: 2rem; display: flex; justify-content: flex-end;"><button class="btn btn-primary" type="submit" style="padding: 0.75rem 1.5rem;">Publish Announcement</button></div>
            </form>
          </section>
        </div>

        <aside class="stack" style="gap: 2rem;">
          <section class="record-panel" style="padding: 1.5rem;">
            <div class="section-header" style="margin-bottom: 1.5rem;"><div><h2 style="margin-bottom: 0.25rem;">Published Feed</h2><p class="section-subtitle">Most recent notices</p></div></div>
            <div class="feed-list" style="display: grid; gap: 1rem;">
              ${list
                  .map(
                      (item) => `
                <article class="feed-item" style="padding: 1.25rem; margin-bottom: 0;">
                  <div class="feed-head" style="margin-bottom: 0.75rem; display: flex; justify-content: space-between;">
                    <div>
                      <strong style="display: block; margin-bottom: 0.25rem;">${item.title}</strong>
                      <div class="feed-meta" style="display: flex; gap: 1rem;"><span>${window.Utils.formatDate(item.date)}</span><span>${item.target}</span></div>
                    </div>
                    <button class="btn btn-ghost announcement-edit-btn" data-announcement-id="${item.id}" style="padding: 0.25rem 0.75rem;">Edit</button>
                  </div>
                  <p style="margin-top: 0.5rem; font-size: 0.95rem;">${item.message}</p>
                </article>
              `,
                  )
                  .join("")}
            </div>
          </section>
        </aside>
      </section>
    `;
    }

    function renderCalendar() {
        const calendar = window.Utils.calendarData(window.EVENTS);
        const cells = [];
        for (let i = 0; i < calendar.startWeekday; i++)
            cells.push('<div class="calendar-day is-empty"></div>');
        for (let day = 1; day <= calendar.totalDays; day++) {
            const events = calendar.eventsByDay[day] || [];
            cells.push(`
        <div class="calendar-day ${calendar.todayDay === day ? "is-today" : ""}">
          <div class="calendar-date" style="margin-bottom: 0.5rem;">${day}</div>
          <div class="agenda-list" style="display: grid; gap: 0.4rem;">${events.map((event) => `<div class="calendar-event-pill">${event.title}</div>`).join("")}</div>
        </div>
      `);
        }

        return `
      <div class="calendar-layout" style="display: grid; gap: 2rem;">
        <section class="calendar-shell">
          <div class="calendar-toolbar" style="padding: 1.5rem;">
            <div class="calendar-title" style="margin-bottom: 0.5rem;"><h2>${calendar.monthLabel}</h2><p class="section-subtitle">Institution calendar</p></div>
            <span class="badge badge-primary">Faculty View</span>
          </div>
          <div class="calendar-weekdays">${calendar.weekdays.map((day) => `<div>${day}</div>`).join("")}</div>
          <div class="calendar-grid">${cells.join("")}</div>
        </section>
        <aside class="calendar-sidebar">
          <section class="record-panel" style="padding: 1.5rem;">
            <div class="section-header" style="margin-bottom: 1.5rem;"><div><h2 style="margin-bottom: 0.25rem;">Agenda</h2><p class="section-subtitle">Scheduled academic events</p></div></div>
            <div class="agenda-list" style="display: grid; gap: 1rem;">
              ${window.Utils.sortByDateAsc(window.EVENTS)
                  .map(
                      (item) => `
                <div class="calendar-agenda-item" style="padding: 1rem; margin-bottom: 0;">
                  <div><strong style="display: block; margin-bottom: 0.25rem;">${item.title}</strong><div class="calendar-agenda-date">${window.Utils.formatDate(item.date)}</div></div>
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
                const classId =
                    window.AppState.gradeClassId || classSelector?.value;
                const rows = document.querySelectorAll("[data-grade-row]");
                const allGrades = [...window.AppState.grades];

                rows.forEach((row) => {
                    const studentId = row.dataset.gradeRow;
                    const prelim = row.querySelector(
                        '[data-grade-field="prelim"]',
                    ).value;
                    const midterm = row.querySelector(
                        '[data-grade-field="midterm"]',
                    ).value;
                    const final = row.querySelector(
                        '[data-grade-field="final"]',
                    ).value;
                    const existingIndex = allGrades.findIndex(
                        (item) =>
                            item.studentId === studentId &&
                            item.classId === classId,
                    );
                    const payload = {
                        studentId,
                        classId,
                        prelim: Number(prelim || 0),
                        midterm: Number(midterm || 0),
                        final: Number(final || 0),
                    };

                    if (existingIndex >= 0) allGrades[existingIndex] = payload;
                    else allGrades.push(payload);
                });

                window.AppState.grades = allGrades;
                window.StorageManager.saveGrades(allGrades);
                if (window.App && window.App.showToast)
                    window.App.showToast("Grades successfully updated!");
                window.App.render();
            });
        }

        document.querySelectorAll("[data-grade-row]").forEach((row) => {
            const inputs = row.querySelectorAll("input[data-grade-field]");
            const avgCell = row.querySelector(".grade-average-cell");
            const updateAverage = () => {
                const values = [...inputs].map((input) =>
                    Number(input.value || 0),
                );
                const allBlank = [...inputs].every(
                    (input) => input.value === "",
                );
                avgCell.textContent = allBlank
                    ? "—"
                    : window.Utils.round(
                          (values[0] + values[1] + values[2]) / 3,
                      );
            };
            inputs.forEach((input) =>
                input.addEventListener("input", updateAverage),
            );
        });

        const announcementForm = document.getElementById("announcementForm");
        if (announcementForm) {
            announcementForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const title = document
                    .getElementById("announcementTitle")
                    .value.trim();
                const target =
                    document.getElementById("announcementTarget").value;
                const date = document.getElementById("announcementDate").value;
                const message = document
                    .getElementById("announcementMessage")
                    .value.trim();
                const editingId = announcementForm.dataset.editingId;

                if (editingId) {
                    window.AppState.announcements =
                        window.AppState.announcements.map((item) =>
                            item.id === editingId
                                ? { ...item, title, target, date, message }
                                : item,
                        );
                    delete announcementForm.dataset.editingId;
                    if (window.App && window.App.showToast)
                        window.App.showToast("Announcement updated!");
                } else {
                    window.AppState.announcements.unshift({
                        id: `ANN-${Date.now()}`,
                        title,
                        target,
                        date,
                        message,
                    });
                    if (window.App && window.App.showToast)
                        window.App.showToast("Announcement published!");
                }

                window.StorageManager.saveAnnouncements(
                    window.AppState.announcements,
                );
                window.App.render();
            });
        }

        document
            .querySelectorAll(".announcement-edit-btn")
            .forEach((button) => {
                button.addEventListener("click", () => {
                    const announcement = window.AppState.announcements.find(
                        (item) => item.id === button.dataset.announcementId,
                    );
                    if (!announcement) return;
                    document.getElementById("announcementTitle").value =
                        announcement.title;
                    document.getElementById("announcementTarget").value =
                        announcement.target;
                    document.getElementById("announcementDate").value =
                        announcement.date;
                    document.getElementById("announcementMessage").value =
                        announcement.message;
                    document.getElementById(
                        "announcementForm",
                    ).dataset.editingId = announcement.id;
                    window.scrollTo({ top: 0, behavior: "smooth" });
                });
            });
    }

    function render(routeInfo) {
        switch (routeInfo.name) {
            case "profile":
                return renderProfile();
            case "classes":
                return routeInfo.classId
                    ? renderClassDetails(routeInfo.classId)
                    : renderClasses();
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

window.Utils = (() => {
    function initials(name) {
        return String(name || "")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join("");
    }

    function formatDate(value) {
        return new Date(value).toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    function average(values) {
        if (!values.length) return 0;
        return (
            values.reduce((sum, value) => sum + Number(value || 0), 0) /
            values.length
        );
    }

    function round(value) {
        return Math.round(Number(value) * 100) / 100;
    }

    function computeGradeAverage(record) {
        return round(
            (Number(record.prelim) +
                Number(record.midterm) +
                Number(record.final)) /
                3,
        );
    }

    function teacherById(id) {
        return window.TEACHERS.find((item) => item.id === id);
    }

    function studentById(id) {
        return window.STUDENTS.find((item) => item.id === id);
    }

    function classById(id) {
        return window.CLASSES.find((item) => item.id === id);
    }

    function gradesForStudent(studentId) {
        return window.AppState.grades.filter(
            (item) => item.studentId === studentId,
        );
    }

    function gradesForClass(classId) {
        return window.AppState.grades.filter(
            (item) => item.classId === classId,
        );
    }

    function announcementsForStudent(student) {
        return window.AppState.announcements.filter(
            (item) =>
                item.target === "General" ||
                student.classIds.includes(item.target),
        );
    }

    function sortByDateAsc(items) {
        return [...items].sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    function sortByDateDesc(items) {
        return [...items].sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function safeText(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function emptyState(message) {
        return `<div class="empty-state">${safeText(message)}</div>`;
    }

    function metricCard(label, value, meta) {
        return `
      <section class="metric-card">
        <div class="metric-label">${safeText(label)}</div>
        <div class="metric-value">${safeText(value)}</div>
        <div class="metric-meta">${safeText(meta)}</div>
      </section>
    `;
    }

    // UPDATED: Now defaults to the real current date
    function calendarData(events, monthDate = new Date()) {
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startWeekday = firstDay.getDay();
        const totalDays = lastDay.getDate();
        const today = new Date(); // UPDATED: Fetches actual today dynamically
        const eventsByDay = {};

        events.forEach((event) => {
            const d = new Date(event.date);
            if (d.getFullYear() === year && d.getMonth() === month) {
                const day = d.getDate();
                eventsByDay[day] = eventsByDay[day] || [];
                eventsByDay[day].push(event);
            }
        });

        return {
            year,
            month,
            monthLabel: monthDate.toLocaleDateString("en-PH", {
                month: "long",
                year: "numeric",
            }),
            weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            startWeekday,
            totalDays,
            eventsByDay,
            todayDay:
                today.getFullYear() === year && today.getMonth() === month
                    ? today.getDate()
                    : null,
        };
    }

    return {
        initials,
        formatDate,
        average,
        round,
        computeGradeAverage,
        teacherById,
        studentById,
        classById,
        gradesForStudent,
        gradesForClass,
        announcementsForStudent,
        sortByDateAsc,
        sortByDateDesc,
        safeText,
        emptyState,
        metricCard,
        calendarData,
    };
})();

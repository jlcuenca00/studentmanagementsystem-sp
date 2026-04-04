window.StorageManager = (() => {
  const KEYS = {
    grades: "sms_grades",
    announcements: "sms_announcements",
    session: "sms_session"
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function get(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) return clone(fallback);
    try {
      return JSON.parse(raw);
    } catch {
      return clone(fallback);
    }
  }

  function set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  return {
    getGrades() { return get(KEYS.grades, window.GRADES); },
    saveGrades(value) { set(KEYS.grades, value); },
    getAnnouncements() { return get(KEYS.announcements, window.ANNOUNCEMENTS); },
    saveAnnouncements(value) { set(KEYS.announcements, value); },
    getSession() { return get(KEYS.session, null); },
    saveSession(value) { set(KEYS.session, value); },
    clearSession() { localStorage.removeItem(KEYS.session); },
    resetDemoData() {
      localStorage.removeItem(KEYS.grades);
      localStorage.removeItem(KEYS.announcements);
    }
  };
})();

import { randomBytes, scryptSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const configuredPath = process.env.STUDENTPULSE_DB_PATH ?? "data/studentpulse.sqlite";
const databasePath = configuredPath === ":memory:" ? configuredPath : path.resolve(configuredPath);
if (databasePath !== ":memory:") fs.mkdirSync(path.dirname(databasePath), { recursive: true });

export const db = new DatabaseSync(databasePath);
db.exec("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'administrator')),
    salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY,
    student_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    class_name TEXT NOT NULL,
    archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS attendance_sessions (
    id INTEGER PRIMARY KEY,
    class_name TEXT NOT NULL,
    session_date TEXT NOT NULL,
    created_by INTEGER REFERENCES users(id),
    UNIQUE (class_name, session_date)
  );
  CREATE TABLE IF NOT EXISTS attendance_records (
    id INTEGER PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id),
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (session_id, student_id)
  );
  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    due_date TEXT NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INTEGER PRIMARY KEY,
    assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id),
    status TEXT NOT NULL CHECK (status IN ('pending', 'submitted', 'excused')),
    submitted_at TEXT,
    UNIQUE (assignment_id, student_id)
  );
  CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    assessment_date TEXT NOT NULL,
    max_score REAL NOT NULL CHECK (max_score > 0),
    created_by INTEGER REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS marks (
    id INTEGER PRIMARY KEY,
    assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id),
    score REAL NOT NULL CHECK (score >= 0),
    UNIQUE (assessment_id, student_id)
  );
  CREATE TABLE IF NOT EXISTS followups (
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id),
    title TEXT NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed')),
    notes TEXT NOT NULL DEFAULT '',
    assigned_to INTEGER REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT
  );
  CREATE TABLE IF NOT EXISTS alert_actions (
    id INTEGER PRIMARY KEY,
    alert_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('acknowledged', 'under_review', 'dismissed')),
    reason TEXT NOT NULL DEFAULT '',
    updated_by INTEGER REFERENCES users(id),
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS notification_reads (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_key TEXT NOT NULL,
    read_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, notification_key)
  );
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

export function getSetting(key, fallback) {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key);
  if (!row) return fallback;
  try {
    return JSON.parse(row.value);
  } catch {
    return fallback;
  }
}

export function setSetting(key, value) {
  db.prepare("INSERT INTO settings(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, JSON.stringify(value));
}

function addAudit(userId, action, entityType, entityId, details = {}) {
  db.prepare("INSERT INTO audit_logs(user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)")
    .run(userId, action, entityType, String(entityId), JSON.stringify(details));
}

function seedDemoData() {
  const configuredUserCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  const production = process.env.NODE_ENV !== "development";
  if (production && db.prepare("SELECT 1 FROM users WHERE email = ?").get("teacher@studentpulse.local")) {
    throw new Error("Remove or rename the local demo administrator before starting with a production database.");
  }
  if (configuredUserCount === 0) {
    const email = production
      ? process.env.STUDENTPULSE_ADMIN_EMAIL?.trim().toLowerCase()
      : (process.env.STUDENTPULSE_DEMO_EMAIL ?? "teacher@studentpulse.local").trim().toLowerCase();
    const password = production
      ? process.env.STUDENTPULSE_ADMIN_PASSWORD
      : (process.env.STUDENTPULSE_DEMO_PASSWORD ?? "StudentPulseDemo2026!");
    if (!email || !password || (production && password.length < 16)) {
      throw new Error(
        production
          ? "Set STUDENTPULSE_ADMIN_EMAIL and a STUDENTPULSE_ADMIN_PASSWORD of at least 16 characters before initializing a production database."
          : "A demo administrator email and password must be configured.",
      );
    }
    const salt = randomBytes(16).toString("hex");
    const passwordHash = scryptSync(password, salt, 64).toString("hex");
    db.prepare("INSERT INTO users(email, name, role, salt, password_hash) VALUES (?, ?, ?, ?, ?)")
      .run(email, production ? "Administrator" : "Demo Teacher", "administrator", salt, passwordHash);
  }

  setSetting("academic_calendar", getSetting("academic_calendar", {
    startDate: "2025-03-10",
    endDate: "2025-05-18",
    workingWeekdays: [1, 2, 3, 4, 5],
    holidays: [],
  }));
  setSetting("thresholds", getSetting("thresholds", { attendance: 75, assignment: 65, assessment: 60, decline: 15, repeatedMissing: 2 }));

  const userId = db.prepare("SELECT id FROM users ORDER BY id LIMIT 1").get().id;
  const seedStudents = [
    { code: "S003", name: "Rohith Kumar", department: "CSE", className: "CSE 2A", attendance: 31, assignmentCompleted: 3, assignmentTotal: 6, score: 58 },
    { code: "S014", name: "Sneha R.", department: "ECE", className: "ECE 2A", attendance: 34, assignmentCompleted: 18, assignmentTotal: 25, score: 65 },
    { code: "S021", name: "Arjun M.", department: "IT", className: "IT 2A", attendance: 38, assignmentCompleted: 15, assignmentTotal: 25, score: 70 },
    { code: "S008", name: "Divya S.", department: "CSE", className: "CSE 2A", attendance: 45, assignmentCompleted: 5, assignmentTotal: 6, score: 86 },
    { code: "S035", name: "Aisha N.", department: "MECH", className: "MECH 2A", attendance: 44, assignmentCompleted: 19, assignmentTotal: 20, score: 82 },
  ];
  const insertStudent = db.prepare("INSERT OR IGNORE INTO students(student_code, name, department, class_name) VALUES (?, ?, ?, ?)");
  const findStudent = db.prepare("SELECT id FROM students WHERE student_code = ?");
  const insertedStudents = seedStudents.map(student => {
    insertStudent.run(student.code, student.name, student.department, student.className);
    return { ...student, id: Number(findStudent.get(student.code).id) };
  });

  const calendar = getSetting("academic_calendar", {});
  const weekdays = new Set(calendar.workingWeekdays ?? [1, 2, 3, 4, 5]);
  const holidays = new Set(calendar.holidays ?? []);
  const current = new Date(`${calendar.startDate ?? "2025-03-10"}T00:00:00Z`);
  const end = new Date(`${calendar.endDate ?? "2025-05-18"}T00:00:00Z`);
  const dates = [];
  while (current <= end) {
    const date = current.toISOString().slice(0, 10);
    if (weekdays.has(current.getUTCDay()) && !holidays.has(date)) dates.push(date);
    current.setUTCDate(current.getUTCDate() + 1);
  }
  const insertSession = db.prepare("INSERT OR IGNORE INTO attendance_sessions(class_name, session_date, created_by) VALUES (?, ?, ?)");
  const findSession = db.prepare("SELECT id FROM attendance_sessions WHERE class_name = ? AND session_date = ?");
  const insertAttendance = db.prepare("INSERT OR IGNORE INTO attendance_records(session_id, student_id, status) VALUES (?, ?, ?)");
  for (const student of insertedStudents) {
    dates.forEach((date, index) => {
      insertSession.run(student.className, date, userId);
      const sessionId = findSession.get(student.className, date).id;
      insertAttendance.run(sessionId, student.id, index < student.attendance ? "present" : "absent");
    });
  }

  const assignmentTotals = new Map([["CSE 2A", 6], ["ECE 2A", 25], ["IT 2A", 25], ["MECH 2A", 20]]);
  const insertAssignment = db.prepare("INSERT INTO assignments(title, class_name, subject, due_date, created_by) VALUES (?, ?, ?, ?, ?)");
  const insertSubmission = db.prepare("INSERT INTO assignment_submissions(assignment_id, student_id, status, submitted_at) VALUES (?, ?, ?, ?)");
  const completedByCode = new Map(insertedStudents.map(student => [student.code, student.assignmentCompleted]));
  const insertAssessment = db.prepare("INSERT INTO assessments(title, class_name, subject, assessment_date, max_score, created_by) VALUES (?, ?, ?, ?, 100, ?)");
  const insertMark = db.prepare("INSERT INTO marks(assessment_id, student_id, score) VALUES (?, ?, ?)");
  for (const className of new Set(insertedStudents.map(student => student.className))) {
    const classStudents = insertedStudents.filter(student => student.className === className);
    const assignmentTotal = assignmentTotals.get(className) ?? 6;
    if (!db.prepare("SELECT 1 FROM assignments WHERE class_name = ? LIMIT 1").get(className)) {
      for (let index = 0; index < assignmentTotal; index++) {
        const dueDate = `2025-${String(3 + Math.floor(index / 4)).padStart(2, "0")}-${String(5 + (index % 20)).padStart(2, "0")}`;
        const assignmentId = Number(insertAssignment.run(`${className} Assignment ${index + 1}`, className, "Core Studies", dueDate, userId).lastInsertRowid);
        for (const student of classStudents) {
          const submitted = index < (completedByCode.get(student.code) ?? 0);
          insertSubmission.run(assignmentId, student.id, submitted ? "submitted" : "pending", submitted ? dueDate : null);
        }
      }
    }
    if (!db.prepare("SELECT 1 FROM assessments WHERE class_name = ? LIMIT 1").get(className)) {
      for (let index = 0; index < 3; index++) {
        const assessmentId = Number(insertAssessment.run(`${className} Assessment ${index + 1}`, className, "Core Studies", `2025-04-${10 + index * 5}`, userId).lastInsertRowid);
        for (const student of classStudents) insertMark.run(assessmentId, student.id, Math.max(0, Math.min(100, student.score + (index - 1) * 4)));
      }
    }
  }

  const insertFollowup = db.prepare("INSERT INTO followups(student_id, title, due_date, status, notes, assigned_to) VALUES (?, ?, ?, ?, ?, ?)");
  const rohithId = insertedStudents.find(student => student.code === "S003").id;
  if (db.prepare("SELECT COUNT(*) AS count FROM followups").get().count === 0) {
    insertFollowup.run(rohithId, "Review assignment recovery plan", "2025-04-30", "open", "Confirm the next manageable task with the student.", userId);
    insertFollowup.run(rohithId, "Attendance check-in", "2025-05-07", "open", "Ask about support needs without assuming a cause.", userId);
  }
  if (!db.prepare("SELECT 1 FROM audit_logs WHERE action='seed_demo_data' LIMIT 1").get()) addAudit(userId, "seed_demo_data", "database", "initial", { sampleStudentCount: insertedStudents.length });
}

seedDemoData();

export function resetDemoData() {
  db.exec(`
    DELETE FROM notification_reads;
    DELETE FROM sessions;
    DELETE FROM alert_actions;
    DELETE FROM followups;
    DELETE FROM audit_logs;
    DELETE FROM marks;
    DELETE FROM assignment_submissions;
    DELETE FROM assessments;
    DELETE FROM assignments;
    DELETE FROM attendance_records;
    DELETE FROM attendance_sessions;
    DELETE FROM students;
    DELETE FROM users;
    DELETE FROM settings;
  `);
  seedDemoData();
}
export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && typeof options.body === "string" && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  const response = await fetch(`/api${path}`, { ...options, headers, credentials: "same-origin" });
  const contentType = response.headers.get("content-type") ?? "";
  const result = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    const body = result as { error?: string; details?: unknown };
    throw new ApiError(body.error ?? `Request failed (${response.status}).`, response.status, body.details);
  }
  return result as T;
}

export type ApiUser = { id: number; email: string; name: string; role: "teacher" | "administrator" };

export type ApiStudent = {
  id: number;
  student_code: string;
  name: string;
  department: string;
  class_name: string;
  attendanceDays: number;
  attendanceRecordedDays: number;
  workingDays: number;
  attendance: number | null;
  lateDays: number;
  assignmentsCompleted: number;
  assignmentTotal: number;
  assignment: number;
  pendingAssignments: number;
  overdueAssignments: number;
  assessment: number | null;
  assessmentCount: number;
  previousAttendance?: number;
  previousAssignment?: number;
  previousScore?: number;
};

export type ApiAlert = {
  alert_key: string;
  student_id: number;
  student_code: string;
  student_name: string;
  class_name: string;
  priority: "Low" | "Medium" | "High";
  reasons: string[];
  evidence: Record<string, number | null>;
  status: "open" | "acknowledged" | "under_review" | "dismissed";
  status_reason: string;
  updated_at: string | null;
};

export type ApiNotification = {
  key: string;
  type: "alert" | "followup" | "assignment";
  title: string;
  message: string;
  page: string;
  created_at: string | null;
  read: boolean;
};

export type ApiFollowup = {
  id: number;
  student_id: number;
  student_code: string;
  student_name: string;
  title: string;
  due_date: string;
  status: "open" | "completed";
  notes: string;
  assigned_to: number | null;
};

export type ApiBootstrap = {
  user: ApiUser;
  calendar: { startDate: string; endDate: string; workingWeekdays: number[]; holidays: string[] };
  thresholds: { attendance: number; assignment: number; assessment: number; decline: number; repeatedMissing: number };
  classes: string[];
  students: ApiStudent[];
  alerts: ApiAlert[];
  notifications: ApiNotification[];
  dashboard: {
    total_students: number;
    average_attendance: number;
    average_assessment: number;
    pending_assignments: number;
    requiring_attention: number;
    followups_due: number;
    high_priority_alerts: number;
    recent_activity: Array<{ action: string; entity_type: string; entity_id: string; created_at: string; actor: string | null }>;
    weekly_trends: Array<{ label: string; start_date: string; end_date: string; attendance: number | null; assignment: number | null; assessment: number | null }>;
    weekly_summary: { attention: ApiAlert[]; overdue_assignments: Array<{ student_id: number; student_name: string; count: number }>; followups_due: unknown[] };
  };
  followups: ApiFollowup[];
};

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  ApiError,
  apiRequest,
  type ApiAlert,
  type ApiBootstrap,
  type ApiNotification,
  type ApiStudent,
  type ApiUser,
} from "./api"
import {
  AssignmentsPage,
  AssessmentsPage,
  AttendancePage,
  FollowupsPage,
} from "./WorkflowPages"
import "./LogoExperience.css"
import "./BarChart.css"
import "./StudentIndicators.css"
import "./AcademicCalendar.css"
import "./Workflow.css"
import "./SupportCoach.css"
import { SiteAmbientScene, SitePageMotion } from "./SiteMotion"

type Page = "Dashboard" | "Students" | "Attendance" | "Assignments" | "Assessments" | "Early-Warning Alerts" | "Follow-ups" | "Support Plans" | "Progress Monitoring" | "Reports" | "Settings" | "Design System" | "Student Profile"
type IconName = "grid" | "users" | "alert" | "plan" | "chart" | "report" | "settings" | "bell" | "search" | "plus" | "arrow" | "spark" | "menu" | "close" | "calendar"

const paths: Record<IconName, React.ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  plan: (
    <>
      <path d="M9 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4" />
      <rect x="9" y="3" width="6" height="4" rx="2" />
      <path d="m9 14 2 2 4-4" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 16 4-5 4 3 5-7" />
    </>
  ),
  report: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M8 13h8M8 17h8" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="m9 18 6-6-6-6" />,
  spark: (
    <>
      <path d="m12 3-1.4 3.6L7 8l3.6 1.4L12 13l1.4-3.6L17 8l-3.6-1.4L12 3Z" />
      <path d="m5 15-.8 2.2L2 18l2.2.8L5 21l.8-2.2L8 18l-2.2-.8L5 15Z" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </>
  ),
}
function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function LogoShowcase({ onClose }: { onClose: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    let disposed = false
    let disposeScene = () => {}

    void import("three")
      .then((THREE) => {
        if (disposed) return

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
        })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.domElement.setAttribute(
          "aria-label",
          "Animated 3D StudentPulse logo",
        )
        stage.appendChild(renderer.domElement)

        const emblem = new THREE.Group()
        scene.add(emblem)
        scene.add(new THREE.HemisphereLight(0xd9f4ff, 0x14264b, 2.2))
        const keyLight = new THREE.DirectionalLight(0xffffff, 3.2)
        keyLight.position.set(-3, 5, 7)
        scene.add(keyLight)
        const rimLight = new THREE.PointLight(0x22d3b2, 18, 18)
        rimLight.position.set(4, -1, 3)
        scene.add(rimLight)

        const plate = new THREE.Mesh(
          new THREE.BoxGeometry(6.1, 4.98, 0.2),
          new THREE.MeshStandardMaterial({
            color: 0x102d56,
            metalness: 0.54,
            roughness: 0.3,
          }),
        )
        emblem.add(plate)

        const logoCanvas = document.createElement("canvas")
        logoCanvas.width = 760
        logoCanvas.height = 620
        const logoContext = logoCanvas.getContext("2d")
        const texture = new THREE.CanvasTexture(logoCanvas)
        texture.colorSpace = THREE.SRGBColorSpace
        const logoImage = new Image()
        logoImage.onload = () => {
          if (disposed || !logoContext) return
          logoContext.drawImage(
            logoImage,
            0,
            0,
            logoCanvas.width,
            logoCanvas.height,
          )
          texture.needsUpdate = true
        }
        logoImage.src = "/studentpulse-logo.svg"
        const face = new THREE.Mesh(
          new THREE.PlaneGeometry(6.08, 4.96),
          new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.01,
            side: THREE.DoubleSide,
            toneMapped: false,
          }),
        )
        face.position.z = 0.106
        emblem.add(face)

        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches
        let pointerX = 0
        let pointerY = 0
        let frame = 0
        let width = 0
        let height = 0
        const resize = () => {
          width = stage.clientWidth
          height = stage.clientHeight
          if (!width || !height) return
          renderer.setSize(width, height, false)
          camera.aspect = width / height
          camera.position.z = Math.max(
            8.8,
            7.5 /
              (2 *
                Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
                camera.aspect),
          )
          camera.updateProjectionMatrix()
        }
        const observeSize = new ResizeObserver(resize)
        observeSize.observe(stage)
        resize()

        const movePointer = (event: PointerEvent) => {
          pointerX = (event.clientX / Math.max(width, 1) - 0.5) * 2
          pointerY = (event.clientY / Math.max(height, 1) - 0.5) * 2
        }
        stage.addEventListener("pointermove", movePointer)
        const timer = new THREE.Timer()
        timer.connect(document)
        const animate = () => {
          frame = requestAnimationFrame(animate)
          timer.update()
          const elapsed = timer.getElapsed()
          if (!reducedMotion) {
            emblem.rotation.y =
              Math.sin(elapsed * 0.42) * 0.22 + pointerX * 0.12
            emblem.rotation.x =
              Math.sin(elapsed * 0.32) * 0.06 - pointerY * 0.08
            emblem.position.y = Math.sin(elapsed * 0.7) * 0.12
          }
          renderer.render(scene, camera)
        }
        animate()

        disposeScene = () => {
          cancelAnimationFrame(frame)
          observeSize.disconnect()
          stage.removeEventListener("pointermove", movePointer)
          timer.dispose()
          texture.dispose()
          plate.geometry.dispose()
          plate.material.dispose()
          face.geometry.dispose()
          face.material.dispose()
          renderer.dispose()
          renderer.domElement.remove()
        }
      })
      .catch((error) =>
        console.error("Unable to load the StudentPulse 3D logo.", error),
      )

    return () => {
      disposed = true
      disposeScene()
    }
  }, [])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", closeOnEscape)
    return () => document.removeEventListener("keydown", closeOnEscape)
  }, [onClose])

  return (
    <div
      className="logo-experience"
      role="dialog"
      aria-modal="true"
      aria-label="StudentPulse 3D logo"
    >
      <div className="logo-experience-grid" aria-hidden="true" />
      <div className="logo-stage" ref={stageRef} />
      <button
        className="logo-experience-close"
        type="button"
        aria-label="Close 3D logo"
        onClick={onClose}
      >
        <Icon name="close" size={22} />
      </button>
    </div>
  )
}

type AcademicCalendar = {
  startDate: string
  endDate: string
  workingWeekdays: number[]
  holidays: string[]
}
type StudentRecord = {
  id: string
  recordId: number
  studentCode: string
  name: string
  dept: string
  className: string
  attendanceDays: number
  attendanceRecordedDays: number
  workingDays: number
  assignmentsCompleted: number
  assignmentTotal: number
  pendingAssignments: number
  overdueAssignments: number
  attendance: number
  assignment: number
  score: number
  assessmentCount: number
  previousAttendance: number
  previousAssignment: number
  previousScore: number
  priority: string
  updated: string
  initials: string
}
const defaultCalendar: AcademicCalendar = {
  startDate: "2025-03-10",
  endDate: "2025-05-18",
  workingWeekdays: [1, 2, 3, 4, 5],
  holidays: [],
}

function countWorkingDays(calendar: AcademicCalendar) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(calendar.startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(calendar.endDate)
  )
    return 0
  const current = new Date(`${calendar.startDate}T00:00:00Z`)
  const end = new Date(`${calendar.endDate}T00:00:00Z`)
  if (
    Number.isNaN(current.getTime()) ||
    Number.isNaN(end.getTime()) ||
    current > end
  )
    return 0
  const weekdays = new Set(calendar.workingWeekdays)
  const holidays = new Set(calendar.holidays)
  let count = 0
  while (current <= end) {
    const date = current.toISOString().slice(0, 10)
    if (weekdays.has(current.getUTCDay()) && !holidays.has(date)) count++
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return count
}

function mapStudents(
  records: ApiStudent[],
  alerts: ApiAlert[],
): StudentRecord[] {
  const alertsById = new Map(
    alerts
      .filter((alert) => alert.status === "open")
      .map((alert) => [alert.student_id, alert.priority]),
  )
  return records.map((student) => {
    const score = student.assessment ?? 0
    const priority = alertsById.get(student.id)
    return {
      id: student.student_code,
      recordId: student.id,
      studentCode: student.student_code,
      name: student.name,
      dept: student.department,
      className: student.class_name,
      attendanceDays: student.attendanceDays,
      attendanceRecordedDays: student.attendanceRecordedDays,
      workingDays: student.workingDays,
      assignmentsCompleted: student.assignmentsCompleted,
      assignmentTotal: student.assignmentTotal,
      pendingAssignments: student.pendingAssignments,
      overdueAssignments: student.overdueAssignments,
      attendance: student.attendance ?? 0,
      assignment: student.assignment,
      score,
      assessmentCount: student.assessmentCount,
      previousAttendance: student.previousAttendance ?? student.attendance ?? 0,
      previousAssignment: student.previousAssignment ?? student.assignment,
      previousScore: student.previousScore ?? score,
      priority:
        priority === "High"
          ? "Priority Review"
          : priority === "Medium"
            ? "Needs Review"
            : "On Track",
      updated: "From academic records",
      initials: student.name
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    }
  })
}

type AcademicData = {
  calendar: AcademicCalendar
  saveCalendar: (calendar: AcademicCalendar) => Promise<void>
  workingDays: number
  students: StudentRecord[]
  user: ApiUser
  dashboard: ApiBootstrap["dashboard"]
  alerts: ApiAlert[]
  notifications: ApiNotification[]
  thresholds: ApiBootstrap["thresholds"]
  followups: ApiBootstrap["followups"]
  classes: string[]
  refresh: () => Promise<ApiBootstrap>
  resetDemoData: () => Promise<void>
}
const AcademicDataContext = createContext<AcademicData | null>(null)
function useAcademicData() {
  const data = useContext(AcademicDataContext)
  if (!data) throw new Error("Academic data must be used inside its provider.")
  return data
}

function Avatar({
  initials,
  large = false,
}: {
  initials: string
  large?: boolean
}) {
  return (
    <span className={`avatar ${large ? "avatar-lg" : ""}`}>{initials}</span>
  )
}
function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode
  tone?: string
}) {
  return <span className={`badge ${tone}`}>{children}</span>
}
function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode
  variant?: string
  onClick?: () => void | Promise<void>
  type?: "button" | "submit"
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      className={`btn ${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <section className={`card ${className}`}>{children}</section>
}
function statusTone(value: string) {
  return value.includes("Priority") || value === "High"
    ? "danger"
    : value.includes("Needs") || value === "Medium" || value === "Pending"
      ? "warning"
      : value === "On Track" || value === "Improving" || value === "Completed"
        ? "success"
        : "info"
}

function TrendChart({
  after = false,
  data,
}: {
  after?: boolean
  data?: ApiBootstrap["dashboard"]["weekly_trends"]
}) {
  const { dashboard } = useAcademicData()
  const weeklyData = data ?? (!after ? dashboard.weekly_trends : undefined)
  const series = weeklyData
    ? [
        {
          label: "Attendance",
          color: "blue",
          values: weeklyData.map((week) => week.attendance),
          dates: weeklyData.map(
            (week) => `${week.start_date} to ${week.end_date}`,
          ),
        },
        {
          label: "Assignments",
          color: "teal",
          values: weeklyData.map((week) => week.assignment),
          dates: weeklyData.map(
            (week) => `${week.start_date} to ${week.end_date}`,
          ),
        },
        {
          label: "Assessments",
          color: "amber",
          values: weeklyData.map((week) => week.assessment),
          dates: weeklyData.map(
            (week) => `${week.start_date} to ${week.end_date}`,
          ),
        },
      ]
    : [
        {
          label: "Attendance",
          color: "blue",
          values: after ? [62, 68, 74, 80, 84, 89] : [92, 88, 82, 77, 71, 66],
          dates: [],
        },
        {
          label: "Assignments",
          color: "teal",
          values: after ? [50, 58, 65, 72, 79, 85] : [84, 74, 82, 66, 72, 68],
          dates: [],
        },
        {
          label: "Assessments",
          color: "amber",
          values: after ? [58, 62, 67, 70, 76, 82] : [89, 85, 77, 79, 67, 64],
          dates: [],
        },
      ]
  const weekLabels = weeklyData?.map((week) => week.label) ?? [
    "W1",
    "W2",
    "W3",
    "W4",
    "W5",
    "W6",
  ]
  const chartBottom = 211
  const chartHeight = 180
  const groupStart = 82
  const groupWidth = 98
  const barWidth = 16
  return (
    <div
      className="chart-wrap"
      role="img"
      aria-label={
        weeklyData
          ? "Weekly grouped bar chart of recorded attendance, assignment submission, and assessment averages."
          : after
            ? "Example grouped bar chart showing trends after support."
            : "Example grouped bar chart comparing weekly academic indicators."
      }
    >
      <svg className="chart" viewBox="0 0 680 245" preserveAspectRatio="none">
        {[0, 25, 50, 75, 100].map((value) => {
          const y = chartBottom - (value * chartHeight) / 100
          return (
            <g key={value}>
              <line x1="68" x2="662" y1={y} y2={y} className="gridline" />
              <text x="58" y={y + 3} textAnchor="end" className="axis">
                {value}%
              </text>
            </g>
          )
        })}
        {series.flatMap((item, seriesIndex) =>
          item.values.map((value, weekIndex) => {
            if (value === null) return null
            const height = (value * chartHeight) / 100
            const x =
              groupStart + weekIndex * groupWidth + seriesIndex * (barWidth + 3)
            return (
              <rect
                key={`${item.color}-${weekIndex}`}
                className={`bar ${item.color}`}
                x={x}
                y={chartBottom - height}
                width={barWidth}
                height={height}
                rx="2"
              >
                <title>{`${item.label}, ${item.dates[weekIndex] ?? `week ${weekIndex + 1}`}: ${value}%`}</title>
              </rect>
            )
          }),
        )}
        {weekLabels.map((week, index) => (
          <text
            key={week}
            x={groupStart + index * groupWidth + 28}
            y="232"
            textAnchor="middle"
            className="axis"
          >
            {week}
          </text>
        ))}
      </svg>
      <div className="legend">
        <span>
          <i className="dot blue" />
          Attendance
        </span>
        <span>
          <i className="dot teal" />
          Assignments
        </span>
        <span>
          <i className="dot amber" />
          Assessments
        </span>
      </div>
    </div>
  )
}

function Login({
  onLogin,
}: {
  onLogin: (email: string, password: string) => Promise<void>
}) {
  const [email, setEmail] = useState(
    import.meta.env.DEV ? "teacher@studentpulse.local" : "",
  )
  const [password, setPassword] = useState(
    import.meta.env.DEV ? "StudentPulseDemo2026!" : "",
  )
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      await onLogin(email, password)
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Sign in failed. Try again.",
      )
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="login-page">
      <div className="login-art">
        <div className="brand brand-light">
          <span className="logo">
            <img src="/studentpulse-mark.svg" alt="" />
          </span>
          <span>StudentPulse</span>
        </div>
        <div className="orb">
          <Icon name="chart" size={54} />
        </div>
        <div>
          <h1>
            Detect early.
            <br />
            Support better.
          </h1>
          <p>
            Human-centred academic insights that help every student move
            forward.
          </p>
        </div>
        <div className="trust-line">
          Secure institutional access · Privacy-first
        </div>
      </div>
      <main className="login-form">
        <div className="mobile-brand">
          <span className="logo">
            <img src="/studentpulse-mark.svg" alt="" />
          </span>{" "}
          StudentPulse
        </div>
        <Badge tone="info">TEACHER PORTAL</Badge>
        <h2>Welcome back</h2>
        <p>Sign in to your StudentPulse workspace.</p>
        <form onSubmit={submit}>
          <Field label="Institutional email">
            <input
              aria-label="Institutional email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={error ? "invalid" : ""}
            />
          </Field>
          <Field label="Password">
            <input
              aria-label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={error ? "invalid" : ""}
            />
          </Field>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in securely"}{" "}
            {!loading && <Icon name="arrow" />}
          </Button>
        </form>
        <p className="privacy-note">
          {import.meta.env.DEV
            ? "Local development demo account. Replace demo credentials and session configuration before deployment."
            : "Institutional access is managed by your administrator."}
        </p>
      </main>
    </div>
  )
}

const nav: { name: Page; icon: IconName }[] = [
  { name: "Dashboard", icon: "grid" },
  { name: "Students", icon: "users" },
  { name: "Attendance", icon: "calendar" },
  { name: "Assignments", icon: "plan" },
  { name: "Assessments", icon: "chart" },
  { name: "Early-Warning Alerts", icon: "alert" },
  { name: "Follow-ups", icon: "calendar" },
  { name: "Support Plans", icon: "report" },
  { name: "Progress Monitoring", icon: "chart" },
  { name: "Reports", icon: "report" },
  { name: "Settings", icon: "settings" },
]

function Shell({
  page,
  setPage,
  children,
  onLogout,
}: {
  page: Page
  setPage: (p: Page) => void
  children: React.ReactNode
  onLogout: () => void | Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [logoOpen, setLogoOpen] = useState(false)
  const { user, calendar, notifications, refresh, followups } =
    useAcademicData()
  const dueFollowups = followups.filter(
    (item) =>
      item.status === "open" &&
      String(item.due_date) <= new Date().toISOString().slice(0, 10),
  )
  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length
  const academicYear = `${new Date(`${calendar.startDate}T00:00:00Z`).getUTCFullYear()}–${new Date(`${calendar.endDate}T00:00:00Z`).getUTCFullYear()}`
  const openNotification = async (notification: ApiNotification) => {
    if (!notification.read) {
      await apiRequest(
        `/notifications/${encodeURIComponent(notification.key)}/read`,
        { method: "POST" },
      )
      await refresh()
    }
    setPage(notification.page as Page)
    setNotificationsOpen(false)
  }
  const markAllNotificationsRead = async () => {
    await apiRequest("/notifications/read-all", { method: "POST" })
    await refresh()
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <button
            className="brand-trigger"
            type="button"
            aria-label="Open animated StudentPulse logo"
            onClick={() => setLogoOpen(true)}
          >
            <span className="logo">
              <img src="/studentpulse-mark.svg" alt="" />
            </span>
            <span>
              StudentPulse<small>Detect early · Support better</small>
            </span>
          </button>
          <button
            className="icon-btn side-close"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>
        <nav>
          {nav.map((n) => (
            <button
              key={n.name}
              className={
                page === n.name ||
                (page === "Student Profile" && n.name === "Students")
                  ? "active"
                  : ""
              }
              onClick={() => {
                setPage(n.name)
                setOpen(false)
              }}
            >
              <Icon name={n.icon} />
              <span>{n.name}</span>
              {n.name === "Early-Warning Alerts" && <b>18</b>}
            </button>
          ))}
        </nav>
        <button
          className="ai-nav"
          onClick={() => document.getElementById("ai-chat")?.click()}
        >
          <span>
            <Icon name="spark" />
          </span>
          <div>
            <strong>AI Support Coach</strong>
            <small>Teaching tips & guidance</small>
          </div>
        </button>
        <div className="side-user">
          <Avatar initials="PS" />
          <div>
            <strong>Dr. Priya Sharma</strong>
            <small>Academic Mentor</small>
          </div>
        </div>
      </aside>
      <div className="main">
        <SiteAmbientScene />
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setOpen(true)}>
            <Icon name="menu" />
          </button>
          <div className="top-title">
            <small>STUDENT SUCCESS</small>
            <strong>{page}</strong>
          </div>
          <div className="top-actions">
            <select aria-label="Academic year">
              <option>Academic Year {academicYear}</option>
            </select>
            <button
              className="icon-btn notify"
              aria-label={`Notifications, ${unreadCount} unread`}
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Icon name="bell" />
              {unreadCount > 0 && <i />}
            </button>
            <button
              className="profile-btn"
              onClick={() => setProfile(!profile)}
            >
              <Avatar
                initials={user.name
                  .split(/\s+/)
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              />
              <span>{user.name}</span>
            </button>
          </div>
          {profile && (
            <div className="profile-menu">
              <button onClick={() => setPage("Design System")}>
                Design system
              </button>
              <button onClick={onLogout}>Sign out</button>
            </div>
          )}
          {notificationsOpen && (
            <div className="profile-menu notification-menu">
              <div className="notification-title">
                <strong>Notifications</strong>
                <button
                  className="link"
                  onClick={() => void markAllNotificationsRead()}
                  disabled={!unreadCount}
                >
                  Mark all read
                </button>
              </div>
              {notifications.slice(0, 10).map((notification) => (
                <button
                  className={notification.read ? "read" : "unread"}
                  key={notification.key}
                  onClick={() => void openNotification(notification)}
                >
                  <span className={`notification-dot ${notification.type}`} />
                  <span>
                    <b>{notification.title}</b>
                    <small>{notification.message}</small>
                  </span>
                </button>
              ))}
              {!notifications.length && (
                <p>
                  No current alerts, overdue assignments, or follow-ups due.
                </p>
              )}
              <button
                className="notification-footer"
                onClick={() => {
                  setPage("Follow-ups")
                  setNotificationsOpen(false)
                }}
              >
                Open task center
              </button>
            </div>
          )}
        </header>
        <main className="content">
          <SitePageMotion page={page}>{children}</SitePageMotion>
        </main>
      </div>
      {logoOpen && <LogoShowcase onClose={() => setLogoOpen(false)} />}
    </div>
  )
}

function PageHead({
  eyebrow,
  title,
  desc,
  action,
}: {
  eyebrow?: string
  title: string
  desc: string
  action?: React.ReactNode
}) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
function Kpi({
  icon,
  label,
  value,
  note,
  tone = "",
}: {
  icon: IconName
  label: string
  value: string
  note: string
  tone?: string
}) {
  return (
    <Card className="kpi">
      <div className={`kpi-icon ${tone}`}>
        <Icon name={icon} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </Card>
  )
}

function Dashboard({
  setPage,
  openProfile,
}: {
  setPage: (p: Page) => void
  openProfile: (studentCode?: string) => void
}) {
  const { students, dashboard, alerts, followups, user } = useAcademicData()
  const activeAlerts = alerts.filter((alert) => alert.status === "open")
  const highAlerts = activeAlerts.filter(
    (alert) => alert.priority === "High",
  ).length
  const mediumAlerts = activeAlerts.filter(
    (alert) => alert.priority === "Medium",
  ).length
  const lowAlerts = activeAlerts.filter(
    (alert) => alert.priority === "Low",
  ).length
  const today = new Date().toISOString().slice(0, 10)
  const dueFollowups = followups.filter(
    (item) => item.status === "open" && String(item.due_date) <= today,
  )
  return (
    <>
      <PageHead
        title={`Good morning, ${user.name}`}
        desc="Your weekly teacher summary, calculated from recorded student data."
        action={
          <div className="date-control">
            <Icon name="calendar" /> {dashboard.total_students} active students
          </div>
        }
      />
      <div className="kpi-grid">
        <Kpi
          icon="users"
          label="Total Students"
          value={String(dashboard.total_students)}
          note="Active student records"
        />
        <Kpi
          icon="calendar"
          label="Average Attendance"
          value={`${dashboard.average_attendance}%`}
          note="Calculated from recorded working days"
          tone="green"
        />
        <Kpi
          icon="alert"
          label="Students Requiring Review"
          value={String(dashboard.requiring_attention)}
          note={`${dashboard.high_priority_alerts} high priority`}
          tone="red"
        />
        <Kpi
          icon="chart"
          label="Average Performance"
          value={`${dashboard.average_assessment}%`}
          note="Average of recorded marks"
          tone="green"
        />
        <Kpi
          icon="plan"
          label="Pending Assignments"
          value={String(dashboard.pending_assignments)}
          note="Not yet confirmed submitted"
          tone="purple"
        />
        <Kpi
          icon="calendar"
          label="Follow-ups Due"
          value={String(dashboard.followups_due)}
          note="Open tasks due today or earlier"
          tone="red"
        />
      </div>
      <div className="dashboard-grid">
        <Card className="trend-card">
          <div className="card-head">
            <div>
              <h2>Overall performance trends</h2>
              <p>Six-week cohort overview</p>
            </div>
            <button className="link">View report</button>
          </div>
          <TrendChart />
        </Card>
        <Card className="attention-card">
          <div className="card-head">
            <div>
              <h2>Weekly Teacher Summary</h2>
              <p>Priority tasks from current student records</p>
            </div>
            <button
              className="link"
              onClick={() => setPage("Early-Warning Alerts")}
            >
              Review alerts
            </button>
          </div>
          <div className="student-list">
            {activeAlerts.slice(0, 4).map((alert) => (
              <button
                key={alert.alert_key}
                className="student-row"
                onClick={() => setPage("Early-Warning Alerts")}
              >
                <Avatar
                  initials={alert.student_name
                    .split(/\s+/)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                />
                <div>
                  <strong>{alert.student_name}</strong>
                  <small>
                    {alert.student_code} · {alert.reasons[0]}
                  </small>
                </div>
                <Badge tone={alert.priority === "High" ? "danger" : "warning"}>
                  {alert.priority}
                </Badge>
                <Icon name="arrow" />
              </button>
            ))}
          </div>
          {!activeAlerts.length && (
            <div className="empty">
              <h3>No open warning indicators</h3>
              <p>
                New alerts will appear when records cross configured review
                thresholds.
              </p>
            </div>
          )}
        </Card>
        <Card>
          <div className="card-head">
            <div>
              <h2>Recent alerts</h2>
              <p>New signals requiring review</p>
            </div>
            <button
              className="link"
              onClick={() => setPage("Early-Warning Alerts")}
            >
              All alerts
            </button>
          </div>
          <div className="alert-list">
            {activeAlerts.slice(0, 4).map((alert) => (
              <div
                className={`mini-alert ${
                  alert.priority === "High" ? "danger" : "warning"
                }`}
                key={alert.alert_key}
              >
                <Icon name="alert" />
                <div>
                  <strong>
                    {alert.student_name}: {alert.reasons.length} review signal
                    {alert.reasons.length === 1 ? "" : "s"}
                  </strong>
                  <small>{alert.reasons.join(" · ")}</small>
                </div>
              </div>
            ))}
            {!activeAlerts.length && (
              <p className="body-copy">No active alerts.</p>
            )}
          </div>
        </Card>
        <Card>
          <div className="card-head">
            <div>
              <h2>Risk distribution</h2>
              <p>Current active rule-based alerts</p>
            </div>
            <button
              className="link"
              onClick={() => setPage("Early-Warning Alerts")}
            >
              Review all
            </button>
          </div>
          <div className="status-summary">
            <button onClick={() => setPage("Early-Warning Alerts")}>
              <strong>{highAlerts}</strong>
              <span>High priority</span>
            </button>
            <button onClick={() => setPage("Early-Warning Alerts")}>
              <strong>{mediumAlerts}</strong>
              <span>Medium priority</span>
            </button>
            <button onClick={() => setPage("Early-Warning Alerts")}>
              <strong>{lowAlerts}</strong>
              <span>Low priority</span>
            </button>
          </div>
          <div className="followup-summary">
            <strong>
              {dueFollowups.length} follow-up
              {dueFollowups.length === 1 ? "" : "s"} due
            </strong>
            <button className="link" onClick={() => setPage("Follow-ups")}>
              Open task center
            </button>
          </div>
        </Card>
      </div>
      <div className="quick-actions">
        <span>Quick actions</span>
        <Button variant="secondary" onClick={() => setPage("Students")}>
          <Icon name="plus" /> Add student
        </Button>
        <Button variant="secondary" onClick={() => setPage("Attendance")}>
          <Icon name="calendar" /> Take attendance
        </Button>
        <Button variant="secondary" onClick={() => setPage("Assessments")}>
          <Icon name="chart" /> Enter marks
        </Button>
        <Button variant="secondary" onClick={() => setPage("Assignments")}>
          <Icon name="plan" /> Create assignment
        </Button>
        <Button variant="secondary" onClick={() => setPage("Reports")}>
          <Icon name="report" /> Generate report
        </Button>
      </div>
    </>
  )
}

function Students({
  openProfile,
}: {
  openProfile: (studentCode?: string) => void
}) {
  const { students, refresh } = useAcademicData()
  const [q, setQ] = useState("")
  const [dept, setDept] = useState("All")
  const [priority, setPriority] = useState("All priorities")
  const [sort, setSort] = useState("Name A-Z")
  const [page, setPage] = useState(1)
  const [studentModal, setStudentModal] = useState(false)
  const [editing, setEditing] = useState<StudentRecord | null>(null)
  const [draft, setDraft] = useState({
    student_code: "",
    name: "",
    department: "CSE",
    class_name: "CSE 2A",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [saving, setSaving] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvValidation, setCsvValidation] = useState<{
    count: number
    valid: boolean
    errors: Array<{ row: number; field: string; message: string }>
  } | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importBusy, setImportBusy] = useState(false)
  const filtered = useMemo(
    () =>
      students
        .filter(
          (student) =>
            (student.name + student.id)
              .toLowerCase()
              .includes(q.toLowerCase()) &&
            (dept === "All" || student.dept === dept) &&
            (priority === "All priorities" || student.priority === priority),
        )
        .sort((a, b) =>
          sort === "Attendance lowest"
            ? a.attendance - b.attendance
            : sort === "Assignments lowest"
              ? a.assignment - b.assignment
              : a.name.localeCompare(b.name),
        ),
    [q, dept, priority, sort, students],
  )
  const pageSize = 10
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const openCreate = () => {
    setEditing(null)
    setDraft({
      student_code: "",
      name: "",
      department: "CSE",
      class_name: "CSE 2A",
    })
    setError("")
    setStudentModal(true)
  }
  const openEdit = (student: StudentRecord, event: React.MouseEvent) => {
    event.stopPropagation()
    setEditing(student)
    setDraft({
      student_code: student.id,
      name: student.name,
      department: student.dept,
      class_name: student.className,
    })
    setError("")
    setStudentModal(true)
  }
  const saveStudent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      await apiRequest(
        editing ? `/students/${editing.recordId}` : "/students",
        { method: editing ? "PATCH" : "POST", body: JSON.stringify(draft) },
      )
      await refresh()
      setStudentModal(false)
      setSuccess(
        editing ? "Student record updated." : "Student added to the directory.",
      )
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Student record could not be saved.",
      )
    } finally {
      setSaving(false)
    }
  }
  const archiveStudent = async (
    student: StudentRecord,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation()
    if (
      !window.confirm(
        `Archive ${student.name}? Their academic history will remain in reports.`,
      )
    )
      return
    setError("")
    setSuccess("")
    try {
      await apiRequest(`/students/${student.recordId}`, {
        method: "PATCH",
        body: JSON.stringify({ archived: true }),
      })
      await refresh()
      setSuccess(`${student.name} was archived.`)
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Student could not be archived.",
      )
    }
  }
  const validateCsv = async () => {
    if (!csvFile) return
    setImportBusy(true)
    setError("")
    setCsvValidation(null)
    try {
      const result = await apiRequest<{
        count: number
        valid: boolean
        errors: Array<{ row: number; field: string; message: string }>
      }>("/imports/students/validate", {
        method: "POST",
        headers: { "content-type": "text/csv" },
        body: await csvFile.text(),
      })
      setCsvValidation(result)
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "CSV could not be validated.",
      )
    } finally {
      setImportBusy(false)
    }
  }
  const importCsv = async () => {
    if (!csvFile || !csvValidation?.valid) return
    setImportBusy(true)
    setError("")
    try {
      const result = await apiRequest<{ imported: number }>(
        "/imports/students",
        {
          method: "POST",
          headers: { "content-type": "text/csv" },
          body: await csvFile.text(),
        },
      )
      await refresh()
      setSuccess(`${result.imported} student records imported.`)
      setCsvFile(null)
      setCsvValidation(null)
      setImportOpen(false)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "CSV import failed.")
    } finally {
      setImportBusy(false)
    }
  }
  const template =
    "student_id,name,class,department\r\nS999,Example Student,CSE 2A,CSE"
  return (
    <>
      <PageHead
        title="Student directory"
        desc="Manage student records and review calculated academic indicators."
        action={
          <div className="directory-actions">
            <Button onClick={openCreate}>
              <Icon name="plus" /> Add student
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setCsvFile(null)
                setCsvValidation(null)
                setImportOpen(true)
              }}
            >
              Import CSV
            </Button>
            <a
              className="btn outline"
              download="studentpulse-student-template.csv"
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(template)}`}
            >
              Template
            </a>
            <a className="btn outline" href="/api/reports/students.csv">
              Export CSV
            </a>
          </div>
        }
      />
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="callout neutral" role="status">
          <p>{success}</p>
        </div>
      )}
      <Card>
        <div className="toolbar">
          <div className="search">
            <Icon name="search" />
            <input
              aria-label="Search students"
              placeholder="Search by student name or ID"
              value={q}
              onChange={(event) => {
                setQ(event.target.value)
                setPage(1)
              }}
            />
          </div>
          <select
            aria-label="Filter by department"
            value={dept}
            onChange={(event) => {
              setDept(event.target.value)
              setPage(1)
            }}
          >
            <option>All</option>
            {[...new Set(students.map((student) => student.dept))]
              .sort()
              .map((department) => (
                <option key={department}>{department}</option>
              ))}
          </select>
          <select
            aria-label="Filter by priority"
            value={priority}
            onChange={(event) => {
              setPriority(event.target.value)
              setPage(1)
            }}
          >
            <option>All priorities</option>
            <option>Priority Review</option>
            <option>Needs Review</option>
            <option>On Track</option>
          </select>
          <select
            aria-label="Sort students"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option>Name A-Z</option>
            <option>Attendance lowest</option>
            <option>Assignments lowest</option>
          </select>
        </div>
        {visible.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Attendance</th>
                  <th>Assignments completed</th>
                  <th>Assessment</th>
                  <th>Review priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((student) => (
                  <tr key={student.id} onClick={() => openProfile(student.id)}>
                    <td>
                      <div className="person">
                        <Avatar initials={student.initials} />
                        <div>
                          <strong>{student.name}</strong>
                          <small>{student.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>{student.className}</td>
                    <td>
                      <div className="metric-detail">
                        {student.attendanceRecordedDays ? (
                          <>
                            <Metric value={student.attendance} />
                            <small>
                              {student.attendanceDays} of {student.workingDays}{" "}
                              days
                            </small>
                          </>
                        ) : (
                          <small>Not recorded</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="metric-detail">
                        <strong>
                          {student.assignmentsCompleted} /{" "}
                          {student.assignmentTotal}
                        </strong>
                        <small>{student.assignment}% complete</small>
                      </div>
                    </td>
                    <td>
                      {student.assessmentCount
                        ? `${student.score}%`
                        : "No marks"}
                    </td>
                    <td>
                      <Badge tone={statusTone(student.priority)}>
                        {student.priority}
                      </Badge>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="link"
                          onClick={(event) => openEdit(student, event)}
                        >
                          Edit
                        </button>
                        <button
                          className="link danger-text"
                          onClick={(event) =>
                            void archiveStudent(student, event)
                          }
                        >
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No matching students"
            text="Try changing your search or filter criteria."
          />
        )}
        <div className="pagination">
          <span>
            Showing {visible.length ? (page - 1) * pageSize + 1 : 0}–
            {Math.min(page * pageSize, filtered.length)} of {filtered.length}{" "}
            students
          </span>
          <div>
            <Button
              variant="outline"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="page-number">
              {page} / {pageCount}
            </span>
            <Button
              variant="outline"
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
              disabled={page === pageCount}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
      {studentModal && (
        <div className="overlay" onMouseDown={() => setStudentModal(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="drawer-head">
              <div>
                <div className="eyebrow">STUDENT RECORD</div>
                <h2 id="student-modal-title">
                  {editing ? "Edit student" : "Add student"}
                </h2>
                <p>Only academic identifiers needed for support tracking.</p>
              </div>
              <button
                className="icon-btn"
                aria-label="Close student form"
                onClick={() => setStudentModal(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <form className="form-grid" onSubmit={saveStudent}>
              <Field label="Student ID">
                <input
                  required
                  maxLength={40}
                  value={draft.student_code}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      student_code: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Student name">
                <input
                  required
                  maxLength={120}
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Department">
                <input
                  required
                  maxLength={80}
                  value={draft.department}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      department: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Class">
                <input
                  required
                  maxLength={80}
                  value={draft.class_name}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      class_name: event.target.value,
                    }))
                  }
                />
              </Field>
              {error && (
                <div className="form-error" role="alert">
                  {error}
                </div>
              )}
              <div className="modal-actions">
                <Button
                  variant="outline"
                  onClick={() => setStudentModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving
                    ? "Saving…"
                    : editing
                      ? "Save changes"
                      : "Add student"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {importOpen && (
        <div className="overlay" onMouseDown={() => setImportOpen(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="drawer-head">
              <div>
                <div className="eyebrow">BULK IMPORT</div>
                <h2 id="import-modal-title">Import student CSV</h2>
                <p>
                  Required columns: student_id, name, class, department. The
                  whole file is rejected if any row is invalid.
                </p>
              </div>
              <button
                className="icon-btn"
                aria-label="Close import form"
                onClick={() => setImportOpen(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <label className="field">
              <span>CSV file</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  setCsvFile(event.target.files?.[0] ?? null)
                  setCsvValidation(null)
                }}
              />
            </label>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            {csvValidation && (
              <div
                className={
                  csvValidation.valid ? "callout neutral" : "form-error"
                }
                role={csvValidation.valid ? "status" : "alert"}
              >
                <p>
                  {csvValidation.valid
                    ? `${csvValidation.count} records validated. No IDs are missing or duplicated.`
                    : `${csvValidation.errors.length} validation errors; no records were imported.`}
                </p>
                {csvValidation.errors.slice(0, 8).map((item, index) => (
                  <p key={`${item.row}-${index}`}>
                    Row {item.row}, {item.field}: {item.message}
                  </p>
                ))}
              </div>
            )}
            <div className="modal-actions">
              <Button
                variant="outline"
                onClick={validateCsv}
                disabled={!csvFile || importBusy}
              >
                {importBusy ? "Checking…" : "Validate CSV"}
              </Button>
              <Button
                onClick={importCsv}
                disabled={!csvValidation?.valid || importBusy}
              >
                Import validated records
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
function Metric({ value }: { value: number }) {
  return (
    <span className={`metric ${value < 65 ? "low" : value < 80 ? "mid" : ""}`}>
      {value}%
    </span>
  )
}
function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <span>
        <Icon name="search" />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

function Alerts({
  openProfile,
  createPlan,
}: {
  openProfile: (studentCode?: string) => void
  createPlan: (studentId?: string) => void
}) {
  const { students, alerts, refresh } = useAcademicData()
  const [drawer, setDrawer] = useState(false)
  const [toast, setToast] = useState("")
  const [query, setQuery] = useState("")
  const [priority, setPriority] = useState("All priorities")
  const [status, setStatus] = useState("open")
  const [sort, setSort] = useState("Newest first")
  const [selectedId, setSelectedId] = useState("S003")
  const [dismissReason, setDismissReason] = useState("")
  const selectedAlert =
    alerts.find((alert) => alert.student_code === selectedId) ?? null
  const selectedStudent = selectedAlert
    ? students.find((student) => student.recordId === selectedAlert.student_id)
    : undefined
  const filteredAlerts = alerts
    .filter((alert) => {
      const matchesStatus = status === "all" || alert.status === status
      const matchesPriority =
        priority === "All priorities" || alert.priority === priority
      return (
        matchesStatus &&
        matchesPriority &&
        (
          alert.student_name +
          alert.student_code +
          alert.class_name +
          alert.reasons.join(" ")
        )
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    })
    .sort((a, b) =>
      sort === "Priority"
        ? a.priority === b.priority
          ? 0
          : a.priority === "High"
            ? -1
            : 1
        : b.alert_key.localeCompare(a.alert_key),
    )
  const openAlert = (alert: ApiAlert) => {
    setSelectedId(alert.student_code)
    setDismissReason("")
    setDrawer(true)
  }
  const saveAlertAction = async (
    action: "acknowledged" | "under_review" | "dismissed",
  ) => {
    if (!selectedAlert) return
    try {
      await apiRequest(
        `/alerts/${encodeURIComponent(selectedAlert.alert_key)}/action`,
        {
          method: "POST",
          body: JSON.stringify({
            status: action,
            reason: action === "dismissed" ? dismissReason : "",
          }),
        },
      )
      await refresh()
      setToast(
        action === "dismissed"
          ? "Alert dismissed with reason."
          : action === "under_review"
            ? "Alert marked under review."
            : "Alert acknowledged.",
      )
      setDrawer(false)
    } catch (reason) {
      setToast(
        reason instanceof Error
          ? reason.message
          : "Alert status could not be updated.",
      )
    }
  }
  return (
    <>
      <PageHead
        title="Early-warning alerts"
        desc="Explainable indicators for teacher review — not predictions or diagnoses."
      />
      <div className="mini-kpis">
        <Kpi
          icon="alert"
          label="Open alerts"
          value={String(
            alerts.filter((alert) => alert.status === "open").length,
          )}
          note="Generated from current records"
        />
        <Kpi
          icon="alert"
          label="High priority"
          value={String(
            alerts.filter(
              (alert) => alert.priority === "High" && alert.status === "open",
            ).length,
          )}
          note="Teacher review recommended"
          tone="red"
        />
        <Kpi
          icon="report"
          label="Medium priority"
          value={String(
            alerts.filter(
              (alert) => alert.priority === "Medium" && alert.status === "open",
            ).length,
          )}
          note="Review and monitor"
          tone="purple"
        />
        <Kpi
          icon="plan"
          label="Acknowledged"
          value={String(
            alerts.filter((alert) => alert.status === "acknowledged").length,
          )}
          note="Status saved to history"
          tone="green"
        />
      </div>
      <Card>
        <div className="toolbar">
          <div className="search">
            <Icon name="search" />
            <input
              placeholder="Search alerts"
              aria-label="Search alerts"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            aria-label="Filter by priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option>All priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <select
            aria-label="Filter by alert status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="open">Open</option>
            <option value="under_review">Under review</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="dismissed">Dismissed</option>
            <option value="all">All statuses</option>
          </select>
          <select
            aria-label="Sort alerts"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option>Newest first</option>
            <option>Priority</option>
          </select>
        </div>
        <div className="alert-cards">
          {filteredAlerts.map((alert) => (
            <button
              className={`alert-card ${
                selectedId === alert.student_code ? "selected" : ""
              }`}
              key={alert.alert_key}
              onClick={() => openAlert(alert)}
            >
              <Avatar
                initials={alert.student_name
                  .split(/\s+/)
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              />
              <div className="alert-main">
                <div>
                  <strong>
                    {alert.student_name} <small>{alert.student_code}</small>
                  </strong>
                  <Badge
                    tone={
                      alert.priority === "High"
                        ? "danger"
                        : alert.priority === "Medium"
                          ? "warning"
                          : "info"
                    }
                  >
                    {alert.priority} priority
                  </Badge>
                </div>
                <p>{alert.reasons.join(" · ")}</p>
                <div className="measurements">
                  <span>
                    Attendance{" "}
                    <b>
                      {alert.evidence.attendance_percent === null
                        ? "Not recorded"
                        : `${alert.evidence.attendance_days}/${alert.evidence.working_days} days · ${alert.evidence.attendance_percent}%`}
                    </b>
                  </span>
                  <span>
                    Assignments{" "}
                    <b>
                      {alert.evidence.assignment_total
                        ? `${alert.evidence.assignments_completed}/${alert.evidence.assignment_total} · ${alert.evidence.assignment_percent}%`
                        : "Not assigned"}
                    </b>
                  </span>
                  <span>
                    Assessment{" "}
                    <b>
                      {alert.evidence.assessment_average === null
                        ? "Not recorded"
                        : `${alert.evidence.assessment_average}%`}
                    </b>
                  </span>
                </div>
              </div>
              <div className="alert-meta">
                <span>{alert.class_name}</span>
                <Badge tone={alert.status === "open" ? "info" : "success"}>
                  {alert.status.replace("_", " ")}
                </Badge>
                <Icon name="arrow" />
              </div>
            </button>
          ))}
          {!filteredAlerts.length && (
            <EmptyState
              title="No matching alerts"
              text="Try a different search or priority filter."
            />
          )}
        </div>
      </Card>
      {drawer && selectedStudent && selectedAlert && (
        <div className="overlay" onMouseDown={() => setDrawer(false)}>
          <aside className="drawer" onMouseDown={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <Badge
                  tone={
                    selectedAlert.priority === "High"
                      ? "danger"
                      : selectedAlert.priority === "Medium"
                        ? "warning"
                        : "info"
                  }
                >
                  {selectedAlert.priority.toUpperCase()} PRIORITY REVIEW
                </Badge>
                <h2>Why this alert was triggered</h2>
              </div>
              <button className="icon-btn" onClick={() => setDrawer(false)}>
                <Icon name="close" />
              </button>
            </div>
            <div className="student-summary">
              <Avatar initials={selectedStudent.initials} large />
              <div>
                <h3>{selectedStudent.name}</h3>
                <p>
                  {selectedStudent.id} · {selectedStudent.className}
                </p>
              </div>
              <button
                className="link"
                onClick={() => openProfile(selectedStudent.id)}
              >
                Open profile <Icon name="arrow" />
              </button>
            </div>
            <div className="callout">
              <Icon name="alert" />
              <p>
                This alert is a transparent rule-based signal for teacher
                review, not a diagnosis or automatic decision.
              </p>
            </div>
            {selectedAlert.status_reason && (
              <div className="callout neutral">
                <p>Dismissal reason: {selectedAlert.status_reason}</p>
              </div>
            )}
            <h3>Contributing indicators</h3>
            {[
              [
                "Attendance",
                selectedAlert.evidence.attendance_percent === null
                  ? "Not recorded"
                  : `${selectedAlert.evidence.attendance_percent}%`,
                `${selectedAlert.evidence.attendance_days} of ${selectedAlert.evidence.working_days} configured working days attended`,
              ],
              [
                "Assignment completion",
                selectedAlert.evidence.assignment_percent === null
                  ? "Not assigned"
                  : `${selectedAlert.evidence.assignment_percent}%`,
                `${selectedAlert.evidence.assignments_completed} of ${selectedAlert.evidence.assignment_total} assignments completed · ${selectedAlert.evidence.overdue_assignments} overdue`,
              ],
              [
                "Assessment average",
                selectedAlert.evidence.assessment_average === null
                  ? "Not recorded"
                  : `${selectedAlert.evidence.assessment_average}%`,
                `${
                  selectedStudent.assessmentCount
                    ? selectedStudent.assessmentCount
                    : "No"
                } assessment marks recorded`,
              ],
            ].map((x) => (
              <div className="indicator" key={x[0]}>
                <div>
                  <span>{x[0]}</span>
                  <strong>{x[1]}</strong>
                </div>
                <p>{x[2]}</p>
              </div>
            ))}
            <h3>Exact alert reasons</h3>
            <ul className="alert-reason-list">
              {selectedAlert.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            <p className="body-copy">
              Review the evidence with {selectedStudent.name}; ask what support
              would be helpful and agree on a follow-up date together.
            </p>
            <div className="drawer-actions">
              <Button onClick={() => createPlan(selectedStudent.id)}>
                <Icon name="plus" /> Create support plan
              </Button>
              <Button
                variant="secondary"
                onClick={() => void saveAlertAction("under_review")}
              >
                Under review
              </Button>
              <Button
                variant="outline"
                onClick={() => void saveAlertAction("acknowledged")}
              >
                Acknowledge
              </Button>
            </div>
            <div className="dismiss-control">
              <input
                aria-label="Reason for dismissal"
                maxLength={500}
                placeholder="Reason required to dismiss"
                value={dismissReason}
                onChange={(event) => setDismissReason(event.target.value)}
              />
              <Button
                variant="danger"
                disabled={!dismissReason.trim()}
                onClick={() => void saveAlertAction("dismissed")}
              >
                Dismiss alert
              </Button>
            </div>
          </aside>
        </div>
      )}
      {toast && (
        <div className="toast">
          <Icon name="plan" />
          <div>
            <strong>Review updated</strong>
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast("")}>
            <Icon name="close" />
          </button>
        </div>
      )}
    </>
  )
}

function StudentProfile({
  createPlan,
  studentCode,
}: {
  createPlan: (studentId?: string) => void
  studentCode: string
}) {
  const { students, alerts, followups } = useAcademicData()
  const [tab, setTab] = useState("Overview")
  const student = students.find((record) => record.id === studentCode)
  if (!student)
    return (
      <EmptyState
        title="Student record unavailable"
        text="The record may have been archived. Return to the directory to select an active student."
      />
    )
  const alert = alerts.find(
    (item) => item.student_id === student.recordId && item.status === "open",
  )
  const studentFollowups = followups.filter(
    (item) => Number(item.student_id) === student.recordId,
  )
  const recommendations = [
    ...(student.attendanceRecordedDays && student.attendance < 75
      ? ["Review attendance context with the student."]
      : []),
    ...(student.assignmentTotal && student.assignment < 65
      ? ["Plan support for pending assignments."]
      : []),
    ...(student.assessmentCount && student.score < 60
      ? ["Offer targeted practice using recent assessment feedback."]
      : []),
  ]
  return (
    <>
      <div className="breadcrumb">
        <button className="link" onClick={() => setTab("Overview")}>
          Students
        </button>{" "}
        <Icon name="arrow" /> {student.name}
      </div>
      <Card className="profile-header">
        <div className="profile-person">
          <Avatar initials={student.initials} large />
          <div>
            <div>
              <h1>{student.name}</h1>
              <Badge tone={statusTone(student.priority)}>
                {student.priority}
              </Badge>
            </div>
            <p>
              {student.id} · {student.className} · {student.dept}
            </p>
            <small>{student.updated}</small>
          </div>
        </div>
        <div className="profile-actions">
          <Button variant="secondary" onClick={() => setTab("Support History")}>
            View support history
          </Button>
          <Button onClick={() => createPlan(student.id)}>
            <Icon name="plus" /> Create support plan
          </Button>
        </div>
      </Card>
      <div className="tabs">
        {[
          "Overview",
          "Attendance",
          "Assignments",
          "Assessments",
          "Support History",
        ].map((t) => (
          <button
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Overview" ? (
        <>
          <div className="profile-kpis">
            <Kpi
              icon="calendar"
              label="Attendance"
              value={
                student.attendanceRecordedDays
                  ? `${student.attendanceDays} / ${student.workingDays}`
                  : "Not recorded"
              }
              note={
                student.attendanceRecordedDays
                  ? `${student.attendance}% · college working days attended`
                  : "No attendance sessions recorded"
              }
              tone={
                student.attendanceRecordedDays && student.attendance < 75
                  ? "red"
                  : "green"
              }
            />
            {student.assignmentTotal ? (
              <Card className="kpi assignment-kpi">
                <div
                  className="assignment-pie"
                  role="img"
                  aria-label={`${student.assignmentsCompleted} of ${student.assignmentTotal} assignments completed, ${student.assignment}%`}
                  style={{
                    background: `conic-gradient(#11aab5 ${student.assignment}%, #e8edf4 0)`,
                  }}
                >
                  <span>{student.assignment}%</span>
                </div>
                <div>
                  <span>Assignments completed</span>
                  <strong>
                    {student.assignmentsCompleted} / {student.assignmentTotal}
                  </strong>
                  <small>
                    {student.assignmentTotal - student.assignmentsCompleted}{" "}
                    remaining
                  </small>
                </div>
              </Card>
            ) : (
              <Kpi
                icon="plan"
                label="Assignments"
                value="Not assigned"
                note="No assignments recorded"
              />
            )}
            <Kpi
              icon="chart"
              label="Assessment average"
              value={student.assessmentCount ? `${student.score}%` : "No marks"}
              note={`${student.assessmentCount} recorded assessments`}
              tone={
                student.assessmentCount && student.score < 60 ? "red" : "green"
              }
            />
          </div>
          <div className="profile-grid">
            <Card>
              <div className="card-head">
                <div>
                  <h2>Current academic indicators</h2>
                  <p>Calculated from saved records</p>
                </div>
              </div>
              <div className="report-bars">
                {[
                  [
                    "Attendance",
                    student.attendanceRecordedDays
                      ? student.attendance
                      : "No records",
                  ],
                  [
                    "Assignments",
                    student.assignmentTotal
                      ? student.assignment
                      : "Not assigned",
                  ],
                  [
                    "Assessment",
                    student.assessmentCount ? student.score : "No marks",
                  ],
                ].map(([label, value]) => (
                  <div className="report-bar-row" key={label}>
                    <span>{label}</span>
                    <i>
                      <em
                        className="blue-bar"
                        style={{
                          width: `${typeof value === "number" ? value : 0}%`,
                        }}
                      />
                    </i>
                    <b>{typeof value === "number" ? `${value}%` : value}</b>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="observation-card">
              <h2>Recorded evidence</h2>
              <div className="observation">
                <span>01</span>
                <p>
                  <strong>Attendance</strong>
                  {student.attendanceRecordedDays
                    ? `${student.attendanceDays} of ${student.workingDays} working days attended.`
                    : "No attendance sessions recorded for the current term."}
                </p>
              </div>
              <div className="observation">
                <span>02</span>
                <p>
                  <strong>Assignments</strong>
                  {student.assignmentTotal
                    ? `${student.assignmentsCompleted} of ${student.assignmentTotal} assignments submitted.`
                    : "No assignments have been assigned."}
                </p>
              </div>
              <div className="observation">
                <span>03</span>
                <p>
                  <strong>Assessments</strong>
                  {student.assessmentCount
                    ? `${student.score}% average across ${student.assessmentCount} saved marks.`
                    : "No assessment marks recorded."}
                </p>
              </div>
            </Card>
          </div>
          <div className="insight-grid">
            <Card>
              <div className="card-head">
                <div>
                  <h2>Explainable warning reasons</h2>
                  <p>Observed data only</p>
                </div>
                <Badge tone={alert ? "warning" : "info"}>
                  {alert ? "REVIEW" : "NO ACTIVE ALERT"}
                </Badge>
              </div>
              {alert ? (
                <ul className="alert-reason-list">
                  {alert.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : (
                <p className="body-copy">
                  No active rule-based alert is attached to this student.
                  Missing records are not treated as zero performance.
                </p>
              )}
              <div className="callout neutral">
                <p>
                  Academic records alone do not establish health or personal
                  circumstances. Discuss possible explanations with the student.
                </p>
              </div>
            </Card>
            <Card>
              <h2>Recommended next steps</h2>
              {recommendations.length ? (
                <ul className="steps">
                  {recommendations.map((recommendation, index) => (
                    <li key={recommendation}>
                      <b>{index + 1}</b>
                      <span>
                        <strong>Support suggestion</strong>
                        {recommendation}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="body-copy">
                  No current indicators require a configured intervention. Ask
                  the student what goals or resources would be useful.
                </p>
              )}
              <Button onClick={() => createPlan(student.id)}>
                Create support plan
              </Button>
            </Card>
          </div>
        </>
      ) : tab === "Support History" ? (
        <Card>
          <h2>Support history</h2>
          {studentFollowups.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Due date</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {studentFollowups.map((item) => (
                    <tr key={String(item.id)}>
                      <td>{String(item.title)}</td>
                      <td>{String(item.due_date)}</td>
                      <td>{String(item.status)}</td>
                      <td>{String(item.notes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No support history"
              text="Follow-up tasks for this student will appear here."
            />
          )}
        </Card>
      ) : (
        <Card className="tab-placeholder">
          <Icon name="chart" size={36} />
          <h2>{tab} records</h2>
          <p>
            Use the {tab.toLowerCase()} workspace to view or update records for{" "}
            {student.name}.
          </p>
          <Button onClick={() => setTab("Overview")}>Back to overview</Button>
        </Card>
      )}
    </>
  )
}

function SupportPlans({
  goProgress,
  initialStudentId,
  modal,
  setModal,
}: {
  goProgress: () => void
  initialStudentId: string
  modal: boolean
  setModal: (open: boolean) => void
}) {
  const { students, followups, refresh, user } = useAcademicData()
  const [studentId, setStudentId] = useState(initialStudentId)
  const [title, setTitle] = useState("Academic mentoring")
  const [concern, setConcern] = useState("Multiple academic indicators")
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes] = useState(
    "Review the student's context and agree on one manageable next step.",
  )
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("All statuses")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const dueSoon = followups.filter(
    (item) =>
      item.status === "open" &&
      item.due_date <=
        new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  ).length
  const filtered = followups.filter(
    (item) =>
      (status === "All statuses" || item.status === status) &&
      (item.student_name + item.student_code + item.title + item.notes)
        .toLowerCase()
        .includes(query.toLowerCase()),
  )
  useEffect(() => setStudentId(initialStudentId), [initialStudentId])
  const activate = async () => {
    const target = students.find((student) => student.id === studentId)
    if (!target) {
      setError("Select an active student.")
      return
    }
    setSaving(true)
    setError("")
    try {
      await apiRequest("/followups", {
        method: "POST",
        body: JSON.stringify({
          student_id: target.recordId,
          title: `${concern}: ${title}`,
          due_date: dueDate,
          notes,
        }),
      })
      await refresh()
      setModal(false)
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Support plan could not be saved.",
      )
    } finally {
      setSaving(false)
    }
  }
  const complete = async (id: number) => {
    try {
      await apiRequest(`/followups/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      })
      await refresh()
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Follow-up status could not be updated.",
      )
    }
  }
  return (
    <>
      <PageHead
        title="Support plans"
        desc="Coordinate student-centred interventions and track their follow-up tasks."
        action={
          <Button onClick={() => setModal(true)}>
            <Icon name="plus" /> Create support plan
          </Button>
        }
      />
      <div className="mini-kpis">
        <Kpi
          icon="plan"
          label="Active plans"
          value={String(
            followups.filter((item) => item.status === "open").length,
          )}
          note="Open student support tasks"
        />
        <Kpi
          icon="calendar"
          label="Follow-ups this week"
          value={String(dueSoon)}
          note="Due in the next seven days"
          tone="purple"
        />
        <Kpi
          icon="alert"
          label="Overdue reviews"
          value={String(
            followups.filter(
              (item) => item.status === "open" && item.due_date < today,
            ).length,
          )}
          note="Follow-up required"
          tone="red"
        />
        <Kpi
          icon="chart"
          label="Completed"
          value={String(
            followups.filter((item) => item.status === "completed").length,
          )}
          note="Recorded completed tasks"
          tone="green"
        />
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <Card>
        <div className="toolbar">
          <div className="search">
            <Icon name="search" />
            <input
              placeholder="Search support tasks"
              aria-label="Search support plans"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <select
            aria-label="Filter plan status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>All statuses</option>
            <option value="open">Open</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        {filtered.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Main concern</th>
                  <th>Planned intervention</th>
                  <th>Assigned to</th>
                  <th>Follow-up</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="person">
                        <Avatar
                          initials={item.student_name
                            .split(/\s+/)
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)}
                        />
                        <div>
                          <strong>{item.student_name}</strong>
                          <small>{item.student_code}</small>
                        </div>
                      </div>
                    </td>
                    <td>{item.title.split(":")[0]}</td>
                    <td>
                      {item.title.split(":").slice(1).join(":").trim() ||
                        item.title}
                    </td>
                    <td>{user.name}</td>
                    <td>{item.due_date}</td>
                    <td>
                      <Badge
                        tone={
                          item.status === "completed" ? "success" : "warning"
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td>
                      {item.status === "open" && (
                        <button
                          className="link"
                          onClick={() => void complete(item.id)}
                        >
                          Mark complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No matching support tasks"
            text="Create a support plan or change the current filters."
          />
        )}
      </Card>
      {modal && (
        <div className="overlay" onMouseDown={() => setModal(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-plan-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="drawer-head">
              <div>
                <div className="eyebrow">NEW SUPPORT PLAN</div>
                <h2 id="support-plan-title">Create a support plan</h2>
                <p>
                  This creates a database-backed follow-up task assigned to the
                  signed-in user.
                </p>
              </div>
              <button
                className="icon-btn"
                aria-label="Close support plan form"
                onClick={() => setModal(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            <div className="form-grid">
              <Field label="Student">
                <select
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.id})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Concern category">
                <select
                  value={concern}
                  onChange={(event) => setConcern(event.target.value)}
                >
                  <option>Multiple academic indicators</option>
                  <option>Attendance</option>
                  <option>Assignment completion</option>
                  <option>Assessment performance</option>
                </select>
              </Field>
              <Field label="Recommended intervention">
                <select
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                >
                  <option>Academic mentoring</option>
                  <option>Attendance check-in</option>
                  <option>Assignment and deadline support</option>
                  <option>Assessment review and focused practice</option>
                  <option>Additional learning resources</option>
                </select>
              </Field>
              <Field label="Assigned to">
                <input readOnly value={user.name} />
              </Field>
              <Field label="Follow-up date">
                <input
                  type="date"
                  required
                  min={today}
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </Field>
              <Field label="Observations">
                <textarea
                  maxLength={2000}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </Field>
            </div>
            <div className="callout neutral">
              <p>
                Review the concern with the student and confirm their preferred
                next step before activating this plan.
              </p>
            </div>
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => void activate()}
                disabled={saving || !dueDate}
              >
                {saving ? "Saving plan…" : "Activate plan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Progress() {
  const { students, followups } = useAcademicData()
  const [studentCode, setStudentCode] = useState(students[0]?.id ?? "")
  const student =
    students.find((record) => record.id === studentCode) ?? students[0]
  useEffect(() => {
    if (!students.some((record) => record.id === studentCode))
      setStudentCode(students[0]?.id ?? "")
  }, [studentCode, students])
  if (!student)
    return (
      <EmptyState
        title="No students available"
        text="Add a student record to monitor progress."
      />
    )
  const studentFollowups = followups.filter(
    (item) => Number(item.student_id) === student.recordId,
  )
  return (
    <>
      <PageHead
        title="Progress monitoring"
        desc="Review current records and actual support follow-ups. Historical comparisons appear when dated records exist."
      />
      <Card className="filters">
        <Field label="Student">
          <select
            value={studentCode}
            onChange={(event) => setStudentCode(event.target.value)}
          >
            {students.map((record) => (
              <option key={record.id} value={record.id}>
                {record.name} ({record.id})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Configured term">
          <div className="date-control">
            <Icon name="calendar" /> Current term
          </div>
        </Field>
      </Card>
      <div className="profile-kpis compare">
        <Kpi
          icon="calendar"
          label="Attendance"
          value={
            student.attendanceRecordedDays
              ? `${student.attendanceDays} / ${student.workingDays}`
              : "Not recorded"
          }
          note={
            student.attendanceRecordedDays
              ? `${student.attendance}% of working days`
              : "No sessions recorded"
          }
          tone={
            student.attendanceRecordedDays && student.attendance < 75
              ? "red"
              : "green"
          }
        />
        <Kpi
          icon="plan"
          label="Assignments"
          value={
            student.assignmentTotal
              ? `${student.assignmentsCompleted} / ${student.assignmentTotal}`
              : "Not assigned"
          }
          note={
            student.assignmentTotal
              ? `${student.pendingAssignments} pending · ${student.overdueAssignments} overdue`
              : "No assignments assigned"
          }
        />
        <Kpi
          icon="chart"
          label="Assessment"
          value={student.assessmentCount ? `${student.score}%` : "No marks"}
          note={`${student.assessmentCount} recorded assessments`}
          tone={student.assessmentCount && student.score < 60 ? "red" : "green"}
        />
      </div>
      <div className="profile-grid">
        <Card>
          <div className="card-head">
            <div>
              <h2>Weekly cohort trends</h2>
              <p>Calculated from actual saved records</p>
            </div>
          </div>
          <TrendChart />
        </Card>
        <Card>
          <h2>Follow-up history · {student.name}</h2>
          {studentFollowups.length ? (
            <div className="timeline">
              {studentFollowups.map((item) => (
                <div key={String(item.id)}>
                  <i />
                  <span>{String(item.due_date)}</span>
                  <p>
                    <strong>{String(item.title)}</strong>
                    {String(item.status)} · {String(item.notes)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No follow-ups recorded"
              text="Create a support task to track actions and review dates."
            />
          )}
        </Card>
      </div>
      <div className="callout neutral wide">
        <Icon name="alert" />
        <p>
          <strong>Interpret with care:</strong> Current records describe
          observed indicators only. They do not establish why a change occurred
          or prove that an intervention caused it.
        </p>
      </div>
    </>
  )
}

function Reports() {
  const { students, classes, alerts, followups, calendar } = useAcademicData()
  const [className, setClassName] = useState("All classes")
  const [weeklyTrends, setWeeklyTrends] =
    useState<ApiBootstrap["dashboard"]["weekly_trends"]>([])
  const [trendError, setTrendError] = useState("")
  useEffect(() => {
    let active = true
    void apiRequest<{ weeks: ApiBootstrap["dashboard"]["weekly_trends"] }>(
      `/reports/trends?class=${
        className === "All classes" ? "" : encodeURIComponent(className)
      }`,
    )
      .then((result) => {
        if (active) {
          setWeeklyTrends(result.weeks)
          setTrendError("")
        }
      })
      .catch((reason) => {
        if (active)
          setTrendError(
            reason instanceof Error
              ? reason.message
              : "Weekly trends could not be loaded.",
          )
      })
    return () => {
      active = false
    }
  }, [className])
  const filtered =
    className === "All classes"
      ? students
      : students.filter((student) => student.className === className)
  const reportAlerts = alerts.filter(
    (alert) => className === "All classes" || alert.class_name === className,
  )
  const reportFollowups = followups.filter(
    (item) =>
      className === "All classes" ||
      students.some(
        (student) =>
          student.recordId === Number(item.student_id) &&
          student.className === className,
      ),
  )
  const average = (values: number[]) =>
    values.length
      ? Math.round(
          values.reduce((sum, value) => sum + value, 0) / values.length,
        )
      : 0
  const recordedAttendance = filtered.filter(
    (student) => student.attendanceRecordedDays > 0,
  )
  const attendanceAverage = average(
    recordedAttendance.map((student) => student.attendance),
  )
  const assessmentAverage = average(
    filtered
      .filter((student) => student.assessmentCount > 0)
      .map((student) => student.score),
  )
  const activeAlerts = reportAlerts.filter((alert) => alert.status === "open")
  const high = activeAlerts.filter((alert) => alert.priority === "High").length
  const medium = activeAlerts.filter(
    (alert) => alert.priority === "Medium",
  ).length
  const low = activeAlerts.filter((alert) => alert.priority === "Low").length
  const alertTotal = activeAlerts.length || 1
  const buckets = [
    ["90–100%", filtered.filter((student) => student.assignment >= 90).length],
    [
      "75–89%",
      filtered.filter(
        (student) => student.assignment >= 75 && student.assignment < 90,
      ).length,
    ],
    [
      "60–74%",
      filtered.filter(
        (student) => student.assignment >= 60 && student.assignment < 75,
      ).length,
    ],
    ["Below 60%", filtered.filter((student) => student.assignment < 60).length],
  ] as const
  const exportUrl = `/api/reports/students.csv${
    className === "All classes" ? "" : `?class=${encodeURIComponent(className)}`
  }`
  return (
    <>
      <PageHead
        title="Reports and analytics"
        desc="Current metrics are calculated from saved attendance, assignment, mark, and alert records."
        action={
          <a className="btn" href={exportUrl}>
            <Icon name="report" /> Download CSV
          </a>
        }
      />
      <div className="callout privacy">
        <Icon name="alert" />
        <p>
          <strong>Sensitive student information.</strong> Exported reports
          contain authorised student data; store and share them only according
          to institutional policy.
        </p>
      </div>
      <Card className="filters">
        <Field label="Class">
          <select
            value={className}
            onChange={(event) => setClassName(event.target.value)}
          >
            <option>All classes</option>
            {classes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Academic term">
          <input
            readOnly
            value={`${calendar.startDate} to ${calendar.endDate}`}
          />
        </Field>
        <Field label="Records included">
          <input readOnly value={`${filtered.length} students`} />
        </Field>
      </Card>
      <div className="report-grid">
        <Card>
          <div className="card-head">
            <div>
              <h2>Weekly attendance, assignment and marks trends</h2>
              <p>Calculated from saved records for {className}</p>
            </div>
            <strong>
              {recordedAttendance.length
                ? `${attendanceAverage}%`
                : "Not recorded"}
            </strong>
          </div>
          {trendError && (
            <div className="form-error" role="alert">
              {trendError}
            </div>
          )}
          <TrendChart data={weeklyTrends} />
          {recordedAttendance.length ? (
            <div className="report-bars">
              {recordedAttendance.map((student) => (
                <div className="report-bar-row" key={student.id}>
                  <span>{student.name}</span>
                  <i>
                    <em
                      className="blue-bar"
                      style={{ width: `${student.attendance}%` }}
                    />
                  </i>
                  <b>
                    {student.attendanceDays}/{student.workingDays}
                  </b>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No attendance sessions recorded"
              text="The chart shows only weeks with recorded measures."
            />
          )}
        </Card>
        <Card>
          <div className="card-head">
            <div>
              <h2>Open alert distribution</h2>
              <p>Rule-generated review priorities</p>
            </div>
            <strong>{activeAlerts.length}</strong>
          </div>
          <div className="donut-row">
            <div
              className="donut"
              style={{
                background: `conic-gradient(var(--red) 0 ${(high / alertTotal) * 100}%,var(--amber) ${(high / alertTotal) * 100}% ${((high + medium) / alertTotal) * 100}%,var(--blue) ${((high + medium) / alertTotal) * 100}% 100%)`,
              }}
            >
              <span>
                <strong>{activeAlerts.length}</strong>
                <small>open</small>
              </span>
            </div>
            <div className="legend-v">
              <span>
                <i className="dot red" />
                High priority <b>{high}</b>
              </span>
              <span>
                <i className="dot amber" />
                Medium priority <b>{medium}</b>
              </span>
              <span>
                <i className="dot blue" />
                Low priority <b>{low}</b>
              </span>
            </div>
          </div>
        </Card>
        <Card>
          <div className="card-head">
            <div>
              <h2>Assignment completion</h2>
              <p>Students grouped by recorded completion rate</p>
            </div>
            <strong>
              {average(filtered.map((student) => student.assignment))}%
            </strong>
          </div>
          <div className="bars">
            {buckets.map(([label, count]) => (
              <div key={label}>
                <span>{label}</span>
                <i>
                  <em
                    style={{
                      width: `${
                        filtered.length ? (count / filtered.length) * 100 : 0
                      }%`,
                    }}
                  />
                </i>
                <b>{count}</b>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="card-head">
            <div>
              <h2>Assessment performance</h2>
              <p>Average of recorded assessment marks</p>
            </div>
            <strong>{assessmentAverage}%</strong>
          </div>
          {filtered.filter((student) => student.assessmentCount > 0).length ? (
            <div className="report-bars">
              {filtered
                .filter((student) => student.assessmentCount > 0)
                .map((student) => (
                  <div className="report-bar-row" key={student.id}>
                    <span>{student.name}</span>
                    <i>
                      <em
                        className="green-bar"
                        style={{ width: `${student.score}%` }}
                      />
                    </i>
                    <b>{student.score}%</b>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState
              title="No marks recorded"
              text="Saved marks will appear here."
            />
          )}
        </Card>
        <Card>
          <div className="card-head">
            <div>
              <h2>Follow-up completion</h2>
              <p>Current tasks for selected records</p>
            </div>
          </div>
          <div className="status-summary">
            <div>
              <strong>
                {
                  reportFollowups.filter((item) => item.status === "open")
                    .length
                }
              </strong>
              <span>Open</span>
            </div>
            <div>
              <strong>
                {
                  reportFollowups.filter((item) => item.status === "completed")
                    .length
                }
              </strong>
              <span>Completed</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}

function Settings() {
  const { user, thresholds, refresh, resetDemoData } = useAcademicData()
  const [draft, setDraft] = useState(thresholds)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  useEffect(() => setDraft(thresholds), [thresholds])
  const saveThresholds = async () => {
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      await apiRequest("/settings/thresholds", {
        method: "PUT",
        body: JSON.stringify(draft),
      })
      await refresh()
      setSaved(true)
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Thresholds could not be saved.",
      )
    } finally {
      setSaving(false)
    }
  }
  const updateThreshold = (key: keyof typeof draft, value: string) =>
    setDraft((current) => ({ ...current, [key]: Number(value) }))
  const academicYears = `${new Date(`${useAcademicData().calendar.startDate}T00:00:00Z`).getUTCFullYear()}–${new Date(`${useAcademicData().calendar.endDate}T00:00:00Z`).getUTCFullYear()}`
  return (
    <>
      <PageHead
        title="Settings"
        desc="Configure institutional review indicators, access and privacy."
        action={
          <Button onClick={saveThresholds} disabled={saving}>
            {saving ? "Saving…" : "Save thresholds"}
          </Button>
        }
      />
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {saved && (
        <div className="callout neutral" role="status">
          <p>
            Review thresholds saved. Open alerts are recalculated from current
            academic records.
          </p>
        </div>
      )}
      <div className="settings-grid">
        <Card>
          <div className="settings-title">
            <span>
              <Icon name="settings" />
            </span>
            <div>
              <h2>Academic settings</h2>
              <p>Institution-wide configuration</p>
            </div>
          </div>
          <div className="form-grid">
            <Field label="Academic year">
              <input value={academicYears} readOnly />
            </Field>
            <Field label="Default reporting period">
              <input value="Configured term dates" readOnly />
            </Field>
          </div>
          <hr />
          <h3>Review thresholds</h3>
          <p className="body-copy">
            Signals prompt teacher review; they are not universal standards or
            automatic decisions.
          </p>
          <div className="threshold">
            <div>
              <strong>Attendance warning threshold</strong>
              <small>Flag records below this value</small>
            </div>
            <input
              aria-label="Attendance warning threshold"
              type="number"
              min="0"
              max="100"
              value={draft.attendance}
              onChange={(event) =>
                updateThreshold("attendance", event.target.value)
              }
            />
            <span>%</span>
          </div>
          <div className="threshold">
            <div>
              <strong>Assignment completion threshold</strong>
              <small>Flag records below this value</small>
            </div>
            <input
              aria-label="Assignment completion threshold"
              type="number"
              min="0"
              max="100"
              value={draft.assignment}
              onChange={(event) =>
                updateThreshold("assignment", event.target.value)
              }
            />
            <span>%</span>
          </div>
          <div className="threshold">
            <div>
              <strong>Assessment average threshold</strong>
              <small>Flag low recorded averages</small>
            </div>
            <input
              aria-label="Assessment threshold"
              type="number"
              min="0"
              max="100"
              value={draft.assessment}
              onChange={(event) =>
                updateThreshold("assessment", event.target.value)
              }
            />
            <span>%</span>
          </div>
          <div className="threshold">
            <div>
              <strong>Assessment decline threshold</strong>
              <small>Change from previous period</small>
            </div>
            <input
              aria-label="Decline threshold"
              type="number"
              min="1"
              max="100"
              value={draft.decline}
              onChange={(event) =>
                updateThreshold("decline", event.target.value)
              }
            />
            <span>pts</span>
          </div>
          <div className="threshold">
            <div>
              <strong>Repeated overdue assignment threshold</strong>
              <small>Number of overdue submissions</small>
            </div>
            <input
              aria-label="Repeated missing threshold"
              type="number"
              min="1"
              max="100"
              value={draft.repeatedMissing}
              onChange={(event) =>
                updateThreshold("repeatedMissing", event.target.value)
              }
            />
            <span>assignments</span>
          </div>
        </Card>
        <div>
          <Card>
            <div className="settings-title">
              <span>
                <Icon name="users" />
              </span>
              <div>
                <h2>Signed-in user</h2>
                <p>Role checked by the server for every write</p>
              </div>
            </div>
            <div className="role-row">
              <div>
                <strong>{user.name}</strong>
                <small>
                  {user.email} · {user.role}
                </small>
              </div>
            </div>
            <p className="body-copy">
              This local demo seeds one administrator account. Add
              institution-managed accounts before deployment.
            </p>
          </Card>
          <Card className="privacy-card">
            <div className="settings-title">
              <span>
                <Icon name="report" />
              </span>
              <div>
                <h2>Privacy & retention</h2>
                <p>Prototype storage and security boundary</p>
              </div>
            </div>
            <p>
              Student records are stored in a local SQLite file and role-checked
              by the API. Use HTTPS, secret-managed credentials, backups, and an
              institutional retention policy before production use.
            </p>
            {import.meta.env.DEV && user.role === "administrator" && (
              <Button
                variant="danger"
                onClick={() => {
                  if (
                    window.confirm(
                      "Reset all local records and restore the fictional demo data? This cannot be undone.",
                    )
                  )
                    void resetDemoData()
                }}
              >
                Reset demo data
              </Button>
            )}
          </Card>
        </div>
      </div>
      <AcademicCalendarSettings />
    </>
  )
}

function AcademicCalendarSettings() {
  const { calendar, saveCalendar, workingDays } = useAcademicData()
  const [draft, setDraft] = useState(calendar)
  const [holidayDate, setHolidayDate] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  useEffect(() => setDraft(calendar), [calendar])
  const weekdays = [
    { name: "Monday", value: 1 },
    { name: "Tuesday", value: 2 },
    { name: "Wednesday", value: 3 },
    { name: "Thursday", value: 4 },
    { name: "Friday", value: 5 },
    { name: "Saturday", value: 6 },
    { name: "Sunday", value: 0 },
  ]
  const updateCalendar = (changes: Partial<AcademicCalendar>) => {
    setDraft((current) => ({ ...current, ...changes }))
    setSaved(false)
    setError("")
  }
  const draftWorkingDays = countWorkingDays(draft)
  const addHoliday = () => {
    if (
      !holidayDate ||
      holidayDate < draft.startDate ||
      holidayDate > draft.endDate ||
      draft.holidays.includes(holidayDate)
    )
      return
    updateCalendar({ holidays: [...draft.holidays, holidayDate].sort() })
    setHolidayDate("")
  }
  const submitCalendar = async () => {
    setSaving(true)
    setError("")
    try {
      await saveCalendar(draft)
      setSaved(true)
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Calendar could not be saved.",
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="calendar-card">
      <div className="calendar-card-head">
        <div>
          <div className="eyebrow">TERM CALENDAR</div>
          <h2>College working days</h2>
          <p>
            Working days are counted from the selected dates, weekdays and
            holidays.
          </p>
        </div>
        <div className="working-day-total">
          <strong>{draftWorkingDays}</strong>
          <span>working days</span>
        </div>
      </div>
      <div className="form-grid">
        <Field label="Term starts">
          <input
            type="date"
            value={draft.startDate}
            onChange={(event) =>
              updateCalendar({ startDate: event.target.value })
            }
          />
        </Field>
        <Field label="Term ends">
          <input
            type="date"
            value={draft.endDate}
            onChange={(event) =>
              updateCalendar({ endDate: event.target.value })
            }
          />
        </Field>
      </div>
      <fieldset className="weekday-fieldset">
        <legend>Working weekdays</legend>
        <div className="weekday-options">
          {weekdays.map((day) => (
            <label className="weekday-option" key={day.value}>
              <input
                type="checkbox"
                checked={draft.workingWeekdays.includes(day.value)}
                onChange={(event) =>
                  updateCalendar({
                    workingWeekdays: event.target.checked
                      ? [...draft.workingWeekdays, day.value].sort()
                      : draft.workingWeekdays.filter(
                          (value) => value !== day.value,
                        ),
                  })
                }
              />
              <span>{day.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="holiday-controls">
        <Field label="College holiday">
          <input
            type="date"
            aria-label="College holiday"
            min={draft.startDate}
            max={draft.endDate}
            value={holidayDate}
            onChange={(event) => setHolidayDate(event.target.value)}
          />
        </Field>
        <Button variant="secondary" onClick={addHoliday}>
          <Icon name="plus" /> Add holiday
        </Button>
      </div>
      <div className="holiday-list">
        <strong>Excluded holidays</strong>
        {draft.holidays.length ? (
          draft.holidays.map((date) => (
            <span className="holiday-chip" key={date}>
              {date}
              <button
                type="button"
                aria-label={`Remove holiday ${date}`}
                onClick={() =>
                  updateCalendar({
                    holidays: draft.holidays.filter((value) => value !== date),
                  })
                }
              >
                <Icon name="close" size={14} />
              </button>
            </span>
          ))
        ) : (
          <small>No holidays added</small>
        )}
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {draftWorkingDays === 0 ? (
        <div className="form-error">
          Choose a valid date range containing at least one selected working
          weekday.
        </div>
      ) : (
        <div className="callout neutral calendar-note">
          <p>
            Attendance rates recalculate as days attended ÷ {draftWorkingDays}{" "}
            working days. Saving updates all student views; {workingDays} days
            are currently saved.
          </p>
        </div>
      )}
      <div className="modal-actions">
        <Button
          onClick={submitCalendar}
          disabled={saving || draftWorkingDays === 0}
        >
          {saving ? "Saving calendar…" : "Save calendar"}
        </Button>
        {saved && <Badge tone="success">Calendar saved</Badge>}
      </div>
    </Card>
  )
}

function DesignSystem() {
  return (
    <>
      <PageHead
        title="StudentPulse design system"
        desc="A consistent, accessible foundation for trusted academic support experiences."
      />
      <div className="ds-grid">
        <Card>
          <h2>Colour tokens</h2>
          <div className="swatches">
            {["navy", "blue", "green", "amber", "red", "slate"].map((x) => (
              <div key={x}>
                <i className={x} />
                <span>{x}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2>Typography</h2>
          <div className="type-scale">
            <h1>Page heading</h1>
            <h2>Section heading</h2>
            <h3>Component heading</h3>
            <p>Body text for clear and reassuring communication.</p>
            <small>Metadata and supporting labels</small>
          </div>
        </Card>
        <Card>
          <h2>Buttons</h2>
          <div className="component-row">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Danger</Button>
            <button className="btn" disabled>
              Disabled
            </button>
          </div>
          <h2>Form controls</h2>
          <div className="form-grid">
            <Field label="Text input">
              <input placeholder="Enter value" />
            </Field>
            <Field label="Select menu">
              <select>
                <option>Select option</option>
              </select>
            </Field>
          </div>
        </Card>
        <Card>
          <h2>Status badges</h2>
          <div className="component-row">
            <Badge tone="success">On Track</Badge>
            <Badge tone="warning">Needs Review</Badge>
            <Badge tone="danger">Priority Review</Badge>
            <Badge tone="info">In Progress</Badge>
          </div>
          <h2>Feedback states</h2>
          <div className="callout neutral">
            <p>Informational message with clear next steps.</p>
          </div>
          <div className="skeleton">
            <i />
            <i />
            <i />
          </div>
        </Card>
        <Card className="ds-wide">
          <h2>Spacing, grid & responsive behaviour</h2>
          <div className="spacing">
            {[4, 8, 12, 16, 24, 32].map((x) => (
              <div key={x}>
                <i style={{ width: x * 2 }} />
                <span>{x}px</span>
              </div>
            ))}
          </div>
          <div className="breakpoints">
            <div>
              <strong>Desktop</strong>
              <span>1440px · 12-column grid</span>
            </div>
            <div>
              <strong>Tablet</strong>
              <span>768px · 8-column grid</span>
            </div>
            <div>
              <strong>Mobile</strong>
              <span>390px · 4-column grid</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}

function AIChat() {
  const { students, user } = useAcademicData()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<{
    role: "ai" | "user"
    text: string
  }[]>([
    {
      role: "ai",
      text: `Hello ${user.name}. I’m your generative academic support coach. I can help with recorded academic indicators and student-centred next steps, but I don’t infer personal circumstances or replace your professional judgement.`,
    },
  ])
  const [input, setInput] = useState("")
  const [error, setError] = useState("")
  const [failedQuestion, setFailedQuestion] = useState("")
  const [sending, setSending] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (!open) return
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight })
    inputRef.current?.focus()
  }, [messages, open])

  async function send(text = input, retry = false) {
    const question = text.trim()
    if (!question || sending) return
    setSending(true)
    setError("")
    if (!retry) {
      setMessages((current) => [...current, { role: "user", text: question }])
    }
    try {
      const historyMessages =
        retry &&
        messages.at(-1)?.role === "user" &&
        messages.at(-1)?.text === question
          ? messages.slice(0, -1)
          : messages
      const result = await apiRequest<{ reply: string }>(
        "/support-coach/chat",
        {
          method: "POST",
          body: JSON.stringify({
            message: question,
            history: historyMessages.slice(-8).map((item) => ({
              role: item.role === "ai" ? "assistant" : "user",
              content: item.text,
            })),
          }),
        },
      )
      setMessages((current) => [...current, { role: "ai", text: result.reply }])
      setFailedQuestion("")
      setInput("")
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The support coach could not respond. Please try again.",
      )
      setFailedQuestion(question)
    } finally {
      setSending(false)
    }
  }

  const suggestions = [
    students[0] && `How can I support ${students[0].name.split(/\s+/)[0]}?`,
    "What attendance support could I offer?",
    "Help me plan a respectful check-in",
  ].filter((suggestion): suggestion is string => Boolean(suggestion))

  return (
    <>
      <button
        id="ai-chat"
        className="chat-launch"
        type="button"
        aria-expanded={open}
        aria-controls="studentpulse-coach"
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name={open ? "close" : "spark"} />
        <span>{open ? "Close" : "Ask StudentPulse AI"}</span>
      </button>
      {open && (
        <aside
          id="studentpulse-coach"
          className="chat-panel"
          aria-label="StudentPulse Support Coach"
        >
          <div className="chat-head">
            <span>
              <Icon name="spark" />
            </span>
            <div>
              <strong>StudentPulse Support Coach</strong>
              <small>
                <i /> Gemini AI coach
              </small>
            </div>
            <button
              className="icon-btn"
              type="button"
              aria-label="Close support coach"
              onClick={() => setOpen(false)}
            >
              <Icon name="close" />
            </button>
          </div>
          <div className="ai-disclaimer">
            Suggestions only. Review context and use professional judgement
            before acting.
          </div>
          <div
            className="messages"
            ref={messagesRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-label="Conversation"
          >
            {messages.map((message, index) => (
              <div className={`message ${message.role}`} key={index}>
                {message.role === "ai" && (
                  <span className="bot-mark">
                    <Icon name="spark" />
                  </span>
                )}
                <p>{message.text}</p>
              </div>
            ))}
          </div>
          {messages.length === 1 && (
            <div className="prompts">
              <span>Try asking</span>
              {suggestions.map((suggestion) => (
                <button
                  type="button"
                  onClick={() => void send(suggestion)}
                  key={suggestion}
                >
                  {suggestion}
                  <Icon name="arrow" />
                </button>
              ))}
            </div>
          )}
          {error && (
            <div className="chat-error" role="alert">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => void send(failedQuestion, true)}
                disabled={sending}
              >
                Retry
              </button>
            </div>
          )}
          <form
            className="chat-input"
            onSubmit={(event) => {
              event.preventDefault()
              void send()
            }}
          >
            <textarea
              ref={inputRef}
              aria-label="Ask the StudentPulse support coach"
              maxLength={600}
              placeholder="Ask about recorded academic progress…"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  void send()
                }
              }}
            />
            <button
              type="submit"
              aria-label={sending ? "Sending message" : "Send message"}
              disabled={!input.trim() || sending}
            >
              {sending ? (
                <span className="chat-spinner" aria-hidden="true" />
              ) : (
                <Icon name="arrow" />
              )}
            </button>
          </form>
          <small className="chat-foot">
            Responses are generated by Google Gemini. When a student is identified,
            only their academic summary and this conversation are sent. Don’t
            include sensitive personal information.
          </small>
        </aside>
      )}
    </>
  )
}

export default function App() {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [bootstrap, setBootstrap] = useState<ApiBootstrap | null>(null)
  const [authState, setAuthState] =
    useState<"checking" | "signed_out" | "loading" | "ready" | "unavailable">(
      "checking",
    )
  const [startupError, setStartupError] = useState("")
  const [page, setPage] = useState<Page>("Dashboard")
  const [planModal, setPlanModal] = useState(false)
  const [planStudentId, setPlanStudentId] = useState("S003")
  const [profileStudentCode, setProfileStudentCode] = useState("S003")
  const refresh = async () => {
    const data = await apiRequest<ApiBootstrap>("/bootstrap")
    setBootstrap(data)
    return data
  }
  const resetDemoData = async () => {
    await apiRequest("/dev/reset-demo-data", { method: "POST" })
    setUser(null)
    setBootstrap(null)
    setAuthState("signed_out")
  }
  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const currentUser = await apiRequest<ApiUser>("/auth/session")
        const data = await apiRequest<ApiBootstrap>("/bootstrap")
        if (active) {
          setUser(currentUser)
          setBootstrap(data)
          setAuthState("ready")
        }
      } catch (error) {
        if (!active) return
        if (error instanceof ApiError && error.status === 401)
          setAuthState("signed_out")
        else {
          setStartupError(
            error instanceof Error
              ? error.message
              : "The application service is unavailable.",
          )
          setAuthState("unavailable")
        }
      }
    })()
    return () => {
      active = false
    }
  }, [])
  const signIn = async (email: string, password: string) => {
    const signedInUser = await apiRequest<ApiUser>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    const data = await apiRequest<ApiBootstrap>("/bootstrap")
    setUser(signedInUser)
    setBootstrap(data)
    setAuthState("ready")
  }
  const signOut = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" })
    } finally {
      setUser(null)
      setBootstrap(null)
      setAuthState("signed_out")
      setPage("Dashboard")
    }
  }
  if (authState === "checking" || authState === "loading")
    return (
      <main className="startup-state" role="status">
        Connecting to the StudentPulse academic records…
      </main>
    )
  if (authState === "unavailable")
    return (
      <main className="startup-state" role="alert">
        <h1>StudentPulse is unavailable</h1>
        <p>{startupError}</p>
        <Button onClick={() => window.location.reload()}>Reconnect</Button>
      </main>
    )
  if (!user || !bootstrap) return <Login onLogin={signIn} />
  const calendar = bootstrap.calendar
  const workingDays = countWorkingDays(calendar)
  const students = mapStudents(bootstrap.students, bootstrap.alerts)
  const saveCalendar = async (nextCalendar: AcademicCalendar) => {
    await apiRequest("/settings/calendar", {
      method: "PUT",
      body: JSON.stringify(nextCalendar),
    })
    await refresh()
  }
  const academicData = {
    calendar,
    saveCalendar,
    workingDays,
    students,
    user,
    dashboard: bootstrap.dashboard,
    alerts: bootstrap.alerts,
    notifications: bootstrap.notifications,
    thresholds: bootstrap.thresholds,
    followups: bootstrap.followups,
    classes: bootstrap.classes,
    refresh,
    resetDemoData,
  }
  const createPlan = (studentId = "S003") => {
    setPlanStudentId(studentId)
    setPlanModal(true)
    setPage("Support Plans")
  }
  const openProfile = (studentCode = "S003") => {
    setProfileStudentCode(studentCode)
    setPage("Student Profile")
  }
  let body: React.ReactNode
  switch (page) {
    case "Dashboard":
      body = <Dashboard setPage={setPage} openProfile={openProfile} />
      break
    case "Students":
      body = <Students openProfile={openProfile} />
      break
    case "Attendance":
      body = (
        <AttendancePage
          students={bootstrap.students}
          classes={bootstrap.classes}
          refresh={refresh}
          calendar={calendar}
        />
      )
      break
    case "Assignments":
      body = (
        <AssignmentsPage
          students={bootstrap.students}
          classes={bootstrap.classes}
          refresh={refresh}
        />
      )
      break
    case "Assessments":
      body = (
        <AssessmentsPage
          students={bootstrap.students}
          classes={bootstrap.classes}
          refresh={refresh}
        />
      )
      break
    case "Early-Warning Alerts":
      body = <Alerts openProfile={openProfile} createPlan={createPlan} />
      break
    case "Follow-ups":
      body = (
        <FollowupsPage
          students={bootstrap.students}
          classes={bootstrap.classes}
          refresh={refresh}
          followups={bootstrap.followups}
        />
      )
      break
    case "Student Profile":
      body = (
        <StudentProfile
          createPlan={createPlan}
          studentCode={profileStudentCode}
        />
      )
      break
    case "Support Plans":
      body = (
        <SupportPlans
          goProgress={() => setPage("Progress Monitoring")}
          initialStudentId={planStudentId}
          modal={planModal}
          setModal={setPlanModal}
        />
      )
      break
    case "Progress Monitoring":
      body = <Progress />
      break
    case "Reports":
      body = <Reports />
      break
    case "Settings":
      body = <Settings />
      break
    default:
      body = <DesignSystem />
  }
  return (
    <AcademicDataContext.Provider value={academicData}>
      <Shell page={page} setPage={setPage} onLogout={signOut}>
        {body}
      </Shell>
      <AIChat />
    </AcademicDataContext.Provider>
  )
}

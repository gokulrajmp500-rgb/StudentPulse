export type CoachStudent = {
  id: string

  name: string

  attendanceDays: number

  attendanceRecordedDays: number

  workingDays: number

  attendance: number

  assignmentsCompleted: number

  assignmentTotal: number

  assignment: number

  assessmentCount: number

  score: number

  previousScore: number
}

export type CoachThresholds = {
  attendance: number

  assignment: number

  decline: number
}

function hasTerm(text: string, expression: RegExp) {
  return expression.test(text)
}

export function getCoachReply(
  prompt: string,

  students: CoachStudent[],

  thresholds: CoachThresholds,
) {
  const query = prompt.toLocaleLowerCase().normalize("NFKC")

  if (
    hasTerm(
      query,

      /\b(?:health|medical|diagnos\w*|depress\w*|anx\w*|disabilit\w*|medicat\w*|therap\w*)\b/,
    )
  ) {
    return "Academic records cannot explain a student's health or personal circumstances. Do not infer a diagnosis or cause from attendance, assignments, or assessment data. Ask what support the student would find helpful, follow your institution's referral process, and keep sensitive health details out of this chat."
  }

  const words = new Set(query.match(/[\p{L}\p{N}]+/gu) ?? [])

  const idMatches = students.filter((student) =>
    words.has(student.id.toLocaleLowerCase()),
  )

  const nameMatches = students.filter((student) => {
    const nameTokens = student.name

      .toLocaleLowerCase()

      .normalize("NFKC")

      .match(/[\p{L}\p{N}]+/gu)

    return (
      nameTokens?.some((token) => token.length > 1 && words.has(token)) ?? false
    )
  })

  const matches = idMatches.length ? idMatches : nameMatches

  if (matches.length > 1) {
    return `I found more than one matching student. Please use a student ID to select one: ${matches.map((student) => `${student.name} (${student.id})`).join(", ")}.`
  }

  const student = matches[0]

  const asksAttendance = hasTerm(
    query,

    /\b(?:attend\w*|absence\w*|absent|late|present|register)\b/,
  )

  const asksAssignments = hasTerm(
    query,

    /\b(?:assignment\w*|homework|coursework|deadline\w*|incomplete|submission\w*)\b/,
  )

  const asksAssessment = hasTerm(
    query,

    /\b(?:score\w*|assessment\w*|exam\w*|test\w*|grade\w*|performance|mark\w*)\b/,
  )

  const asksSupport = hasTerm(
    query,

    /\b(?:plan|intervention|mentor|support|help|recommend|checkin)\b/,
  )

  const asksOverview =
    asksSupport ||
    hasTerm(query, /\b(?:overall|summary|progress|status|indicator\w*)\b/)

  const asksSomething =
    asksAttendance || asksAssignments || asksAssessment || asksOverview

  if (!student && !asksSomething) {
    return "I can summarize a student's recorded progress, review attendance, assignments, or assessment results, and suggest supportive next steps. Include a student's name or ID to use their records. I cannot infer causes or personal circumstances."
  }

  if (!student) {
    const suggestions = [
      asksAttendance &&
        "For attendance, verify the dates and register, then invite the student to discuss barriers without assuming a cause.",

      asksAssignments &&
        "For assignments, confirm outstanding work and deadlines, then agree on one manageable task and any support the student wants.",

      asksAssessment &&
        "For assessments, review feedback across more than one result, identify a topic to practise, and offer learning resources; scores alone do not explain a cause.",

      asksOverview &&
        "For a support plan, ask the student what would help, agree on one specific next step together, and set a follow-up date.",
    ].filter(Boolean)

    return `${suggestions.join(" ")} Include a student name or ID for guidance grounded in recorded data.`
  }

  const studentLabel = `${student.name} (${student.id})`

  if (!asksSomething) {
    return `I found ${studentLabel}. Ask about their attendance, assignments, assessment results, or overall progress.`
  }

  const details: string[] = []

  const concerns: string[] = []

  const supportOptions: string[] = []

  if (asksAttendance || asksOverview) {
    if (student.attendanceRecordedDays > 0 && student.workingDays > 0) {
      details.push(
        `Attendance: ${student.attendanceDays} of ${student.workingDays} college working days (${student.attendance}%).`,
      )

      if (student.attendance < thresholds.attendance) {
        concerns.push(
          `attendance is below the ${thresholds.attendance}% review threshold`,
        )

        supportOptions.push("a supportive attendance check-in")
      }
    } else {
      details.push(
        "Attendance: no sessions have been recorded for the configured term.",
      )
    }
  }

  if (asksAssignments || asksOverview) {
    if (student.assignmentTotal > 0) {
      details.push(
        `Assignments: ${student.assignmentsCompleted} of ${student.assignmentTotal} completed (${student.assignment}%).`,
      )

      if (student.assignment < thresholds.assignment) {
        concerns.push(
          `assignment completion is below the ${thresholds.assignment}% review threshold`,
        )

        supportOptions.push("structured assignment planning")
      }
    } else {
      details.push("Assignments: none have been assigned.")
    }
  }

  if (asksAssessment || asksOverview) {
    if (student.assessmentCount > 0) {
      details.push(
        `Assessment average: ${student.score}% across ${student.assessmentCount} recorded assessments.`,
      )

      const decline = student.previousScore - student.score

      if (decline >= thresholds.decline) {
        concerns.push(
          `the recorded assessment average has declined by ${Math.round(decline)} points, meeting the ${thresholds.decline}-point review threshold`,
        )

        supportOptions.push(
          "review of assessment feedback and focused practice",
        )
      }
    } else {
      details.push("Assessment results: no marks have been recorded.")
    }
  }

  if (!asksOverview) {
    const guidance = [
      asksAttendance &&
        "Verify the dates and pattern with the student, ask about barriers without assuming a cause, and agree on a practical next step.",

      asksAssignments &&
        "Confirm which work remains, then agree on one manageable task, a realistic deadline, and any support the student wants.",

      asksAssessment &&
        "Review feedback together, identify one topic to practise, and offer learning resources. Results alone do not explain why scores changed.",
    ].filter(Boolean)

    return `${studentLabel}. ${details.join(" ")} ${guidance.join(" ")}`
  }

  const nextStep = concerns.length
    ? `Review these recorded signals with the student: ${concerns.join("; ")}. Based on what they say, consider ${supportOptions.join(", ")}.`
    : "No configured review threshold is currently crossed in the recorded measures. Recognize progress and ask what goals or resources would be useful next."

  return `For ${studentLabel}, the recorded indicators are: ${details.join(" ")} ${nextStep} Agree on one next step and a follow-up date together; these records do not establish causes or outcomes.`
}

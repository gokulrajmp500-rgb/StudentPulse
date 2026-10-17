import { useEffect, useState } from "react";
import { apiRequest, type ApiBootstrap, type ApiStudent } from "./api";

type SharedPageProps = { students: ApiStudent[]; classes: string[]; refresh: () => Promise<ApiBootstrap> };
type PageHeadProps = { title: string; description: string; action?: React.ReactNode };
type AttendanceRecord = { student_id: number; student_code: string; name: string; class_name: string; status: "present" | "absent" | "late" | null };
type Assignment = { id: number; title: string; class_name: string; subject: string; due_date: string; assigned_count: number; submitted_count: number; overdue_count: number };
type Submission = { student_id: number; student_code: string; name: string; status: "pending" | "submitted" | "excused"; due_date: string };
type Followup = { id: number; student_id: number; student_code: string; student_name: string; title: string; due_date: string; status: "open" | "completed"; notes: string };

function PageHead({ title, description, action }: PageHeadProps) {
  return <div className="page-head"><div><h1>{title}</h1><p>{description}</p></div>{action&&<div>{action}</div>}</div>;
}

function Notice({ error, success }: { error: string; success: string }) {
  return <>{error&&<div className="form-error" role="alert">{error}</div>}{success&&<div className="callout neutral" role="status"><p>{success}</p></div>}</>;
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string)=>void; options: string[] }) {
  return <label className="field"><span>{label}</span><select value={value} onChange={event=>onChange(event.target.value)}>{options.map(option=><option key={option}>{option}</option>)}</select></label>;
}

function CsvImportPanel({ title, columns, templateName, template, validatePath, importPath, onImported }: { title:string; columns:string; templateName:string; template:string; validatePath:string; importPath:string; onImported:()=>Promise<void> }) {
  const [open,setOpen]=useState(false);const [file,setFile]=useState<File|null>(null);const [validation,setValidation]=useState<{count:number;valid:boolean;errors:Array<{row:number;field:string;message:string}>}|null>(null);const [error,setError]=useState("");const [success,setSuccess]=useState("");const [busy,setBusy]=useState(false);
  const validate=async()=>{
    if(!file)return;
    setBusy(true);setError("");setSuccess("");
    try{setValidation(await apiRequest<typeof validation & {}>(validatePath,{method:"POST",headers:{"content-type":"text/csv"},body:await file.text()}));}
    catch(reason){setError(reason instanceof Error?reason.message:"CSV validation failed.");}
    finally{setBusy(false);}
  };
  const importFile=async()=>{
    if(!file||!validation?.valid)return;
    setBusy(true);setError("");
    try{const result=await apiRequest<Record<string,number>>(importPath,{method:"POST",headers:{"content-type":"text/csv"},body:await file.text()});await onImported();setSuccess(`${result.imported??result.imported_marks??0} CSV record${(result.imported??result.imported_marks??0)===1?"":"s"} imported.`);setFile(null);setValidation(null);}
    catch(reason){setError(reason instanceof Error?reason.message:"CSV import failed.");}
    finally{setBusy(false);}
  };
  return <><div className="csv-import-action"><button className="btn secondary" onClick={()=>setOpen(true)}>Import CSV</button><a className="link" download={templateName} href={`data:text/csv;charset=utf-8,${encodeURIComponent(template)}`}>Template</a></div>{open&&<div className="overlay" onMouseDown={()=>setOpen(false)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby={`csv-${title}`} onMouseDown={event=>event.stopPropagation()}><div className="drawer-head"><div><div className="eyebrow">BULK IMPORT</div><h2 id={`csv-${title}`}>Import {title} CSV</h2><p>Required columns: {columns}. No rows are written until the complete file passes validation.</p></div><button className="icon-btn" aria-label={`Close ${title} import`} onClick={()=>setOpen(false)}>×</button></div><label className="field"><span>CSV file</span><input type="file" accept=".csv,text/csv" onChange={event=>{setFile(event.target.files?.[0]??null);setValidation(null);setError("");}}/></label>{error&&<div className="form-error" role="alert">{error}</div>}{success&&<div className="callout neutral" role="status"><p>{success}</p></div>}{validation&&<div className={validation.valid?"callout neutral":"form-error"} role={validation.valid?"status":"alert"}><p>{validation.valid?`${validation.count} rows are valid.`:`${validation.errors.length} errors; no rows were imported.`}</p>{validation.errors.slice(0,8).map((item,index)=><p key={`${item.row}-${index}`}>Row {item.row}, {item.field}: {item.message}</p>)}</div>}<div className="modal-actions"><button className="btn outline" onClick={validate} disabled={!file||busy}>{busy?"Checking…":"Validate CSV"}</button><button className="btn" onClick={importFile} disabled={!validation?.valid||busy}>Import validated rows</button></div></div></div>}</>;
}

export function AttendancePage({ students, classes, refresh, calendar }: SharedPageProps & { calendar: ApiBootstrap["calendar"] }) {
  const classOptions=classes.length?classes:["CSE 2A"];
  const [className,setClassName]=useState(classOptions[0]);
  const [date,setDate]=useState(()=>{
    const working=new Set(calendar.workingWeekdays);
    const holidays=new Set(calendar.holidays);
    const current=new Date(`${calendar.endDate}T00:00:00Z`);
    while(current>=new Date(`${calendar.startDate}T00:00:00Z`)){
      const value=current.toISOString().slice(0,10);
      if(working.has(current.getUTCDay())&&!holidays.has(value))return value;
      current.setUTCDate(current.getUTCDate()-1);
    }
    return calendar.startDate;
  });
  const [records,setRecords]=useState<AttendanceRecord[]>([]);
  const [statuses,setStatuses]=useState<Record<number,string>>({});
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  useEffect(()=>{
    let active=true;
    setLoading(true);setError("");setSuccess("");
    void apiRequest<{records:AttendanceRecord[]}>(`/attendance?class=${encodeURIComponent(className)}&date=${date}`)
      .then(result=>{if(active){setRecords(result.records);setStatuses(Object.fromEntries(result.records.filter(record=>record.status).map(record=>[record.student_id,record.status as string])));}})
      .catch(reason=>{if(active)setError(reason instanceof Error?reason.message:"Attendance records could not be loaded.");})
      .finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[className,date]);
  const updateAll=(status:string)=>setStatuses(Object.fromEntries(records.map(record=>[record.student_id,status])));
  const save=async()=>{
    const missing=records.filter(record=>!statuses[record.student_id]);
    if(missing.length){setError(`Set a status for all students. ${missing.length} remain unmarked.`);return;}
    setSaving(true);setError("");setSuccess("");
    try{
      const result=await apiRequest<{saved:number}>("/attendance/bulk",{method:"POST",body:JSON.stringify({date,class_name:className,records:records.map(record=>({student_id:record.student_id,status:statuses[record.student_id]}))})});
      await refresh();setSuccess(`${result.saved} attendance records saved for ${className} on ${date}.`);
    }catch(reason){setError(reason instanceof Error?reason.message:"Attendance could not be saved.");}
    finally{setSaving(false);}
  };
  const presentCount=Object.values(statuses).filter(status=>status==="present").length;
  const absentCount=Object.values(statuses).filter(status=>status==="absent").length;
  const lateCount=Object.values(statuses).filter(status=>status==="late").length;
  return <><PageHead title="Take attendance" description="Record present, absent, and late statuses for one class and date." action={<div className="directory-actions"><CsvImportPanel title="attendance" columns="date, class, student_id, status" templateName="studentpulse-attendance-template.csv" template="date,class,student_id,status\r\n2025-05-15,CSE 2A,S003,present" validatePath="/imports/attendance/validate" importPath="/imports/attendance" onImported={async()=>{await refresh();const result=await apiRequest<{records:AttendanceRecord[]}>(`/attendance?class=${encodeURIComponent(className)}&date=${date}`);setRecords(result.records);setStatuses(Object.fromEntries(result.records.filter(record=>record.status).map(record=>[record.student_id,record.status as string])));setSuccess("Attendance CSV imported.");}}/><button className="btn secondary" onClick={()=>updateAll("present")}>Mark all present</button></div>}/>
    <section className="card workflow-filters"><SelectField label="Class" value={className} onChange={setClassName} options={classOptions}/><label className="field"><span>Session date</span><input type="date" value={date} onChange={event=>setDate(event.target.value)}/></label><div className="attendance-totals"><span><b>{presentCount}</b> present</span><span><b>{lateCount}</b> late</span><span><b>{absentCount}</b> absent</span></div></section>
    <Notice error={error} success={success}/>
    <section className="card"><div className="card-head"><div><h2>{className} roster</h2><p>{records.length} students · save once after reviewing all statuses</p></div><button className="btn" onClick={save} disabled={saving||loading||records.length===0}>{saving?"Saving…":"Save attendance"}</button></div>
      {loading?<div className="empty">Loading attendance records…</div>:<div className="table-wrap"><table><thead><tr><th>Student</th><th>Status</th><th>Record note</th></tr></thead><tbody>{records.map(record=><tr key={record.student_id}><td><div className="person"><span className="avatar">{record.name.split(/\s+/).map(part=>part[0]).join("").slice(0,2)}</span><div><strong>{record.name}</strong><small>{record.student_code}</small></div></div></td><td><select className="status-select" aria-label={`Attendance status for ${record.name}`} value={statuses[record.student_id]??""} onChange={event=>setStatuses(current=>({...current,[record.student_id]:event.target.value}))}><option value="">Choose status</option><option value="present">Present</option><option value="late">Late</option><option value="absent">Absent</option></select></td><td className="muted">{record.status?"Previously recorded · changes are audit logged":"Not recorded yet"}</td></tr>)}</tbody></table></div>}
    </section>
  </>;
}

export function AssignmentsPage({ students, classes, refresh }: SharedPageProps) {
  const classOptions=classes.length?classes:["CSE 2A"];
  const [className,setClassName]=useState(classOptions[0]);
  const [assignments,setAssignments]=useState<Assignment[]>([]);
  const [selected,setSelected]=useState<Assignment|null>(null);
  const [submissions,setSubmissions]=useState<Submission[]>([]);
  const [title,setTitle]=useState("");
  const [subject,setSubject]=useState("");
  const [dueDate,setDueDate]=useState("");
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  const [loading,setLoading]=useState(false);
  async function loadAssignments(){
    const result=await apiRequest<{assignments:Assignment[]}>(`/assignments?class=${encodeURIComponent(className)}`);
    setAssignments(result.assignments);
  }
  useEffect(()=>{void loadAssignments().catch(reason=>setError(reason instanceof Error?reason.message:"Assignments could not be loaded."));},[className]);
  async function openAssignment(assignment:Assignment){
    setSelected(assignment);setError("");
    try{const result=await apiRequest<{submissions:Submission[]}>(`/assignments/${assignment.id}`);setSubmissions(result.submissions);}
    catch(reason){setError(reason instanceof Error?reason.message:"Submissions could not be loaded.");}
  }
  async function create(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();setLoading(true);setError("");setSuccess("");
    try{
      await apiRequest("/assignments",{method:"POST",body:JSON.stringify({title,class_name:className,subject,due_date:dueDate})});
      setTitle("");setSubject("");setDueDate("");await loadAssignments();await refresh();setSuccess("Assignment created and assigned to active students in this class.");
    }catch(reason){setError(reason instanceof Error?reason.message:"Assignment could not be created.");}
    finally{setLoading(false);}
  }
  async function updateSubmission(submission:Submission,status:string){
    setError("");
    try{await apiRequest(`/assignments/${selected?.id}/students/${submission.student_id}`,{method:"PATCH",body:JSON.stringify({status})});await openAssignment(selected!);await refresh();}
    catch(reason){setError(reason instanceof Error?reason.message:"Submission status could not be updated.");}
  }
  return <><PageHead title="Assignments" description="Create class assignments and update only confirmed submission statuses."/>
    <section className="card"><div className="card-head"><div><h2>Create assignment</h2><p>Every active student in the class receives a pending record.</p></div></div><Notice error={error} success={success}/><form className="workflow-form" onSubmit={create}><label className="field"><span>Title</span><input required maxLength={160} value={title} onChange={event=>setTitle(event.target.value)}/></label><SelectField label="Class" value={className} onChange={value=>{setClassName(value);setSelected(null);}} options={classOptions}/><label className="field"><span>Subject</span><input required maxLength={80} value={subject} onChange={event=>setSubject(event.target.value)}/></label><label className="field"><span>Due date</span><input required type="date" value={dueDate} onChange={event=>setDueDate(event.target.value)}/></label><button className="btn" type="submit" disabled={loading}>{loading?"Creating…":"Create assignment"}</button></form></section>
    <section className="card"><div className="card-head"><div><h2>Class assignments</h2><p>Open an assignment to review submitted, pending, and overdue records.</p></div></div>{assignments.length?<div className="table-wrap"><table><thead><tr><th>Assignment</th><th>Subject</th><th>Due date</th><th>Submitted</th><th>Overdue</th><th/></tr></thead><tbody>{assignments.map(item=><tr key={item.id}><td><strong>{item.title}</strong></td><td>{item.subject}</td><td>{item.due_date}</td><td>{item.submitted_count} / {item.assigned_count}</td><td>{item.overdue_count}</td><td><button className="link" onClick={()=>void openAssignment(item)}>View records</button></td></tr>)}</tbody></table></div>:<div className="empty"><h3>No assignments for this class</h3><p>Create one above to start tracking submissions.</p></div>}</section>
    {selected&&<section className="card"><div className="card-head"><div><h2>{selected.title}</h2><p>{selected.class_name} · due {selected.due_date}</p></div></div><div className="table-wrap"><table><thead><tr><th>Student</th><th>Status</th></tr></thead><tbody>{submissions.map(submission=><tr key={submission.student_id}><td>{submission.name} <small>{submission.student_code}</small></td><td><select className="status-select" value={submission.status} aria-label={`Submission status for ${submission.name}`} onChange={event=>void updateSubmission(submission,event.target.value)}><option value="pending">Pending</option><option value="submitted">Submitted</option><option value="excused">Excused</option></select></td></tr>)}</tbody></table></div></section>}
    <span className="sr-only">{students.length} active students are loaded.</span>
  </>;
}

export function AssessmentsPage({ students, classes, refresh }: SharedPageProps) {
  const classOptions=classes.length?classes:["CSE 2A"];
  const [className,setClassName]=useState(classOptions[0]);
  const [assessments,setAssessments]=useState<Array<{id:number;title:string;class_name:string;subject:string;assessment_date:string;max_score:number}>>([]);
  const [title,setTitle]=useState("");const [subject,setSubject]=useState("");const [date,setDate]=useState("");const [maxScore,setMaxScore]=useState("100");
  const [scores,setScores]=useState<Record<number,string>>({});const [error,setError]=useState("");const [success,setSuccess]=useState("");const [saving,setSaving]=useState(false);
  const classStudents=students.filter(student=>student.class_name===className);
  async function load(){const result=await apiRequest<{assessments:Array<{id:number;title:string;class_name:string;subject:string;assessment_date:string;max_score:number}>}>("/assessments");setAssessments(result.assessments.filter(item=>item.class_name===className));}
  useEffect(()=>{void load().catch(reason=>setError(reason instanceof Error?reason.message:"Assessments could not be loaded."));},[className]);
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();setError("");setSuccess("");
    const maximum=Number(maxScore);
    const entered=Object.entries(scores).filter(([,value])=>value!=="").map(([id,value])=>({student_id:Number(id),score:Number(value)}));
    const invalid=entered.some(mark=>!Number.isFinite(mark.score)||mark.score<0||mark.score>maximum);
    if(!Number.isFinite(maximum)||maximum<=0||invalid){setError(`Enter marks from 0 to ${maximum||"the maximum score"}.`);return;}
    if(!entered.length){setError("Enter at least one student's mark before saving.");return;}
    setSaving(true);
    try{await apiRequest("/assessments",{method:"POST",body:JSON.stringify({title,class_name:className,subject,assessment_date:date,max_score:maximum,marks:entered})});setTitle("");setScores({});await load();await refresh();setSuccess(`${entered.length} marks saved. Blank marks remain unrecorded.`);}
    catch(reason){setError(reason instanceof Error?reason.message:"Assessment could not be saved.");}
    finally{setSaving(false);}
  }
  return <><PageHead title="Marks and assessments" description="Create assessments, validate marks against the maximum, and keep blanks unrecorded." action={<CsvImportPanel title="marks" columns="assessment_title, class, subject, assessment_date, max_score, student_id, score" templateName="studentpulse-marks-template.csv" template="assessment_title,class,subject,assessment_date,max_score,student_id,score\r\nMidterm,CSE 2A,Core Studies,2025-05-15,100,S003,82" validatePath="/imports/marks/validate" importPath="/imports/marks" onImported={async()=>{await refresh();await load();setSuccess("Marks CSV imported.");}}/>}/><section className="card"><h2>Enter assessment marks</h2><Notice error={error} success={success}/><form className="workflow-form" onSubmit={submit}><label className="field"><span>Assessment title</span><input required maxLength={160} value={title} onChange={event=>setTitle(event.target.value)}/></label><SelectField label="Class" value={className} onChange={value=>{setClassName(value);setScores({});}} options={classOptions}/><label className="field"><span>Subject</span><input required maxLength={80} value={subject} onChange={event=>setSubject(event.target.value)}/></label><label className="field"><span>Date</span><input required type="date" value={date} onChange={event=>setDate(event.target.value)}/></label><label className="field"><span>Maximum score</span><input required type="number" min="1" step="any" value={maxScore} onChange={event=>setMaxScore(event.target.value)}/></label><div className="table-wrap full-row"><table><thead><tr><th>Student</th><th>Mark</th><th>Maximum</th></tr></thead><tbody>{classStudents.map(student=><tr key={student.id}><td>{student.name}<small>{student.student_code}</small></td><td><input aria-label={`Mark for ${student.name}`} type="number" step="any" value={scores[student.id]??""} onChange={event=>setScores(current=>({...current,[student.id]:event.target.value}))}/></td><td>{maxScore}</td></tr>)}</tbody></table></div><button className="btn" type="submit" disabled={saving}>{saving?"Saving marks…":"Save marks"}</button></form></section>
    <section className="card"><div className="card-head"><div><h2>Assessment history</h2><p>Only saved marks contribute to the displayed averages.</p></div></div>{assessments.length?<div className="table-wrap"><table><thead><tr><th>Assessment</th><th>Subject</th><th>Date</th><th>Maximum</th></tr></thead><tbody>{assessments.map(item=><tr key={item.id}><td>{item.title}</td><td>{item.subject}</td><td>{item.assessment_date}</td><td>{item.max_score}</td></tr>)}</tbody></table></div>:<div className="empty"><h3>No assessments recorded for {className}</h3></div>}</section>
  </>;
}

export function FollowupsPage({ students, refresh, followups: initialFollowups }: SharedPageProps & { followups:ApiBootstrap["followups"] }) {
  const [followups,setFollowups]=useState<Followup[]>(initialFollowups as Followup[]);
  const [studentId,setStudentId]=useState(String(students[0]?.id??""));const [title,setTitle]=useState("");const [dueDate,setDueDate]=useState("");const [notes,setNotes]=useState("");const [error,setError]=useState("");const [success,setSuccess]=useState("");
  useEffect(()=>setFollowups(initialFollowups as Followup[]),[initialFollowups]);
  async function reload(){const result=await apiRequest<{followups:Followup[]}>("/followups");setFollowups(result.followups);}
  async function create(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setError("");setSuccess("");try{await apiRequest("/followups",{method:"POST",body:JSON.stringify({student_id:Number(studentId),title,due_date:dueDate,notes})});setTitle("");setNotes("");await reload();await refresh();setSuccess("Follow-up task created.");}catch(reason){setError(reason instanceof Error?reason.message:"Task could not be created.");}}
  async function complete(id:number){setError("");try{await apiRequest(`/followups/${id}`,{method:"PATCH",body:JSON.stringify({status:"completed"})});await reload();await refresh();}catch(reason){setError(reason instanceof Error?reason.message:"Task could not be updated.");}}
  return <><PageHead title="Follow-ups" description="Assign and track student support actions with due dates and notes."/><section className="card"><h2>Create follow-up task</h2><Notice error={error} success={success}/><form className="workflow-form" onSubmit={create}><label className="field"><span>Student</span><select value={studentId} onChange={event=>setStudentId(event.target.value)}>{students.map(student=><option key={student.id} value={student.id}>{student.name} ({student.student_code})</option>)}</select></label><label className="field"><span>Task</span><input required maxLength={160} value={title} onChange={event=>setTitle(event.target.value)}/></label><label className="field"><span>Due date</span><input required type="date" value={dueDate} onChange={event=>setDueDate(event.target.value)}/></label><label className="field"><span>Notes</span><textarea maxLength={2000} value={notes} onChange={event=>setNotes(event.target.value)}/></label><button className="btn" type="submit">Create task</button></form></section><section className="card"><h2>Task list</h2>{followups.length?<div className="table-wrap"><table><thead><tr><th>Student</th><th>Task</th><th>Due</th><th>Status</th><th/></tr></thead><tbody>{followups.map(item=><tr key={item.id}><td>{item.student_name}<small>{item.student_code}</small></td><td>{item.title}<small>{item.notes}</small></td><td>{item.due_date}</td><td>{item.status}</td><td>{item.status==="open"&&<button className="link" onClick={()=>void complete(item.id)}>Mark complete</button>}</td></tr>)}</tbody></table></div>:<div className="empty"><h3>No follow-ups yet</h3><p>Create a task above to track the next support action.</p></div>}</section></>;
}

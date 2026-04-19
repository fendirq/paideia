# Teacher LMS Feature Gap Report

## Executive Summary

For a solo K-12 or community-college teacher, the market baseline is not "AI tutoring plus files." The load-bearing loop is: create a class, get students in, post work with due dates, collect submissions, grade/return feedback, and see who is missing or struggling. Canvas, Google Classroom, and Schoology all support that full loop. Khan Academy supports assigning content and progress reporting well, but it behaves more like a supplemental practice platform than a full submission-and-grading LMS.

Paideia currently covers only the front half of that loop. Teachers can create classes, share a join code, upload "materials" with a due date, view enrolled students, and see session/message analytics. The repo does **not** currently model or expose assignment submissions, grades, rubrics, returned feedback, announcements, or teacher-managed student differentiation. The clearest evidence is the schema: teacher-side class data stops at `Class`, `ClassEnrollment`, `ClassMaterial`, and `ClassMaterialFile`, with no submission/grade tables (`prisma/schema.prisma:201-257`). The class page is likewise limited to materials plus a student table (`src/app/app/teacher/class/[id]/page.tsx:162-210`), and analytics track tutoring-session activity rather than assignment completion (`src/app/app/teacher/analytics/page.tsx:19-133`).

## Market Baseline

| Area | What the market baseline looks like |
| --- | --- |
| Assignment workflow | Canvas supports differentiated assignees, rubrics, and SpeedGrader-based grading/feedback. Google Classroom supports assign-to-selected-students, due dates, rubrics, grading/return, and inline/private comments. Schoology supports assignments with submissions enabled, rubrics, annotations, comments, and explicit return to student. Khan Academy supports assigning content to classes/students with start and due dates, but not a typical teacher-graded file-submission loop. |
| Class management | Canvas, Google Classroom, and Schoology all support class creation plus invitation/enrollment workflows. Google Classroom offers invite link, email invite, and class code. Schoology offers course access codes plus member management. Khan Academy supports class setup, adding/removing students, and class codes. Differentiation by student or group is first-class in Canvas, Classroom, Schoology, and Khan Academy assignments. |
| Communication | Canvas has course announcements. Google Classroom has announcements, emails, and private comments on work. Schoology has course updates/announcements plus assignment comments. Khan Academy docs emphasize Assign, Students, Activity, Course Mastery, and Settings; I did not find an equivalent teacher announcement or private-note workflow in the official docs, so communication appears much thinner there. This is an inference from the documented class tabs. |
| Analytics | Canvas surfaces missing/late/excused assignment reports and student/course analytics. Google Classroom gradebook exposes missing, turned-in, and returned states. Schoology analytics show last access, material access, total time spent, submission status, and total submissions. Khan Academy reports are strong for mastery/progress and response/completion by student or assignment. |
| Content | Canvas has a syllabus page plus files. Google Classroom supports materials/topics and class details, but a lighter content model. Schoology supports pages, files/links, folders, and rich course materials. Khan Academy supports course content assignment and settings, but not a rich teacher-authored syllabus/resource hub like Canvas or Schoology. |

## Benchmark Notes

- Canvas: differentiated assignment targeting, rubrics for grading in SpeedGrader, add-users/invite flows, self-enrollment by join code/URL, course announcements, analytics reports, and syllabus content are all documented in the Instructor Guide. Sources: [assign to students/sections](https://community.instructure.com/en/kb/articles/660688-unknown), [rubrics](https://community.instructure.com/en/kb/articles/661102-how-do-i-add-a-rubric-to-an-assignment), [analytics](https://community.instructure.com/en/kb/articles/660625-unknown), [add users](https://community.instructure.com/en/kb/articles/660963-how-do-i-add-users-to-a-course), [self-enrollment](https://community.instructure.com/en/kb/articles/661134-unknown), [announcements](https://community.canvaslms.com/t5/Instructor-Guide/How-do-I-add-an-announcement-in-a-course/ta-p/1194), [syllabus](https://community.instructure.com/en/kb/articles/660745-how-do-i-use-the-syllabus-as-an-instructor).
- Google Classroom: assignment creation includes selected students, due dates, attachments, rubrics, and originality reports; teachers can grade/return work, leave private comments, email students/guardians, post announcements, and use a status-rich gradebook. Sources: [create assignment](https://support.google.com/edu/classroom/answer/6020265?co=GENIE.Platform%3DDesktop&hl=en), [rubrics](https://support.google.com/edu/classroom/answer/9335069?co=GENIE.Platform%3DDesktop&hl=en), [grade/return](https://support.google.com/edu/classroom/answer/6020294?co=GENIE.Platform%3DDesktop&hl=en), [feedback](https://support.google.com/edu/classroom/answer/9093530?hl=en), [gradebook](https://support.google.com/edu/classroom/answer/9199710?hl=en), [invite students](https://support.google.com/edu/classroom/answer/6020282?co=GENIE.Platform%3DDesktop&hl=en), [announcements](https://support.google.com/edu/classroom/answer/6020270?co=GENIE.Platform%3DDesktop&hl=en-EN), [email](https://support.google.com/edu/classroom/answer/6025210?co=GENIE.Platform%3DDesktop&hl=en).
- Schoology: assignments support due dates, submissions, comments, grading, and returning; rubrics apply to assignments/discussions; teachers can individually assign content to students or grading groups; course updates act as announcements; analytics show access/submission/time data; pages/files provide a strong content layer. Sources: [assignments](https://uc.powerschool-docs.com/en/schoology/latest/course-materials-assignments-instructors), [rubrics](https://uc.powerschool-docs.com/en/schoology/latest/use-rubrics), [gradebook](https://uc.powerschool-docs.com/en/schoology/latest/courses-gradebook), [individual assignment](https://uc.powerschool-docs.com/en/schoology/latest/individually-assign-course-materials), [analytics](https://uc.powerschool-docs.com/en/schoology/latest/course-analytics), [updates](https://uc.powerschool-docs.com/en/schoology/latest/course-updates-instructors), [members](https://uc.powerschool-docs.com/en/schoology/latest/add-course-members), [pages](https://uc.powerschool-docs.com/en/schoology/latest/course-materials-pages-instructors), [files/links](https://uc.powerschool-docs.com/en/schoology/latest/course-materials-files-links-instructors), [grading groups](https://uc.powerschool-docs.com/en/schoology/latest/grading-groups).
- Khan Academy: teachers can assign content to classes or individual students with start/due dates, manage rosters, and track mastery/progress and completion reports. It is much weaker as a general LMS for teacher-authored submission/grading workflows. Sources: [assignments](https://support.khanacademy.org/hc/en-us/articles/115000772311-How-do-I-make-assignments-for-my-students-on-Khan-Academy), [classes page](https://support.khanacademy.org/hc/en-us/articles/360031099511-What-can-I-do-from-the-classes-page), [student roster](https://support.khanacademy.org/hc/en-us/articles/360031102971-How-do-I-manage-my-student-roster), [reporting options](https://support.khanacademy.org/hc/en-us/articles/360031129891-What-reporting-options-are-available-on-Khan-Academy-for-teachers-to-track-student-performance), [responses/completion](https://support.khanacademy.org/hc/en-us/articles/115000780012-How-do-I-use-the-Responses-and-Completion-Reports).

## Paideia Today

- `TeacherDashboard` lists classes plus counts for students/sessions, and can create a class (`src/app/app/teacher/page.tsx:17-103`).
- Class creation captures name, subject, period, description, and generates a join code (`src/components/teacher/create-class-form.tsx`, `src/app/api/teacher/classes/route.ts`).
- The class detail page shows a copyable join code, class-level stats, a "Materials" area, and a student table (`src/app/app/teacher/class/[id]/page.tsx:121-210`).
- `AddMaterialForm` supports only title, description, optional due date, and file uploads (`src/components/teacher/add-material-form.tsx:97-232`).
- Materials API persists only title/description/due date/files, then counts related tutoring sessions (`src/app/api/teacher/classes/[id]/materials/route.ts:61-135`).
- Student rows show only identity plus tutoring-session activity: grade, sessions, time, messages, last active (`src/components/teacher/student-table.tsx:49-79`; `src/app/api/teacher/classes/[id]/students/route.ts:28-73`).
- Teacher analytics are usage analytics, not coursework analytics: sessions this week, total minutes/messages, subject distribution, and sessions by class (`src/app/app/teacher/analytics/page.tsx:41-133`).

## Gaps vs Baseline

### [MUST]

- **Submission inbox and per-student assignment state are missing.** Teachers cannot accept work, see who turned something in, or distinguish assigned vs turned in vs late vs returned. Current `ClassMaterial` is just a content object with optional due date.
  - Minimum viable Paideia: add `AssignmentSubmission` records keyed by `materialId + studentId`, with `status`, `submittedAt`, optional text response, optional file attachments, and a simple teacher review screen filtered by `Needs grading`, `Late`, and `Missing`.

- **Grading and return-to-student workflow is missing.** There is no grade field, no returned state, no teacher comment tied to a submission, and no gradebook view.
  - Minimum viable Paideia: add one numeric score or pass/fail field, one teacher feedback field, and a `Return` action. Show returned grade/feedback on the student side and surface an ungraded queue on the teacher side.

- **Teacher analytics cannot identify struggling students in coursework terms.** Current analytics show tutoring engagement, not missing work, low scores, late submissions, or students needing follow-up.
  - Minimum viable Paideia: once submissions exist, add a teacher dashboard panel for `missing`, `late`, `ungraded`, `average score`, and `last submission date`, plus a "students needing attention" list.

### [SHOULD]

- **Differentiate assignments/resources by student or group.** Canvas, Classroom, Schoology, and Khan Academy all support assigning to selected students or groups. Paideia materials go to the class as a whole.
- **Rubrics.** Market baseline supports at least lightweight rubrics; Paideia has no rubric model or UI.
- **Class announcements.** Teachers cannot push a class-wide reminder/update inside Paideia, despite this being standard in Canvas, Classroom, and Schoology.
- **Per-student teacher notes outside grading.** The repo has no teacher-facing place for private notes like "needs accommodation" or "parent contacted."
- **Roster actions.** Teachers can list students but cannot remove a student, approve joins, or use richer invite options like email or invite link from the teacher UI.
- **Real content architecture.** Paideia has one "materials" bucket, but baseline products distinguish assignments from resources/pages/materials. Teachers need "this is graded work" vs "this is reference material."
- **Persistent class overview / syllabus.** There is no editable syllabus, weekly overview, or class resource homepage. Canvas and Schoology treat this as standard.
- **Assignment lifecycle controls.** No draft/schedule/publish/unpublish, no availability window, no "close submissions after due date."

### [NICE]

- **Comment bank / reusable feedback snippets.**
- **Bulk actions.** Return all graded submissions, mark complete, or message selected students.
- **Guardian-facing summaries or teacher email helpers.**
- **Student groups / sections for cleaner differentiation.**
- **Richer analytics.** Time-on-task by assignment, submission heatmaps, mastery trends, and comparison across classes.
- **Assessment extras.** Originality checks, annotation tools, resubmission history, and downloadable exports.

## Bottom Line

Paideia is not yet at LMS baseline for a solo teacher to fully run a class. It is currently closest to a class-linked tutoring/content hub. The shortest path to "teachers can actually run coursework here" is:

1. Turn `materials` into true assignments with per-student submissions.
2. Add grading + return with visible student statuses.
3. Add basic coursework analytics and an intervention queue.

After that, the next highest-leverage layer is differentiation, announcements, and a clearer split between assignments and resources.

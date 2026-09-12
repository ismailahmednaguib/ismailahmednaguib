// app/student/page.tsx : بوابة الطالب — دوراتي والتقدم
import { redirect } from "next/navigation";
import { currentUser } from "../../lib/auth";
import { db } from "../../lib/db";
import { getStudentEnrollments } from "../../lib/enrollment";
import { getSiteSettings } from "../../lib/site-settings";
import StudentDashboard from "./StudentDashboard";

export const dynamic = "force-dynamic";

export default async function StudentPortal() {
  const u = await currentUser();
  if (!u) redirect("/login");
  if (u.role === "admin") redirect("/dashboard");
  
  const s = await getSiteSettings().catch(() => null);
  const enrollments = await getStudentEnrollments(u.email);
  const courses = await db.courses();
  const lessons = await db.lessons();
  
  const myCourses = enrollments.map(e => {
    const course = courses.find(c => c.slug === e.courseSlug);
    const courseLessons = lessons.filter(l => l.courseSlug === e.courseSlug);
    return { enrollment: e, course, lessons: courseLessons };
  }).filter(x => x.course);
  
  return <StudentDashboard user={u} myCourses={myCourses} settings={s} />;
}
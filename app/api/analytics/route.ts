// app/api/analytics/route.ts : بيانات التحليلات للوحة التحكم
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { currentUser } from "../../../lib/auth";
import { getEnrollments } from "../../../lib/enrollment";

export const dynamic = "force-dynamic";

export async function GET() {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const [
    courses, books, lessons, scholars, news, fatwas, certificates, admissions, users, enrollments
  ] = await Promise.all([
    db.courses(), db.books(), db.lessons(), db.scholars(), db.news(), 
    db.fatwas(), db.certs(), db.admissions(), db.users(), getEnrollments()
  ]);

  // الدورات حسب المسار
  const coursesByTrack: Record<string, number> = {};
  for (const c of courses) coursesByTrack[c.track] = (coursesByTrack[c.track] || 0) + 1;

  // الشهادات حسب الشهر
  const certificatesByMonth: Record<string, number> = {};
  for (const c of certificates) {
    const month = c.date?.slice(0, 7) || "غير معروف";
    certificatesByMonth[month] = (certificatesByMonth[month] || 0) + 1;
  }

  // التسجيلات لكل دورة
  const enrollmentsByCourseMap: Record<string, { count: number; completed: number }> = {};
  for (const e of enrollments) {
    if (!enrollmentsByCourseMap[e.courseSlug]) {
      enrollmentsByCourseMap[e.courseSlug] = { count: 0, completed: 0 };
    }
    enrollmentsByCourseMap[e.courseSlug].count++;
    if (e.progress === 100) enrollmentsByCourseMap[e.courseSlug].completed++;
  }
  const enrollmentsByCourse = Object.entries(enrollmentsByCourseMap)
    .map(([course, data]) => ({ course, ...data }))
    .sort((a, b) => b.count - a.count);

  // حالات التقديمات
  const pendingAdmissions = admissions.filter(a => a.status === "new").length;
  const acceptedAdmissions = admissions.filter(a => a.status === "accepted").length;
  const rejectedAdmissions = admissions.filter(a => a.status === "rejected").length;

  const totalEnrollments = enrollments.length;
  const completedEnrollments = enrollments.filter(e => e.progress === 100).length;

  return NextResponse.json({
    ok: true,
    data: {
      totalCourses: courses.length,
      totalBooks: books.length,
      totalLessons: lessons.length,
      totalScholars: scholars.length,
      totalNews: news.length,
      totalFatwas: fatwas.length,
      totalCertificates: certificates.length,
      totalAdmissions: admissions.length,
      totalUsers: users.length,
      totalEnrollments,
      completedEnrollments,
      pendingAdmissions,
      acceptedAdmissions,
      rejectedAdmissions,
      coursesByTrack,
      certificatesByMonth,
      enrollmentsByCourse,
      recentActivity: 0, // يمكن ربطه بسجل النشاطات
    }
  });
}
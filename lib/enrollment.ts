// lib/enrollment.ts : إدارة تسجيل الطلاب في الدورات — ملف مستقل
import { db } from "./db";
import { randomUUID } from "crypto";

export interface Enrollment {
  id: string;
  studentEmail: string;
  courseSlug: string;
  enrolledAt: string;
  progress: number; // 0-100
  completedLessons: string[]; // lesson IDs
  lastAccessedAt?: string;
  certificateIssued?: boolean;
  certificateCode?: string;
}

const ENROLLMENT_KEY = "enrollments";

export async function getEnrollments(): Promise<Enrollment[]> {
  return db.read<Enrollment[]>(`${ENROLLMENT_KEY}.json`, []);
}

export async function getStudentEnrollments(studentEmail: string): Promise<Enrollment[]> {
  const all = await getEnrollments();
  return all.filter(e => e.studentEmail === studentEmail);
}

export async function getCourseEnrollments(courseSlug: string): Promise<Enrollment[]> {
  const all = await getEnrollments();
  return all.filter(e => e.courseSlug === courseSlug);
}

export async function enrollStudent(studentEmail: string, courseSlug: string): Promise<Enrollment | null> {
  const all = await getEnrollments();
  const existing = all.find(e => e.studentEmail === studentEmail && e.courseSlug === courseSlug);
  if (existing) return existing;
  
  const enrollment: Enrollment = {
    id: randomUUID().slice(0, 8),
    studentEmail,
    courseSlug,
    enrolledAt: new Date().toISOString(),
    progress: 0,
    completedLessons: [],
  };
  all.push(enrollment);
  await db.write(`${ENROLLMENT_KEY}.json`, all);
  return enrollment;
}

export async function updateProgress(enrollmentId: string, progress: number, completedLessonId?: string): Promise<boolean> {
  const all = await getEnrollments();
  const i = all.findIndex(e => e.id === enrollmentId);
  if (i < 0) return false;
  
  all[i].progress = Math.min(100, Math.max(0, progress));
  all[i].lastAccessedAt = new Date().toISOString();
  if (completedLessonId && !all[i].completedLessons.includes(completedLessonId)) {
    all[i].completedLessons.push(completedLessonId);
  }
  await db.write(`${ENROLLMENT_KEY}.json`, all);
  return true;
}

export async function markLessonComplete(enrollmentId: string, lessonId: string): Promise<boolean> {
  const all = await getEnrollments();
  const i = all.findIndex(e => e.id === enrollmentId);
  if (i < 0) return false;
  
  if (!all[i].completedLessons.includes(lessonId)) {
    all[i].completedLessons.push(lessonId);
  }
  // تحديث التقدم بناءً على عدد الدروس المكتملة
  const lessons = await db.lessons();
  const courseLessons = lessons.filter(l => l.courseSlug === all[i].courseSlug);
  if (courseLessons.length > 0) {
    all[i].progress = Math.round((all[i].completedLessons.length / courseLessons.length) * 100);
  }
  all[i].lastAccessedAt = new Date().toISOString();
  await db.write(`${ENROLLMENT_KEY}.json`, all);
  return true;
}

export async function issueCertificate(enrollmentId: string, certificateCode: string): Promise<boolean> {
  const all = await getEnrollments();
  const i = all.findIndex(e => e.id === enrollmentId);
  if (i < 0) return false;
  all[i].certificateIssued = true;
  all[i].certificateCode = certificateCode;
  all[i].progress = 100;
  await db.write(`${ENROLLMENT_KEY}.json`, all);
  return true;
}

export async function unenrollStudent(studentEmail: string, courseSlug: string): Promise<boolean> {
  const all = await getEnrollments();
  const kept = all.filter(e => !(e.studentEmail === studentEmail && e.courseSlug === courseSlug));
  if (kept.length === all.length) return false;
  await db.write(`${ENROLLMENT_KEY}.json`, kept);
  return true;
}
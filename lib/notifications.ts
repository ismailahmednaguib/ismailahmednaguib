// lib/notifications.ts : دوال مساعدة لإنشاء الإشعارات
import { getSupabase } from "./supabase";

export interface NotificationInput {
  userId: string;
  type: "info" | "success" | "warning" | "error" | "new_lesson" | "new_certificate" | "enrollment" | "announcement" | "grade_released";
  title: string;
  message?: string;
  link?: string;
}

export async function createNotification(input: NotificationInput): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  
  const { error } = await sb.from("ian_notifications").insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    message: input.message || "",
    link: input.link || null,
  });
  
  return !error;
}

export async function createNotificationsForUsers(userIds: string[], input: Omit<NotificationInput, "userId">): Promise<number> {
  const sb = getSupabase();
  if (!sb || !userIds.length) return 0;
  
  const rows = userIds.map((userId) => ({
    user_id: userId,
    type: input.type,
    title: input.title,
    message: input.message || "",
    link: input.link || null,
  }));
  
  const { error, count } = await sb.from("ian_notifications").insert(rows);
  return error ? 0 : (count || userIds.length);
}

// دوال مساعدة للأحداث الشائعة
export async function notifyNewLesson(userId: string, courseTitle: string, lessonTitle: string, lessonUrl: string) {
  return createNotification({
    userId,
    type: "new_lesson",
    title: "درس جديد متاح",
    message: `تم إضافة درس جديد "${lessonTitle}" في كورس "${courseTitle}"`,
    link: lessonUrl,
  });
}

export async function notifyNewCertificate(userId: string, courseTitle: string, certificateUrl: string) {
  return createNotification({
    userId,
    type: "new_certificate",
    title: "شهادة جديدة",
    message: `تهانينا! حصلت على شهادة إتمام كورس "${courseTitle}"`,
    link: certificateUrl,
  });
}

export async function notifyEnrollmentConfirmed(userId: string, courseTitle: string, courseUrl: string) {
  return createNotification({
    userId,
    type: "enrollment",
    title: "تم تأكيد التسجيل",
    message: `تم تسجيلك بنجاح في كورس "${courseTitle}"`,
    link: courseUrl,
  });
}

export async function notifyAnnouncement(userId: string, title: string, message: string, link?: string) {
  return createNotification({
    userId,
    type: "announcement",
    title,
    message,
    link,
  });
}

export async function notifyGradeReleased(userId: string, courseTitle: string, gradeUrl: string) {
  return createNotification({
    userId,
    type: "grade_released",
    title: "تم نشر الدرجات",
    message: `تم نشر درجاتك في كورس "${courseTitle}"`,
    link: gradeUrl,
  });
}

// إرسال إشعار لجميع المستخدمين (للإعلانات العامة)
export async function notifyAllUsers(input: Omit<NotificationInput, "userId">): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;
  
  const { data: users } = await sb.from("ian_users").select("id");
  if (!users || !users.length) return 0;
  
  const userIds = users.map((u) => u.id);
  return createNotificationsForUsers(userIds, input);
}

// إرسال إشعار لجميع طلاب كورس معين
export async function notifyCourseStudents(courseSlug: string, input: Omit<NotificationInput, "userId">): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;
  
  const { data: enrollments } = await sb
    .from("ian_enrollments")
    .select("user_id")
    .eq("course_slug", courseSlug);
  
  if (!enrollments || !enrollments.length) return 0;
  
  const userIds = enrollments.map((e) => e.user_id);
  return createNotificationsForUsers(userIds, input);
}
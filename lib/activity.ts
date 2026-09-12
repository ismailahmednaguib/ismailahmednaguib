// lib/activity.ts : سجل النشاطات للإدمن — ملف مستقل
import { db } from "./db";
import { cleanText } from "./security";

export type ActivityType = "login" | "add" | "edit" | "delete" | "export" | "import" | "backup" | "role" | "password" | "email";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  table: string;
  itemId: string;
  itemTitle: string;
  userEmail: string;
  userRole: string;
  details?: string;
  ip?: string;
  createdAt: string;
}

const ACTIVITY_KEY = "activity";

export async function logActivity(entry: Omit<ActivityEntry, "id" | "createdAt">): Promise<void> {
  try {
    const activities = await getActivities();
    const newEntry: ActivityEntry = {
      ...entry,
      id: crypto.randomUUID().slice(0, 8),
      createdAt: new Date().toISOString(),
    };
    activities.unshift(newEntry);
    // احتفظ بآخر 500 نشاط فقط
    if (activities.length > 500) activities.splice(500);
    await db.write("activity.json", activities);
  } catch {
    // لا نكسر العملية الرئيسية لو فشل التسجيل
  }
}

export async function getActivities(limit = 100): Promise<ActivityEntry[]> {
  try {
    const activities = await db.read<ActivityEntry[]>(`${ACTIVITY_KEY}.json`, []);
    return activities.slice(0, limit);
  } catch {
    return [];
  }
}

export async function clearActivities(): Promise<void> {
  await db.write(`${ACTIVITY_KEY}.json`, []);
}

// دوال مساعدة لتسجيل الأنشطة الشائعة
export function logAdd(table: string, itemId: string, itemTitle: string, userEmail: string, userRole: string, ip?: string) {
  return logActivity({ type: "add", table, itemId, itemTitle, userEmail, userRole, ip });
}

export function logEdit(table: string, itemId: string, itemTitle: string, userEmail: string, userRole: string, details?: string, ip?: string) {
  return logActivity({ type: "edit", table, itemId, itemTitle, userEmail, userRole, details, ip });
}

export function logDelete(table: string, itemId: string, itemTitle: string, userEmail: string, userRole: string, ip?: string) {
  return logActivity({ type: "delete", table, itemId, itemTitle, userEmail, userRole, ip });
}

export function logLogin(userEmail: string, userRole: string, ip?: string) {
  return logActivity({ type: "login", table: "users", itemId: userEmail, itemTitle: "تسجيل دخول", userEmail, userRole, ip });
}

export function logExport(userEmail: string, userRole: string, ip?: string) {
  return logActivity({ type: "export", table: "backup", itemId: "all", itemTitle: "تصدير نسخة احتياطية", userEmail, userRole, ip });
}

export function logImport(userEmail: string, userRole: string, ip?: string) {
  return logActivity({ type: "import", table: "backup", itemId: "all", itemTitle: "استيراد نسخة احتياطية", userEmail, userRole, ip });
}

export function logBackup(userEmail: string, userRole: string, ip?: string) {
  return logActivity({ type: "backup", table: "backup", itemId: "auto", itemTitle: "نسخ احتياطي تلقائي", userEmail, userRole, ip });
}

export function logRoleChange(targetEmail: string, newRole: string, userEmail: string, userRole: string, ip?: string) {
  return logActivity({ type: "role", table: "users", itemId: targetEmail, itemTitle: `تغيير الدور إلى ${newRole}`, userEmail, userRole, ip });
}

export function logPasswordChange(userEmail: string, userRole: string, ip?: string) {
  return logActivity({ type: "password", table: "users", itemId: userEmail, itemTitle: "تغيير كلمة المرور", userEmail, userRole, ip });
}

export function logEmailChange(oldEmail: string, newEmail: string, userEmail: string, userRole: string, ip?: string) {
  return logActivity({ type: "email", table: "users", itemId: newEmail, itemTitle: `تغيير البريد من ${oldEmail} إلى ${newEmail}`, userEmail, userRole, ip });
}
// scripts/set-admin.mjs : إضافة/تغيير أدمن مباشرة في Supabase (ian_store key=users)
// الاستخدام:
//   $env:SUPABASE_URL='https://xxxx.supabase.co'
//   $env:SUPABASE_SERVICE_ROLE_KEY='service_role_....'
//   node scripts/set-admin.mjs "you@mail.com" "NewPassword12345"
// ملاحظة: الباسورد 10 حروف على الأقل، والهاش bcrypt يتعمل تلقائيا.
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = String(process.argv[2] || "").trim().toLowerCase();
const password = String(process.argv[3] || "");

if (!url || !key) {
  console.error("ناقص: ضع SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في البيئة أولا");
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
  console.error("اكتب إيميل صحيح: node scripts/set-admin.mjs \"you@mail.com\" \"NewPassword12345\"");
  process.exit(1);
}
if (password.length < 10) {
  console.error("الباسورد قصير — لازم 10 حروف على الأقل");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

// هات اليوزرات الحالية
const { data, error } = await sb.from("ian_store").select("value").eq("key", "users").maybeSingle();
if (error) {
  console.error("خطأ قراءة users:", error.message);
  console.error("تأكد أنك نفذت supabase/schema.sql (جدول ian_store موجود)");
  process.exit(1);
}
let users = Array.isArray(data?.value) ? data.value : [];

// شيل أي أدمن بنفس الإيميل + شيل الأدمن الافتراضي القديم لو بتغيره
users = users.filter((u) => u.email !== email && u.email !== "admin@ian.local");
const hash = await bcrypt.hash(password, 12);
users.push({ email, hash, role: "admin" });

const { error: upErr } = await sb
  .from("ian_store")
  .upsert({ key: "users", value: users, updated_at: new Date().toISOString() }, { onConflict: "key" });
if (upErr) {
  console.error("فشل الحفظ:", upErr.message);
  process.exit(1);
}
console.log("تم ✓ — تقدر تدخل دلوقتي بـ:", email);

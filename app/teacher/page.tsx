// app/teacher/page.tsx : لوحة تحكم المعلم
import { currentUser } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import TeacherDashboard from "../components/TeacherDashboard";

export const dynamic = "force-dynamic";

export default async function TeacherPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.role === "admin") redirect(`/${locale}/dashboard`);
  
  return <TeacherDashboard locale={locale} userEmail={user.email} />;
}
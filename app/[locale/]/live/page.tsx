// app/[locale]/live/page.tsx : صفحة الجلسات المباشرة
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import LiveSessionsPage from "@/app/components/LiveSessionsPage";

export const dynamic = "force-dynamic";

export default async function LivePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);
  
  return <LiveSessionsPage locale={locale} userEmail={user.email} userRole={user.role} />;
}
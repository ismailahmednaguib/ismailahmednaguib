// app/[locale]/forums/[id]/page.tsx : صفحة المنتدى
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ForumPage from "@/app/components/ForumPage";

export const dynamic = "force-dynamic";

export default async function ForumPageRoute({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);
  
  return <ForumPage locale={locale} forumId={id} userEmail={user.email} userRole={user.role} />;
}
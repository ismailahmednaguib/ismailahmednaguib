// app/[locale]/forums/[id]/topics/[topicId]/page.tsx : صفحة موضوع المنتدى
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ForumTopicPage from "@/app/components/ForumTopicPage";

export const dynamic = "force-dynamic";

export default async function ForumTopicPageRoute({ params }: { params: Promise<{ locale: string; id: string; topicId: string }> }) {
  const { locale, id, topicId } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);
  return <ForumTopicPage locale={locale} forumId={id} topicId={topicId} userEmail={user.email} userRole={user.role} />;
}

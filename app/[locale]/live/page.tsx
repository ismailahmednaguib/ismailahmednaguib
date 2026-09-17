import { getTranslations } from "next-intl/server";
import LiveSessionsPage from "@/components/LiveSessionsPage";

export const metadata = {
  title: "Live Sessions",
  description: "Browse and join live sessions",
};

export default async function LivePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "live" });
  
  // This page is a server component, we'll pass user info via client component
  return (
    <div className="live-page">
      <LiveSessionsPage locale={locale} userEmail="" userRole="student" />
    </div>
  );
}
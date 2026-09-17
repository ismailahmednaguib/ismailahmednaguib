import { getTranslations } from "next-intl/server";
import LiveSessionPlayer from "@/components/LiveSessionPlayer";

export const metadata = {
  title: "Live Session",
  description: "Join a live session",
};

export default async function LiveSessionPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "liveSession" });
  
  return (
    <div className="live-session-page">
      <h1 className="page-title">{t("liveSessions")}</h1>
      <LiveSessionPlayer />
    </div>
  );
}
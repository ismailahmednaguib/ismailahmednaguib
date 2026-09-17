// components/PWAInstall.tsx : مكون دعوة تثبيت PWA
"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function PWAInstall() {
  const t = useTranslations("pwa");
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // إظهار الدعوة بعد 30 ثانية من التحميل
      setTimeout(() => setShowPrompt(true), 30000);
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("PWA installed");
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // عدم إظهارها مرة أخرى في هذه الجلسة
    sessionStorage.setItem("pwa-dismissed", "true");
  };

  // عدم الإظهار إذا تم تجاهلها مسبقاً
  if (sessionStorage.getItem("pwa-dismissed") || showPrompt === false) {
    return null;
  }

  return (
    <div className="pwa-install-banner" role="dialog" aria-label={t("installTitle")}>
      <div className="pwa-install-content">
        <div className="pwa-icon">📱</div>
        <div className="pwa-text">
          <h4>{t("installTitle")}</h4>
          <p>{t("installDescription")}</p>
        </div>
      </div>
      <div className="pwa-actions">
        <button className="btn ghost" onClick={handleDismiss}>{t("notNow")}</button>
        <button className="btn gold" onClick={handleInstall} disabled={!deferredPrompt}>
          {t("install")}
        </button>
      </div>
    </div>
  );
}

// TypeScript declaration for beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
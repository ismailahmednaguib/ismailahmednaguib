// app/ThemeToggle.tsx : زر تبديل الثيم
"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    // تحديث الإعدادات في السيرفر
    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeMode: newTheme }),
    }).catch(console.error);
  };

  if (!mounted) return <button className={`theme-toggle ${className}`} disabled>⏳</button>;

  return (
    <button className={`theme-toggle ${className}`} onClick={toggle} aria-label="تبديل الثيم" title={theme === "light" ? "الوضع الداكن" : "الوضع الفاتح"}>
      {theme === "light" ? "🌙" : "☀️"}
      <span>{theme === "light" ? "داكن" : "فاتح"}</span>
    </button>
  );
}
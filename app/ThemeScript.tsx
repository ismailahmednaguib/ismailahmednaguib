// app/ThemeScript.tsx : سكريبت تطبيق الثيم فوراً لتجنب الوميض
"use client";
import { useEffect } from "react";

interface Props { theme: string; }

export default function ThemeScript({ theme }: Props) {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  return null;
}
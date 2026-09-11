// lib/db-settings.ts : إعدادات الموقع في الجداول العدلة — ملف مستقل
import { getSupabase } from "./supabase";

export async function readSettingsRow(): Promise<Record<string, unknown> | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb.from("ian_settings").select("value").eq("key", "settings").maybeSingle();
    if (error) return null;
    const v = (data as { value: Record<string, unknown> } | null)?.value;
    if (v && typeof v === "object") return v;
    return null;
  } catch {
    return null;
  }
}

export async function writeSettingsRow(value: Record<string, unknown>): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { error } = await sb.from("ian_settings").upsert(
      { key: "settings", value: value as never, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
    return !error;
  } catch {
    return false;
  }
}

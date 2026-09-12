// lib/cert-number.ts : ترقيم الشهادات التسلسلي الرسمي — ملف مستقل
// الصيغة: IAN-YYYY-XXXX برقم متسلسل لا يتكرر أبدا
export function nextCertCode(existing: { code?: string }[], year?: number): string {
  const y = year || new Date().getFullYear();
  const prefix = `IAN-${y}-`;
  let max = 0;
  for (const c of existing) {
    const code = String(c.code || "");
    if (code.startsWith(prefix)) {
      const n = parseInt(code.slice(prefix.length), 10);
      if (Number.isFinite(n) && n > max) max = n;
    } else if (/^IAN-\d{4}-\d+$/.test(code)) {
      // سنة مختلفة — تجاهل
    }
  }
  // لو لا توجد شهادات هذه السنة، ابدأ من 0001 (ولو توجد شهادات قديمة برقم عشوائي تجاهلها)
  const next = max + 1 || 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export function isCertCode(code: string): boolean {
  return /^IAN-\d{4}-\d{4,}$/.test(String(code || "").trim());
}

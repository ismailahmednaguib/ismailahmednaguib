// app/loading.tsx : حالة التحميل العامة
"use client";
export default function Loading() {
  return (
    <div style={{ 
      minHeight: "60vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      flexDirection: "column",
      gap: 16
    }}>
      <div style={{ 
        width: 48, height: 48, border: "4px solid var(--br)", borderTopColor: "var(--gold)",
        borderRadius: "50%", animation: "spin 1s linear infinite"
      }}></div>
      <p className="mut">جاري التحميل...</p>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
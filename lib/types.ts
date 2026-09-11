// lib/types.ts : كل الأنواع في ملف مستقل — لا أسرار هنا
export type Role = "admin" | "teacher" | "student";
export type Track = "academy" | "institute" | "quran" | "college";
export interface Course { slug: string; title: string; track: Track; level: string; teacher: string; hours: number; price: number; desc: string; videoUrl?: string; }
export interface Lesson { id: string; courseSlug: string; title: string; videoUrl: string; duration: string; free: boolean; }
export interface Book { slug: string; title: string; author: string; track: Track; pages: number; pdfUrl: string; desc: string; }
export interface Scholar { slug: string; name: string; title: string; bio: string; }
export interface NewsItem { slug: string; title: string; date: string; body: string; }
export interface Fatwa { id: string; q: string; a: string; scholar: string; }
export interface Certificate { code: string; student: string; course: string; date: string; grade: string; }
export interface Admission { id: string; name: string; phone: string; track: Track; course: string; date: string; status: "new" | "accepted" | "rejected"; }

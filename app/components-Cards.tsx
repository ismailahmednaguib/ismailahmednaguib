// app/components-Cards.tsx : كروت العرض فقط (دورة / كتاب)
import Link from "next/link";
import type { Course, Book } from "../lib/types";

export function CourseCard({ c }: { c: Course }) {
  return (
    <div className="card"><div className="thumb">🎓</div>
      <div className="pad"><span className="badge">{c.track} • {c.level}</span>
        <b>{c.title}</b><span className="mut">{c.teacher} • {c.hours} ساعة</span>
        <span className="mut">{c.desc}</span>
        <div className="row"><Link className="btn sm" href={`/courses/${c.slug}`}>التفاصيل</Link><span className="mut">{c.price === 0 ? "مجاني" : c.price + " ج"}</span></div>
      </div></div>
  );
}
export function BookCard({ b }: { b: Book }) {
  return (
    <div className="card"><div className="thumb">📚</div>
      <div className="pad"><span className="badge">{b.track}</span><b>{b.title}</b>
        <span className="mut">{b.author} • {b.pages} صفحة</span><span className="mut">{b.desc}</span>
        <div className="row"><a className="btn sm" href={b.pdfUrl || "#"} target="_blank" rel="noreferrer">قراءة / تحميل</a></div>
      </div></div>
  );
}


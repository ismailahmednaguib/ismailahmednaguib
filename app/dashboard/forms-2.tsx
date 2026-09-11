// app/dashboard/forms-2.tsx : نماذج الكتب (رفع سحابي) والعلماء والأخبار والفتاوى
import { Sec } from "./ui";
import UploadBox from "./UploadBox";
export function FormBook() {
  return (
    <Sec id="books" title="الكتب — رفع PDF مباشرة">
      <UploadBox targetName="pdfUrl" label="📤 ارفع ملف الكتاب (PDF حتى 100MB)" />
      <form className="frm" method="POST" action="/api/admin/books">
        <div className="row"><input name="slug" placeholder="slug الكتاب" required />
        <select name="track"><option value="academy">academy</option><option value="institute">institute</option><option value="quran">quran</option><option value="college">college</option></select></div>
        <input name="title" placeholder="اسم الكتاب" required />
        <div className="row"><input name="author" placeholder="المؤلف" /><input name="pages" placeholder="الصفحات" type="number" /></div>
        <input name="pdfUrl" placeholder="رابط PDF — ارفع بالأعلى وسيوضع هنا تلقائيا أو الصق رابطا" dir="ltr" />
        <textarea name="desc" placeholder="وصف" />
        <button className="btn gold" type="submit">إضافة الكتاب</button>
      </form>
      <p className="mut">الرفع مباشر من اللوحة للتخزين السحابي — أو الصق رابطا يدويا.</p>
    </Sec>
  );
}
export function FormScholar() {
  return (
    <Sec id="scholars" title="العلماء">
      <form className="frm" method="POST" action="/api/admin/scholars">
        <input name="slug" placeholder="slug" required />
        <input name="name" placeholder="الاسم" required />
        <input name="title" placeholder="الصفة" />
        <textarea name="bio" placeholder="نبذة" />
        <button className="btn gold" type="submit">إضافة</button>
      </form>
    </Sec>
  );
}
export function FormNews() {
  return (
    <Sec id="news" title="الأخبار">
      <form className="frm" method="POST" action="/api/admin/news">
        <input name="slug" placeholder="slug" required />
        <input name="title" placeholder="العنوان" required />
        <input name="date" placeholder="2026-09-11" />
        <textarea name="body" placeholder="النص" />
        <button className="btn gold" type="submit">نشر خبر</button>
      </form>
    </Sec>
  );
}
export function FormFatwa() {
  return (
    <Sec id="fatwa" title="الفتاوى">
      <form className="frm" method="POST" action="/api/admin/fatwas">
        <input name="q" placeholder="السؤال" required />
        <textarea name="a" placeholder="الجواب" required />
        <input name="scholar" placeholder="الشيخ" />
        <button className="btn gold" type="submit">إضافة فتوى</button>
      </form>
    </Sec>
  );
}

// app/dashboard/forms-1.tsx : نماذج الدورات والدروس فقط
import { Sec } from "./ui";
export function FormCourse() {
  return (
    <Sec id="courses" title="الدورات — إضافة دورة جديدة">
      <form className="frm" method="POST" action="/api/admin/courses">
        <div className="row">
          <input name="slug" placeholder="slug بالإنجليزية: fiqh-2" required />
          <select name="track"><option value="academy">academy شرعية</option><option value="institute">institute تدريبية</option><option value="quran">quran قرآنية</option><option value="college">college جامعية</option></select>
        </div>
        <input name="title" placeholder="اسم الدورة" required />
        <div className="row"><input name="teacher" placeholder="المدرس" /><input name="level" placeholder="المستوى" /></div>
        <div className="row"><input name="hours" placeholder="الساعات" type="number" /><input name="price" placeholder="السعر 0=مجاني" type="number" /></div>
        <input name="videoUrl" placeholder="رابط يوتيوب التعريفي (اختياري)" dir="ltr" />
        <textarea name="desc" placeholder="وصف الدورة" />
        <button className="btn gold" type="submit">إضافة الدورة</button>
      </form>
    </Sec>
  );
}
export function FormLesson() {
  return (
    <Sec id="lessons" title="الدروس والفيديوهات — الصق رابط يوتيوب">
      <p className="mut">ارفع الفيديو على يوتيوب (غير مدرج) والصق الرابط — مجاني ويستحمل ملايين المشاهدات.</p>
      <form className="frm" method="POST" action="/api/admin/lessons">
        <div className="row"><input name="courseSlug" placeholder="slug الدورة" required /><input name="duration" placeholder="المدة 12:30" /></div>
        <input name="title" placeholder="عنوان الدرس" required />
        <input name="videoUrl" placeholder="رابط الفيديو https://..." dir="ltr" />
        <button className="btn gold" type="submit">إضافة الدرس</button>
      </form>
    </Sec>
  );
}

# منصة إسماعيل أحمد نجيب — دليل الرفع والنشر والتخزين الكامل

## 1) رفع الكود على GitHub
```
git add .
git commit -m "المنظومة الكاملة: Supabase + R2 + YouTube"
git push origin main
```

## 2) نشر الموقع على Vercel (يبني تلقائيا من GitHub)
1. Vercel ← Add New → Project ← Import مستودع `ismailahmednaguib`
2. في **Environment Variables** أضف:
   - `JWT_SECRET` = مفتاحك الطويل (نفس الموجود في `.env.local` عندك)
   - `SUPABASE_URL` = رابط مشروعك (من Supabase → Project Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` = مفتاح service_role (سري جدا — للسيرفر فقط)
   - (اختياري للملفات الكبيرة) `R2_ENDPOINT` + `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY` + `R2_BUCKET` + `R2_PUBLIC_URL`
3. **Deploy** — اللوحة ستعرض "☁️ Supabase سحابي دائم ✓" عندما يعمل الربط.

## 3) تجهيز Supabase (مرة واحدة — 5 دقائق)
1. افتح مشروعك على supabase.com ← **SQL Editor** ← الصق محتوى `supabase/schema.sql` ← **Run**
   (ينشئ جدول `ian_store` + يفعل RLS مقفولا على العامة — الكتابة عبر SERVICE_ROLE فقط)
2. **Storage** ← New bucket ← الاسم `ian-files` ← خليه **Private**
3. انقل بياناتك الحالية مرة واحدة من جهازك:
```
$env:SUPABASE_URL='رابطك'; $env:SUPABASE_SERVICE_ROLE_KEY='مفتاحك'; node scripts/migrate-to-supabase.mjs
```
4. ادخل `/login` مرة واحدة (ينشئ حساب الأدمن في Supabase) ثم غيّر الباسورد من اللوحة ← الأمان.

## 4) تجهيز Cloudflare R2 للملفات الكبيرة (اختياري — 5 دقائق)
1. Cloudflare Dashboard ← **R2** ← Create bucket (مثال `ian-files`)
2. R2 ← **Manage R2 API tokens** ← Create API token ← صلاحية Object Read & Write ← انسخ:
   `R2_ENDPOINT` = `https://<account-id>.r2.cloudflarestorage.com`
   `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY` + `R2_BUCKET`
3. للروابط العامة: Bucket ← Settings ← Public access ← فعّل (يعطيك `https://pub-xxxx.r2.dev`) ← ضعه في `R2_PUBLIC_URL`
   أو اربط دومين مخصص `files.موقعك.com`
4. ضع المتغيرات الخمسة في Vercel ← Redeploy — الرفع من اللوحة سيذهب لـ R2 تلقائيا.

## 5) الفيديوهات على يوتيوب (مجاني بلا حدود)
- ارفع الفيديو ← **غير مدرج Unlisted** ← الصق الرابط في اللوحة ← قسم الدروس/الدورات.
- يدعم: عادي + shorts + live + embed — والمشغل يظهر تلقائيا في صفحة الدورة.

## 6) التشغيل محليا
```
npm install
copy .env.example .env.local
# املأ JWT_SECRET (والمتغيرات السحابية لو تريد تجربة Supabase محليا)
npm run dev
```
- الدخول: http://localhost:3000/login — بحساب الأدمن المنشأ عبر `supabase/set-admin.sql` (لا توجد حسابات افتراضية في الكود)

## 7) كيف تعمل المنظومة؟
- **البيانات** (يوزرات/دورات/شهادات/تقديمات/إعدادات): جداول `ian_*` العدلة عند وجود المتغيرات، وإلا ملفات `data/*.json` محليا.
- **الملفات** (PDF/صور حتى 100MB): التخزين السحابي أولا ثم البديل، من زر الرفع في قسم الكتب.
- **الفيديو**: روابط يوتيوب فقط — لا نستهلك مساحة الاستضافة.
- **الأمان**: SERVICE_ROLE ومفاتيح R2 في السيرفر فقط — لا تظهر للمتصفح أبدا. RLS مقفول على العامة.

## 8) ملاحظة أمان مهمة
- `data/users.json` و `data/admissions.json` و `.env.local` في `.gitignore` — لا ترفعهم أبدا.


// app/api/certificates/route.ts : توليد وتحميل شهادات PDF
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { currentUser } from "@/lib/auth";
import PDFDocument from "pdfkit";
import { Readable } from "stream";

async function getUserId(email: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("ian_users").select("id").eq("email", email).single();
  return data?.id || null;
}

// توليد شهادة PDF
function generateCertificatePDF(params: {
  studentName: string;
  courseTitle: string;
  certificateCode: string;
  issueDate: string;
  grade: string;
  verifyUrl: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 50,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const { studentName, courseTitle, certificateCode, issueDate, grade, verifyUrl } = params;
    
    // خلفية
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f8f9fa");
    
    // إطار خارجي
    doc.lineWidth(3).rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke("#2d5a27");
    doc.lineWidth(1).rect(40, 40, doc.page.width - 80, doc.page.height - 80).stroke("#2d5a27");
    
    // شعار/عنوان
    doc.fontSize(12).fillColor("#666").text("شهادة إتمام معتمدة", 0, 60, { align: "center" });
    
    // خط زخرفي
    doc.moveTo(200, 85).lineTo(doc.page.width - 200, 85).stroke("#2d5a27");
    
    // العنوان الرئيسي
    doc.fontSize(36).fillColor("#1a3a1a").text("شهادة إتمام", 0, 100, { align: "center" });
    
    // نص التقديم
    doc.fontSize(18).fillColor("#333").text("تُمنح هذه الشهادة لـ", 0, 160, { align: "center" });
    
    // اسم الطالب
    doc.fontSize(28).fillColor("#2d5a27").text(studentName, 0, 190, { align: "center" });
    
    // نص الإنجاز
    doc.fontSize(18).fillColor("#333").text("لإتمامه بنجاح كورس", 0, 240, { align: "center" });
    
    // اسم الكورس
    doc.fontSize(24).fillColor("#1a3a1a").text(courseTitle, 0, 270, { align: "center", width: doc.page.width - 100 });
    
    // التقدير
    doc.fontSize(16).fillColor("#333").text(`بالتقدير: ${grade}`, 0, 320, { align: "center" });
    
    // التاريخ والرمز
    const bottomY = 360;
    doc.fontSize(12).fillColor("#666");
    doc.text(`تاريخ الإصدار: ${issueDate}`, 80, bottomY, { align: "left" });
    doc.text(`رمز الشهادة: ${certificateCode}`, doc.page.width - 300, bottomY, { align: "right", width: 280 });
    
    // رابط التحقق
    doc.fontSize(10).fillColor("#888").text(`التحقق من الشهادة: ${verifyUrl}`, 0, bottomY + 40, { align: "center", width: doc.page.width });
    
    // خط التوقيع
    const sigY = doc.page.height - 120;
    doc.moveTo(150, sigY).lineTo(350, sigY).stroke("#2d5a27");
    doc.fontSize(11).fillColor("#666").text("مدير الأكاديمية", 150, sigY + 5, { width: 200, align: "center" });
    
    doc.moveTo(doc.page.width - 350, sigY).lineTo(doc.page.width - 150, sigY).stroke("#2d5a27");
    doc.fontSize(11).fillColor("#666").text("ختم الأكاديمية", doc.page.width - 350, sigY + 5, { width: 200, align: "center" });
    
    // شعار مائي
    doc.fontSize(80).fillColor("#e8f5e9").text("✓", 0, doc.page.height / 2 - 40, { align: "center" });
    
    doc.end();
  });
}

// GET: تحميل شهادة PDF
export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const studentEmail = searchParams.get("student");

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  let query = sb.from("ian_certificates").select("*");
  
  if (code) {
    query = query.eq("code", code);
  } else if (studentEmail) {
    const studentId = await getUserId(studentEmail);
    if (!studentId) return NextResponse.json({ ok: false, error: "طالب غير موجود" }, { status: 404 });
    query = query.eq("student", studentEmail);
  } else {
    return NextResponse.json({ ok: false, error: "رمز الشهادة أو بريد الطالب مطلوب" }, { status: 400 });
  }

  const { data: certs, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (!certs || !certs.length) return NextResponse.json({ ok: false, error: "الشهادة غير موجودة" }, { status: 404 });

  const cert = certs[0];
  
  // التحقق من الصلاحية: الطالب يرى شهاداته فقط، الأدمن يرى كل شيء
  if (user.role !== "admin" && cert.student !== user.email) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  // جلب بيانات الكورس
  const { data: course } = await sb
    .from("ian_courses")
    .select("title")
    .eq("slug", cert.course)
    .single();

  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/verify?code=${cert.code}`;
  
  try {
    const pdfBuffer = await generateCertificatePDF({
      studentName: cert.student, // في الواقع نحتاج اسم الطالب من الجدول
      courseTitle: course?.title || cert.course,
      certificateCode: cert.code,
      issueDate: cert.date,
      grade: cert.grade || "مقبول",
      verifyUrl,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${cert.code}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("PDF generation error:", e);
    return NextResponse.json({ ok: false, error: "فشل في توليد الشهادة" }, { status: 500 });
  }
}

// POST: إنشاء شهادة جديدة (للأدمن أو عند إكمال الكورس)
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { studentEmail, courseSlug, grade } = body;

  if (!studentEmail || !courseSlug) {
    return NextResponse.json({ ok: false, error: "بريد الطالب والكورس مطلوبان" }, { status: 400 });
  }

  // التحقق من الصلاحية
  if (user.role !== "admin" && user.email !== studentEmail) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  // التحقق من عدم وجود شهادة سابقة
  const { data: existing } = await sb
    .from("ian_certificates")
    .select("code")
    .eq("student", studentEmail)
    .eq("course", courseSlug)
    .single();

  if (existing) {
    return NextResponse.json({ ok: false, error: "الشهادة موجودة مسبقاً", code: existing.code }, { status: 400 });
  }

  // إنشاء رمز شهادة فريد
  const code = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const date = new Date().toLocaleDateString("ar-SA");

  const { data, error } = await sb
    .from("ian_certificates")
    .insert({
      code,
      student: studentEmail,
      course: courseSlug,
      date,
      grade: grade || "مقبول",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // إرسال إشعار للطالب
  if (user.role === "admin" || user.email !== studentEmail) {
    try {
      const { createNotification } = await import("@/lib/notifications");
      const studentId = await getUserId(studentEmail);
      if (studentId) {
        await createNotification({
          userId: studentId,
          type: "new_certificate",
          title: "شهادة جديدة",
          message: `تم إصدار شهادة إتمام كورس "${courseSlug}"`,
          link: `/student/certificates?code=${code}`,
        });
      }
    } catch {
      // تجاهل خطأ الإشعار
    }
  }

  return NextResponse.json({ ok: true, certificate: data });
}
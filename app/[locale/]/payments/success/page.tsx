// app/[locale]/payments/success/page.tsx : صفحة نجاح الدفع
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import PaymentSuccess from "@/app/components/PaymentSuccess";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { locale } = await params;
  const { session_id } = await searchParams;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);
  
  return <PaymentSuccess locale={locale} sessionId={session_id} userEmail={user.email} />;
}
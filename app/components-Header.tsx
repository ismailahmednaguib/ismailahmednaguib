// app/components-Header.tsx : الهيدر والقائمة فقط — الاسم يأتي من الإعدادات
import Link from "next/link";
import NavBurger from "./NavBurger";

const LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/courses", label: "الدورات" },
  { href: "/library", label: "المكتبة" },
  { href: "/quran", label: "المدرسة القرآنية" },
  { href: "/scholars", label: "العلماء" },
  { href: "/fatwa", label: "الفتاوى" },
  { href: "/news", label: "الأخبار" },
  { href: "/verify", label: "تحقق من شهادة" },
  { href: "/admission", label: "التقديم" },
  { href: "/dashboard", label: "لوحة التحكم" },
];

export default function Header({ siteName, tagline }: { siteName: string; tagline: string }) {
  return (
    <header id="siteHeader">
      <div className="head-in">
        <NavBurger />
        <Link href="/" className="brand">
          <span className="logo">◈</span>
          <span><b>{siteName}</b><small>{tagline}</small></span>
        </Link>
        <nav id="mainNav">
          {LINKS.map((l) => (<Link key={l.href} href={l.href}>{l.label}</Link>))}
        </nav>
        <div className="hact">
          <Link className="btn sm gold" href="/admission">قدّم الآن</Link>
        </div>
      </div>
    </header>
  );
}


// app/components-Header.tsx : الهيدر والقائمة — كل كلمة من اللوحة
import Link from "next/link";
import NavBurger from "./NavBurger";
import SearchBox from "./components-Search";
import UserNav from "./UserNav";
import ThemeToggle from "./ThemeToggle";
import type { SiteSettings } from "../lib/site-settings";

export default function Header({ s }: { s: SiteSettings }) {
  const LINKS = [
    { href: "/", label: s.navHome || "الرئيسية" },
    { href: "/courses", label: s.navCourses || "الدورات" },
    { href: "/library", label: s.navLibrary || "المكتبة" },
    { href: "/quran", label: s.navQuran || "المدرسة القرآنية" },
    { href: "/scholars", label: s.navScholars || "العلماء" },
    { href: "/fatwa", label: s.navFatwa || "الفتاوى" },
    { href: "/news", label: s.navNews || "الأخبار" },
    { href: "/verify", label: s.navVerify || "تحقق من شهادة" },
    { href: "/admission", label: s.navAdmission || "التقديم" },
  ];
  return (
    <header id="siteHeader">
      <div className="head-in">
        <NavBurger />
        <Link href="/" className="brand">
          <span className="logo">◈</span>
          <span><b>{s.siteName}</b><small>{s.tagline}</small></span>
        </Link>
        <nav id="mainNav">
          {LINKS.map((l) => (<Link key={l.href} href={l.href}>{l.label}</Link>))}
        </nav>
        <div className="hact">
          <SearchBox placeholder="ابحث..." className="header-search" />
          <ThemeToggle />
          <UserNav s={s} />
        </div>
      </div>
    </header>
  );
}
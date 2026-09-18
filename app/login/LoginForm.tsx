// app/login/LoginForm.tsx : نموذج الدخول — كل كلمة من اللوحة + إظهار/إخفاء
"use client";
import { useState } from "react";

export default function LoginForm({ locale, emailLabel, passLabel, btnLabel, showLabel, hideLabel }: { locale: string; emailLabel: string; passLabel: string; btnLabel: string; showLabel: string; hideLabel: string }) {
  const [show, setShow] = useState(false);
  return (
    <form className="frm" method="POST" action="/api/login">
      <input type="hidden" name="locale" value={locale} />
      <label htmlFor="login-email">{emailLabel}</label>
      <input id="login-email" name="email" type="email" required dir="ltr" autoComplete="username" autoCapitalize="none" inputMode="email" />
      <label htmlFor="login-password">{passLabel}</label>
      <div className="row" style={{ alignItems: "stretch" }}>
        <input id="login-password" name="password" type={show ? "text" : "password"} required dir="ltr" autoComplete="current-password" style={{ flex: 1 }} />
        <button type="button" className="btn sm ghost" onClick={() => setShow((v) => !v)} aria-pressed={show}>{show ? hideLabel : showLabel}</button>
      </div>
      <button className="btn gold" type="submit">{btnLabel}</button>
    </form>
  );
}

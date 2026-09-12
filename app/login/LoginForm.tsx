// app/login/LoginForm.tsx : نموذج الدخول — كل كلمة من اللوحة + إظهار/إخفاء
"use client";
import { useState } from "react";

export default function LoginForm({ emailLabel, passLabel, btnLabel, showLabel, hideLabel }: { emailLabel: string; passLabel: string; btnLabel: string; showLabel: string; hideLabel: string }) {
  const [show, setShow] = useState(false);
  return (
    <form className="frm" method="POST" action="/api/login">
      <label>{emailLabel}</label>
      <input name="email" type="email" required dir="ltr" autoComplete="username" />
      <label>{passLabel}</label>
      <div className="row" style={{ alignItems: "stretch" }}>
        <input name="password" type={show ? "text" : "password"} required dir="ltr" autoComplete="current-password" style={{ flex: 1 }} />
        <button type="button" className="btn sm ghost" onClick={() => setShow((v) => !v)}>{show ? hideLabel : showLabel}</button>
      </div>
      <button className="btn gold" type="submit">{btnLabel}</button>
    </form>
  );
}

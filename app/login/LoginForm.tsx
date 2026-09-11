// app/login/LoginForm.tsx : نموذج الدخول فقط — إظهار/إخفاء الباسورد
"use client";
import { useState } from "react";

export default function LoginForm() {
  const [show, setShow] = useState(false);
  return (
    <form className="frm" method="POST" action="/api/login">
      <label>البريد الإلكتروني</label>
      <input name="email" type="email" required dir="ltr" autoComplete="username" />
      <label>كلمة المرور</label>
      <div className="row" style={{ alignItems: "stretch" }}>
        <input name="password" type={show ? "text" : "password"} required dir="ltr" autoComplete="current-password" style={{ flex: 1 }} />
        <button type="button" className="btn sm ghost" onClick={() => setShow((s) => !s)}>{show ? "إخفاء" : "إظهار"}</button>
      </div>
      <button className="btn gold" type="submit">دخول</button>
    </form>
  );
}

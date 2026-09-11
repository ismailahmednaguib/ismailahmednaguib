// app/NavBurger.tsx : زر القائمة للموبايل فقط
"use client";
export default function NavBurger() {
  function toggle() {
    const nav = document.getElementById("mainNav");
    if (nav) nav.classList.toggle("open");
  }
  return (
    <button id="burgerBtn" onClick={toggle} aria-label="القائمة" type="button">
      ☰
    </button>
  );
}

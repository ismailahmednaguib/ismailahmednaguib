// app/components-Search.tsx : مكون البحث المباشر
"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function SearchBox({ 
  placeholder = "ابحث في الدورات والكتب والأخبار...",
  className = "",
  showResults = true
}: { 
  placeholder?: string; 
  className?: string;
  showResults?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{
    type: string; title: string; desc: string; url: string; track?: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node) &&
          resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`);
          const data = await res.json();
          if (data.ok) setResults(data.results || []);
        } catch { }
        setLoading(false);
        setShow(true);
      } else {
        setResults([]);
        setShow(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const typeLabels: Record<string, string> = {
    course: "دورة", book: "كتاب", news: "خبر", scholar: "عالم", fatwa: "فتوى"
  };
  const typeIcons: Record<string, string> = {
    course: "🎓", book: "📚", news: "📰", scholar: "👳", fatwa: "⚖️"
  };

  return (
    <div className={`search-wrapper ${className}`} style={{ position: "relative" }}>
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShow(true)}
          className="search-input"
          autoComplete="off"
          aria-label="البحث"
          aria-expanded={show && results.length > 0}
          aria-controls="search-results"
        />
        {loading && <span className="search-loading" aria-hidden="true">⏳</span>}
      </div>

      {showResults && show && (
        <div 
          ref={resultsRef}
          id="search-results"
          className="search-results"
          role="listbox"
          aria-label="نتائج البحث"
        >
          {results.length > 0 ? (
            <ul role="list">
              {results.map((r, i) => (
                <li key={`${r.type}-${r.url}-${i}`} role="option">
                  <Link href={r.url} onClick={() => setShow(false)}>
                    <span className="result-icon">{typeIcons[r.type] || "🔍"}</span>
                    <div className="result-content">
                      <span className="result-title">{r.title}</span>
                      <span className="result-meta">
                        <span className="result-type">{typeLabels[r.type] || r.type}</span>
                        {r.track && <span className="result-track">{r.track}</span>}
                        <span className="result-desc">{r.desc}</span>
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="search-empty">لا توجد نتائج لـ "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
}
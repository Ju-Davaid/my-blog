"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/data";
import Icon from "./Icon";
import ThemeToggle from "./ThemeToggle";

/**
 * 顶部吸顶导航：滚动后浮现毛玻璃底边；「更多」下拉菜单。
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 点击外部关闭下拉
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const isActive = (href: string) => {
    const base = href.split("#")[0];
    if (base === "/") return pathname === "/";
    return pathname.startsWith(base);
  };

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div
        className="mx-auto flex h-12.5 items-center justify-between px-3 md:px-5"
        style={{ maxWidth: 1100 }}
      >
        <Link
          href="/"
          aria-label="网站首页"
          className="font-serif text-lg font-semibold tracking-[0.14em] text-primary transition-colors hover:text-foreground"
        >
          {SITE.brand}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {SITE.nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`nav-link ${isActive(n.href) ? "is-active" : ""}`}
            >
              {n.label}
            </Link>
          ))}

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="nav-link inline-flex cursor-pointer items-center gap-1"
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              onClick={() => setMoreOpen((v) => !v)}
            >
              更多
              <span className="inline-flex">
                <Icon name="chevron-down" className="h-3.5 w-3.5" />
              </span>
            </button>
            {moreOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-3 w-36 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg"
              >
                {SITE.more.map((m) => (
                  <Link
                    key={m.label}
                    role="menuitem"
                    href={m.href}
                    onClick={() => setMoreOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                  >
                    {m.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

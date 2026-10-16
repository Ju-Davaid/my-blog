"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE, type IconName } from "@/lib/data";
import { Icon } from "@/components/ui";

/**
 * 移动端底部胶囊导航。
 */
export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="mobile-nav md:hidden" aria-label="移动端导航">
      {SITE.nav.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className={`mobile-nav-item ${isActive(n.href) ? "is-active" : ""}`}
        >
          <Icon name={n.icon as IconName} className="h-[18px] w-[18px]" />
          <span>{n.label}</span>
        </Link>
      ))}
    </nav>
  );
}

import { SITE } from "@/lib/data";
import { Icon } from "@/components/ui";

/**
 * 页脚：品牌、版权与社交链接。
 */
export default function Footer() {
  const year = 2026;
  const socials: { icon: "github" | "mail" | "rss"; label: string }[] = [
    { icon: "github", label: "GitHub" },
    { icon: "mail", label: "邮箱" },
    { icon: "rss", label: "RSS" },
  ];

  return (
    <footer className="relative z-10 mx-auto mt-24 w-full px-5 pb-28 md:pb-12">
      <div className="border-t border-border pt-8">
        <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
          <div className="text-center md:text-left">
            <p className="font-serif text-sm tracking-[0.12em] text-foreground">
              {SITE.brand}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              © {year} {SITE.author} · 用镜头和文字记录生活的温度
            </p>
          </div>
          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <a
                key={s.icon}
                href="#"
                aria-label={s.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
              >
                <Icon name={s.icon} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

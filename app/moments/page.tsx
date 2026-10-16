import Reveal from "@/components/Reveal";
import PhotoGrid from "@/components/PhotoGrid";
import MomentComments from "@/components/comments/MomentComments";
import { MOMENTS, MOMENT_TIMELINE } from "@/lib/data";
import Image from "next/image";

/**
 * 动态页面
 */
export default function MomentsPage() {
  return (
    <>
      <Reveal className="pt-12 pb-8 md:pt-16">
        <p className="mb-3 text-[11px] tracking-[0.2em] text-muted-foreground">
          MOMENTS
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-wide text-foreground md:text-4xl">
          动态
        </h1>
      </Reveal>

      {/* 三栏：资料卡 / 信息流 / 时间轴 */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)_170px]">
        {/* 左栏：个人资料卡 */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-5">
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <Image
                  width={48}
                  height={48}
                  src="https://picsum.photos/seed/mori-avatar/96/96"
                  alt="头像"
                  className="h-12 w-12 rounded-full border border-border object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-serif text-sm font-semibold text-foreground">
                    森屿
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    记录生活
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                发点几分钟碎碎念，也发照片。写不成文章的，都在这里。
              </p>
              <div className="mt-4 grid grid-cols-2 divide-x divide-border border-t border-border pt-4 text-center">
                <div>
                  <p className="font-serif text-lg tabular-nums text-foreground">
                    18
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    动态
                  </p>
                </div>
                <div>
                  <p className="font-serif text-lg tabular-nums text-foreground">
                    52
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    图片
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <p className="mb-3 font-serif text-xs tracking-[0.14em] text-muted-foreground">
                标签
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="tag">全部</span>
                <span className="tag">总结 6</span>
                <span className="tag">日常 3</span>
                <span className="tag">摄影</span>
                <span className="tag">音乐</span>
              </div>
            </div>
          </div>
        </aside>

        {/* 中栏：朋友圈信息流 */}
        <section className="min-w-0 space-y-8">
          {MOMENTS.map((m, i) => (
            <Reveal key={m.id} delay={Math.min(i, 4) * 45}>
              <article className="flex gap-3">
                <Image
                  width={40}
                  height={40}
                  src="https://picsum.photos/seed/mori-avatar/96/96"
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-md border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-sm font-medium text-primary">
                    森屿
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-card-foreground">
                    {m.text}
                  </p>

                  {m.photos && <PhotoGrid photos={m.photos} variant="moment" />}

                  <MomentComments
                    momentId={m.id}
                    likes={m.likes}
                    category={m.category}
                    date={m.date}
                  />
                </div>
              </article>
            </Reveal>
          ))}
        </section>

        {/* 右栏：时间轴 */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <div className="card p-4">
              <p className="mb-3 font-serif text-xs tracking-[0.14em] text-muted-foreground">
                时间轴
              </p>
              <div className="space-y-3 border-l border-border pl-3.5">
                {MOMENT_TIMELINE.map((t, i) => (
                  <a
                    key={t.date}
                    href="#"
                    className={`block ${i === 0 ? "" : "opacity-70 transition-opacity hover:opacity-100"}`}
                  >
                    <p
                      className={`text-sm font-medium ${i === 0 ? "text-primary" : "text-foreground"}`}
                    >
                      {t.date}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t.count} 条
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

import Link from "next/link";
import Reveal from "@/components/Reveal";
import PhotoGrid from "@/components/PhotoGrid";
import { ALBUMS, FEATURED_PHOTOS } from "@/lib/data";

export default function AlbumsPage() {
  const totalPhotos = ALBUMS.reduce((s, a) => s + a.count, 0);

  return (
    <>
      <Reveal className="pt-12 pb-10 md:pt-16">
        <p className="mb-3 text-[11px] tracking-[0.2em] text-muted-foreground">
          ALBUMS
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-wide text-foreground md:text-4xl">
          相册
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          共{" "}
          <span className="tabular-nums text-foreground">{ALBUMS.length}</span>{" "}
          个相册，
          <span className="tabular-nums text-foreground">
            {totalPhotos}
          </span>{" "}
          张照片。点击封面进入相册，
          相册内点击任意照片可放大查看，支持键盘方向键与手势切换（照片来源于网络占位服务，可替换为本地图片）。
        </p>
      </Reveal>

      {/* 相册封面（按时间倒序） */}
      <Reveal className="grid gap-6 md:grid-cols-2">
        {ALBUMS.map((a) => (
          <Link
            key={a.id}
            href={`/albums/${a.id}`}
            className="card card-hover group overflow-hidden"
          >
            <div className="relative aspect-16/10 overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.cover}
                alt={a.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="font-serif text-lg font-semibold tracking-wide text-white">
                      {a.title}
                    </h2>
                    <p className="mt-1 text-xs text-white/75">
                      {a.date} · {a.count} 张
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs text-white backdrop-blur transition-colors group-hover:bg-white/25">
                    查看 →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </Reveal>

      {/* 精选照片瀑布流 */}
      <Reveal className="mt-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-serif text-xl tracking-wide text-foreground">
            精选
          </h2>
          <span className="text-xs tracking-widest text-muted-foreground">
            SELECTED
          </span>
        </div>

        <PhotoGrid
          photos={FEATURED_PHOTOS}
          variant="masonry"
          masonryClassName="columns-2 gap-4 md:columns-3 lg:columns-4"
        />
      </Reveal>
    </>
  );
}

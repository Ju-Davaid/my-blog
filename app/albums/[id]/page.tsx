import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import PhotoGrid from "@/components/PhotoGrid";
import Icon from "@/components/Icon";
import { ALBUMS, buildPhotos, getAlbum } from "@/lib/data";

export function generateStaticParams() {
  return ALBUMS.map((a) => ({ id: a.id }));
}

// 纯静态路由（generateStaticParams 已枚举全部 id），允许阻塞式渲染以读取 params
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const album = getAlbum(id);
  return { title: album ? album.title : "相册" };
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = getAlbum(id);

  if (!album) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-2xl text-foreground">相册不存在</p>
        <p className="mt-3 text-sm text-muted-foreground">链接可能已失效，或者这个相册还没建好。</p>
        <Link
          href="/albums"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:-translate-y-0.5"
        >
          ← 返回相册列表
        </Link>
      </div>
    );
  }

  const photos = buildPhotos(album);
  const idx = ALBUMS.findIndex((a) => a.id === id);
  const prev = ALBUMS[(idx - 1 + ALBUMS.length) % ALBUMS.length];
  const next = ALBUMS[(idx + 1) % ALBUMS.length];

  return (
    <>
      {/* 面包屑 */}
      <nav className="reveal flex items-center gap-2 pt-8 text-xs text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-primary">
          首页
        </Link>
        <span className="opacity-50">/</span>
        <Link href="/albums" className="transition-colors hover:text-primary">
          相册
        </Link>
        <span className="opacity-50">/</span>
        <span className="text-foreground/70">{album.title}</span>
      </nav>

      <header className="reveal pt-8 pb-10">
        <p className="mb-3 text-[11px] tracking-[0.2em] text-muted-foreground">{album.date}</p>
        <h1 className="font-serif text-3xl font-semibold tracking-wide text-foreground md:text-4xl">
          {album.title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{album.desc}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="tag tag-accent">
            共 <span className="tabular-nums">{album.count}</span> 张
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon name="zoom-in" className="h-3.5 w-3.5" />
            点击任意照片可放大查看
          </span>
          <Link
            href="/albums"
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
          >
            ← 返回相册列表
          </Link>
        </div>
      </header>

      {/* 照片墙 */}
      <Reveal>
        <PhotoGrid photos={photos} variant="masonry" masonryClassName="columns-1 gap-4 sm:columns-2 lg:columns-3" />
      </Reveal>

      {/* 上一个 / 下一个相册 */}
      <Reveal className="mt-14">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href={`/albums/${prev.id}`} className="card card-hover group flex-1 p-5">
            <p className="text-xs text-muted-foreground">← 上一个相册</p>
            <p className="mt-2 font-serif text-sm font-medium text-card-foreground transition-colors group-hover:text-primary">
              {prev.title}
              <span className="ml-2 text-xs font-normal text-muted-foreground">{prev.count} 张</span>
            </p>
          </Link>
          <Link href={`/albums/${next.id}`} className="card card-hover group flex-1 p-5 sm:text-right">
            <p className="text-xs text-muted-foreground">下一个相册 →</p>
            <p className="mt-2 font-serif text-sm font-medium text-card-foreground transition-colors group-hover:text-primary">
              {next.title}
              <span className="ml-2 text-xs font-normal text-muted-foreground">{next.count} 张</span>
            </p>
          </Link>
        </div>
      </Reveal>
    </>
  );
}

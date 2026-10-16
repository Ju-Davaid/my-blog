/* ==========================================================================
   DAVAID BLOG — 站点数据层
   ========================================================================== */

export const SITE = {
  brand: "DAVAID BLOG",
  author: "DAVAID",
  nav: [
    { label: "首页", href: "/", icon: "house" },
    { label: "文章", href: "/articles", icon: "file-text" },
    { label: "动态", href: "/moments", icon: "newspaper" },
    { label: "相册", href: "/albums", icon: "images" },
    { label: "关于", href: "/about", icon: "user-round" },
  ],
  more: [
    { label: "归档", href: "/#archive" },
    { label: "标签", href: "/articles#tags" },
    { label: "友链", href: "/about#links" },
    { label: "RSS", href: "/" },
  ],
} as const;

export type IconName =
  | "house"
  | "file-text"
  | "newspaper"
  | "images"
  | "user-round"
  | "sun"
  | "moon"
  | "monitor"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "arrow-left"
  | "arrow-up-right"
  | "clock"
  | "calendar"
  | "menu"
  | "x"
  | "github"
  | "mail"
  | "rss"
  | "search"
  | "zoom-in"
  | "heart"
  | "message-circle"
  | "send"
  | "corner-down-right"
  | "thumbs-up"
  | "flame"
  | "trash-2"
  | "smile"
  | "chevron-up"
  | "loader";

/* 内联 SVG 图标（取自 Lucide，stroke 风格） */
export const ICONS: Record<IconName, string> = {
  house:
    '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  "file-text":
    '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  newspaper:
    '<path d="M15 18h-5"/><path d="M18 14h-8"/><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="10" y="6" rx="1"/>',
  images:
    '<path d="m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16"/><path d="M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2"/><circle cx="8" cy="8" r="1" fill="currentColor"/><rect width="14" height="14" x="8" y="2" rx="2"/>',
  "user-round":
    '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9"/>',
  monitor:
    '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  "chevron-left": '<path d="m15 18-6-6 6-6"/>',
  "chevron-right": '<path d="m9 18 6-6-6-6"/>',
  "arrow-left": '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  "arrow-up-right": '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  calendar:
    '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  github:
    '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  rss: '<path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1" fill="currentColor"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  "zoom-in":
    '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  "message-circle":
    '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  "corner-down-right":
    '<path d="m15 10 5 5-5 5"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/>',
  "thumbs-up":
    '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
  flame:
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  "trash-2":
    '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  smile:
    '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
  "chevron-up": '<path d="m18 15-6-6-6 6"/>',
  loader: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
};

/* ==========================================================================
   文章数据
   ========================================================================== */

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  dateLabel: string; // 展示用
  readTime: string;
  tags: string[];
  pinned?: boolean;
};

export const POSTS: Post[] = [
  {
    slug: "tailwind-design-system",
    title: "用 Tailwind CSS 复刻一套设计系统",
    excerpt:
      "把色彩、字体、圆角、阴影全部收敛成 CSS 变量，再用 @theme 映射成工具类。改一处变量，整站换肤。",
    date: "2026-10-12",
    dateLabel: "10/12",
    readTime: "8 分钟",
    tags: ["前端", "CSS"],
  },
  {
    slug: "blog-attacked",
    title: "我的博客被攻击了",
    excerpt:
      "凌晨三点收到监控告警，QPS 曲线像被人拽着头发往上提。查日志、封 IP、补规则，天亮之前把洞堵上——顺便把这次事件整理成一份可复用的排查清单。",
    date: "2026-10-08",
    dateLabel: "10/08",
    readTime: "12 分钟",
    tags: ["编程", "运维"],
    pinned: true,
  },
  {
    slug: "minimal-virtual-scroll",
    title: "从零实现一个极简虚拟滚动",
    excerpt:
      "十万条数据，DOM 里只留二十个节点。核心不过是三行数学：起始索引、偏移量、可视高度。",
    date: "2026-09-21",
    dateLabel: "9/21",
    readTime: "10 分钟",
    tags: ["前端", "性能"],
  },
  {
    slug: "photography-composition",
    title: "《摄影构图学》——随笔",
    excerpt:
      "三分法不是规则，是起点。真正的构图是把观众的视线从画面边缘请进来，再稳稳地送到你想让他看的地方。",
    date: "2026-09-07",
    dateLabel: "9/07",
    readTime: "6 分钟",
    tags: ["摄影", "读书"],
  },
  {
    slug: "music-theory-dlc02",
    title: "乐理基础 DLC02 · 调内和弦",
    excerpt:
      "大调七个音，各自往上叠两个三度，得到七个和弦。记住级数，比记住名字有用得多。",
    date: "2026-09-07",
    dateLabel: "9/07",
    readTime: "7 分钟",
    tags: ["音乐"],
  },
  {
    slug: "agent-theory-part1",
    title: "Agent 与大模型开发理论 · 第一部分",
    excerpt:
      "从「提示词工程」到「上下文工程」，讨论的其实是同一件事：如何在有限的窗口里，塞进最有效的信息。",
    date: "2026-07-29",
    dateLabel: "7/29",
    readTime: "15 分钟",
    tags: ["AI", "随笔"],
  },
  {
    slug: "comic-con-notes",
    title: "漫展随记",
    excerpt:
      "一天走了两万步，电池耗掉三块，回来修图修到凌晨。但那一张逆光里的侧脸，值得。",
    date: "2026-07-28",
    dateLabel: "7/28",
    readTime: "5 分钟",
    tags: ["生活", "摄影"],
  },
  {
    slug: "portrait-planning",
    title: "人像拍摄前期策划方案",
    excerpt:
      "场地、服装、色温、镜头语言——把能提前定的都定下来，现场才有余力应付意外。",
    date: "2026-07-22",
    dateLabel: "7/22",
    readTime: "9 分钟",
    tags: ["摄影"],
  },
  {
    slug: "sharding-smooth",
    title: "分表如何保证丝滑？—— 从「纯新增」聊到大厂主流方案",
    excerpt:
      "分表本身不难，难的是分完之后那些绕不开的问题：扩容、路由、以及凌晨两点的那条慢查询。",
    date: "2026-07-22",
    dateLabel: "7/22",
    readTime: "18 分钟",
    tags: ["后端", "数据库"],
  },
  {
    slug: "hexo-to-nextjs",
    title: "把博客从 Hexo 迁到了 Next.js",
    excerpt:
      "理由很简单：我想要一个能写交互的地方。静态站点很好，但有些想法需要跑起来才说得清。",
    date: "2026-06-18",
    dateLabel: "6/18",
    readTime: "11 分钟",
    tags: ["前端", "随笔"],
  },
  {
    slug: "music-theory-dlc01",
    title: "乐理基础 DLC01 · 音程与和弦",
    excerpt:
      "音程是两个音之间的距离，和弦是三个以上的音叠在一起。所有好听的东西，都从这两个定义长出来。",
    date: "2026-06-05",
    dateLabel: "6/05",
    readTime: "8 分钟",
    tags: ["音乐"],
  },
];

export function getPostBySlug(slug: string): Post | null {
  return POSTS.find((p) => p.slug === slug) ?? null;
}

/* 文章正文（当前仅「我的博客被攻击了」有完整正文，其余为占位） */
export type PostContent = {
  toc: { id: string; label: string }[];
  body: string; // HTML 字符串，由受控内容渲染
};

export const POST_BODIES: Record<string, PostContent> = {
  "blog-attacked": {
    toc: [
      { id: "s1", label: "一、先判断性质，再动手" },
      { id: "s2", label: "二、四层止血" },
      { id: "s3", label: "三、沉淀成清单" },
    ],
    body: "",
  },
};

/* 归档：按年月分组（首页时间线） */
export type ArchiveGroup = {
  yearMonth: string;
  label: string;
  items: { dateLabel: string; title: string; slug: string }[];
};

export const ARCHIVE: ArchiveGroup[] = [
  {
    yearMonth: "2026-10",
    label: "2026 年 10 月",
    items: [
      {
        dateLabel: "10/12",
        title: "用 Tailwind CSS 复刻一套设计系统",
        slug: "tailwind-design-system",
      },
      { dateLabel: "10/08", title: "我的博客被攻击了", slug: "blog-attacked" },
    ],
  },
  {
    yearMonth: "2026-09",
    label: "2026 年 9 月",
    items: [
      {
        dateLabel: "9/21",
        title: "从零实现一个极简虚拟滚动",
        slug: "minimal-virtual-scroll",
      },
      {
        dateLabel: "9/07",
        title: "《摄影构图学》——随笔",
        slug: "photography-composition",
      },
      {
        dateLabel: "9/07",
        title: "乐理基础 DLC02 · 调内和弦",
        slug: "music-theory-dlc02",
      },
    ],
  },
  {
    yearMonth: "2026-08",
    label: "2026 年 8 月",
    items: [
      {
        dateLabel: "8/26",
        title: "抽空做了个导航起始页",
        slug: "hexo-to-nextjs",
      },
    ],
  },
  {
    yearMonth: "2026-07",
    label: "2026 年 7 月",
    items: [
      {
        dateLabel: "7/29",
        title: "Agent 与大模型开发理论 · 第一部分",
        slug: "agent-theory-part1",
      },
      { dateLabel: "7/28", title: "漫展随记", slug: "comic-con-notes" },
      {
        dateLabel: "7/22",
        title: "人像拍摄前期策划方案",
        slug: "portrait-planning",
      },
      {
        dateLabel: "7/22",
        title: "分表如何保证丝滑？—— 从「纯新增」聊到大厂主流方案",
        slug: "sharding-smooth",
      },
    ],
  },
  {
    yearMonth: "2026-06",
    label: "2026 年 6 月",
    items: [
      {
        dateLabel: "6/18",
        title: "把博客从 Hexo 迁到了 Next.js",
        slug: "hexo-to-nextjs",
      },
      {
        dateLabel: "6/05",
        title: "乐理基础 DLC01 · 音程与和弦",
        slug: "music-theory-dlc01",
      },
    ],
  },
];

export const ALL_TAGS = [
  "编程",
  "前端",
  "后端",
  "数据库",
  "运维",
  "AI",
  "摄影",
  "音乐",
  "读书",
  "生活",
  "随笔",
  "性能",
  "CSS",
];

export const TAG_COUNTS: Record<string, number> = {
  编程: 4,
  前端: 9,
  后端: 7,
  数据库: 5,
  运维: 3,
  AI: 8,
  摄影: 12,
  音乐: 6,
  读书: 4,
  生活: 11,
  随笔: 7,
  性能: 3,
  CSS: 5,
};

/* ==========================================================================
   相册数据
   ========================================================================== */

export type Album = {
  id: string;
  title: string;
  date: string;
  desc: string;
  count: number;
  cover: string;
};

export const ALBUMS: Album[] = [
  {
    id: "autumn-city",
    title: "秋日城市",
    date: "2026 年 10 月",
    desc: "十月的城市，风把银杏吹成金色。骑车绕了半个城区，只为了在太阳落山前赶到那条种满梧桐的路。",
    count: 24,
    cover: "https://picsum.photos/seed/mori-album-01/1200/750",
  },
  {
    id: "comic-con",
    title: "漫展现场",
    date: "2026 年 7 月",
    desc: "灯光、人潮，和一些来不及打完招呼的相遇。一天两万步，电池耗掉三块，值得。",
    count: 38,
    cover: "https://picsum.photos/seed/mori-album-02/1200/750",
  },
  {
    id: "portrait",
    title: "人像练习",
    date: "2026 年 7 月",
    desc: "练习用光，也练习怎么让人放松下来。最好的那张，通常是对方快要不耐烦之前的一秒。",
    count: 16,
    cover: "https://picsum.photos/seed/mori-album-03/1200/750",
  },
  {
    id: "mountain",
    title: "山与云",
    date: "2026 年 6 月",
    desc: "爬到一半就开始后悔，登顶之后又开始庆幸。云在半山腰上来回走，比谁都清闲。",
    count: 31,
    cover: "https://picsum.photos/seed/mori-album-04/1200/750",
  },
];

const PHOTO_RATIOS: [number, number][] = [
  [800, 1100],
  [800, 800],
  [800, 1000],
  [800, 900],
  [800, 1150],
  [800, 850],
  [800, 1050],
  [800, 780],
];

const CAPTION_POOL = [
  "晨雾",
  "窗口",
  "午后",
  "街角",
  "天台",
  "逆光",
  "雨后",
  "夜灯",
  "归途",
  "檐下",
  "空椅子",
  "影子",
  "慢门",
  "长焦",
  "手持",
  "扫街",
  "站台",
  "巷口",
  "白墙",
  "涟漪",
];

export type Photo = {
  thumb: string;
  full: string;
  caption: string;
};

export function buildPhotos(album: Album): Photo[] {
  const photos: Photo[] = [];
  for (let i = 0; i < album.count; i++) {
    const r = PHOTO_RATIOS[i % PHOTO_RATIOS.length];
    const seed = album.id + "-" + (i + 1);
    const fullW = 1600;
    photos.push({
      thumb: `https://picsum.photos/seed/${seed}/${r[0]}/${r[1]}`,
      full: `https://picsum.photos/seed/${seed}/${fullW}/${Math.round((fullW * r[1]) / r[0])}`,
      caption: CAPTION_POOL[i % CAPTION_POOL.length],
    });
  }
  return photos;
}

export function getAlbum(id: string): Album | null {
  return ALBUMS.find((a) => a.id === id) ?? null;
}

/* 精选照片（相册页瀑布流） */
export const FEATURED_PHOTOS: Photo[] = [
  {
    thumb: "https://picsum.photos/seed/mori-p1/800/1100",
    full: "https://picsum.photos/seed/mori-p1/1600/2200",
    caption: "晨雾",
  },
  {
    thumb: "https://picsum.photos/seed/mori-p2/800/800",
    full: "https://picsum.photos/seed/mori-p2/1600/1600",
    caption: "窗口",
  },
  {
    thumb: "https://picsum.photos/seed/mori-p3/800/1000",
    full: "https://picsum.photos/seed/mori-p3/1600/2000",
    caption: "午后",
  },
  {
    thumb: "https://picsum.photos/seed/mori-p4/800/900",
    full: "https://picsum.photos/seed/mori-p4/1600/1800",
    caption: "街角",
  },
  {
    thumb: "https://picsum.photos/seed/mori-p5/800/1150",
    full: "https://picsum.photos/seed/mori-p5/1600/2300",
    caption: "天台",
  },
  {
    thumb: "https://picsum.photos/seed/mori-p6/800/850",
    full: "https://picsum.photos/seed/mori-p6/1600/1700",
    caption: "逆光",
  },
  {
    thumb: "https://picsum.photos/seed/mori-p7/800/1050",
    full: "https://picsum.photos/seed/mori-p7/1600/2100",
    caption: "雨后",
  },
  {
    thumb: "https://picsum.photos/seed/mori-p8/800/780",
    full: "https://picsum.photos/seed/mori-p8/1600/1560",
    caption: "夜灯",
  },
];

/* ==========================================================================
   动态数据（朋友圈式）
   ========================================================================== */

export type Moment = {
  id: string;
  category: string;
  date: string;
  text: string;
  likes: number;
  photos?: Photo[];
};

export const MOMENTS: Moment[] = [
  {
    id: "m1",
    category: "总结",
    date: "2026-10-13 11:41",
    text: "昨天天气 Cool 到了，其实之前就筹备一个多月了，感觉业余时间没有那么多。三心二意的，也学不好，但是这一套带着音响 1k，每天接着玩玩，到时间吃饭就吃饭吧。其实是最近又回去刷了几遍孤独特训（少女乐队 Espoir 一样 - 人不凌）——配信记到 65，手头这款也够用了。",
    likes: 0,
    photos: [
      {
        thumb: "https://picsum.photos/seed/mori-m1/400/400",
        full: "https://picsum.photos/seed/mori-m1/1200/1200",
        caption: "随手拍",
      },
      {
        thumb: "https://picsum.photos/seed/mori-m2/400/400",
        full: "https://picsum.photos/seed/mori-m2/1200/1200",
        caption: "街角",
      },
      {
        thumb: "https://picsum.photos/seed/mori-m3/400/400",
        full: "https://picsum.photos/seed/mori-m3/1200/1200",
        caption: "午后",
      },
    ],
  },
  {
    id: "m2",
    category: "日常",
    date: "2026-10-02 20:21",
    text: "日常，国庆没有出去旅游，全是人。和朋友聚了聚玩了玩，结束了 7 天假期。",
    likes: 3,
  },
  {
    id: "m3",
    category: "摄影",
    date: "2026-09-30 17:12",
    text: "下午的光从窗帘缝里漏进来，正好落在桌角那本没翻开过的书上。拍下来了，当作今天的封面。",
    likes: 5,
    photos: [
      {
        thumb: "https://picsum.photos/seed/mori-m4/800/500",
        full: "https://picsum.photos/seed/mori-m4/1600/1000",
        caption: "窗帘与光",
      },
    ],
  },
  {
    id: "m4",
    category: "总结",
    date: "2026-09-28 23:08",
    text: "昨晚被 CC 攻击折腾到天亮。写完了复盘文章，但总觉得自己还是漏了什么——大概是漏了「下次一定要把告警阈值调好」这件事本身。",
    likes: 2,
  },
  {
    id: "m5",
    category: "音乐",
    date: "2026-09-26 20:31",
    text: "练了两个小时《钟》，右手还是会在第 42 小节打滑。决定先放两天，回来再弹可能就顺了。有些卡顿不是练得不够，是太想一下子练好。",
    likes: 1,
    photos: [
      {
        thumb: "https://picsum.photos/seed/mori-m5/500/375",
        full: "https://picsum.photos/seed/mori-m5/1200/900",
        caption: "琴房",
      },
      {
        thumb: "https://picsum.photos/seed/mori-m6/500/375",
        full: "https://picsum.photos/seed/mori-m6/1200/900",
        caption: "谱子",
      },
      {
        thumb: "https://picsum.photos/seed/mori-m7/500/375",
        full: "https://picsum.photos/seed/mori-m7/1200/900",
        caption: "夜",
      },
      {
        thumb: "https://picsum.photos/seed/mori-m8/500/375",
        full: "https://picsum.photos/seed/mori-m8/1200/900",
        caption: "台灯",
      },
    ],
  },
  {
    id: "m6",
    category: "读书",
    date: "2026-09-24 14:26",
    text: "读完《摄影构图学》第三章。作者说「构图是把混乱的世界整理成一句话」，这句话我记了很久。写代码其实也一样。",
    likes: 4,
  },
];

/* 动态页时间轴（按日分组） */
export const MOMENT_TIMELINE = [
  { date: "10月13日", count: 1 },
  { date: "10月2日", count: 1 },
  { date: "9月14日", count: 1 },
  { date: "8月30日", count: 1 },
  { date: "8月16日", count: 2 },
  { date: "7月31日", count: 1 },
  { date: "7月19日", count: 1 },
];

/* 站点统计 */
export const STATS = {
  articles: 72,
  moments: 148,
  albums: 4,
  tags: 26,
};

/* ==========================================================================
   评论数据层
   --------------------------------------------------------------------------
   · 类型定义
   · 确定性种子数据生成（同一 contentId 永远生成同一批评论，可精确控制总量）
   · 本地持久化（用户新增 / 点赞 / 删除 只存增量 diff，不存全量）
   · 排序、时间与数字格式化
   换真实后端：只需要替换 loadComments / saveOverrides 两个出口即可。
   ========================================================================== */

export type CommentAuthor = {
  name: string;
  avatar: string;
  /** 勋章：作者 / 铁粉 */
  badge?: string;
  /** 是否为博主本人 */
  isOwner?: boolean;
};

export type Comment = {
  id: string;
  /** 顶层评论为 null */
  parentId: string | null;
  /** 所属顶层评论 id（顶层评论自身） */
  rootId: string;
  author: CommentAuthor;
  content: string;
  createdAt: number;
  likes: number;
  liked: boolean;
  /** 回复某人时展示「回复 @昵称」 */
  replyToName?: string;
  /** IP 属地（抖音风格） */
  location?: string;
  /** 顶层评论热度分，仅顶层有值 */
  hot?: number;
  /** 本机新增的评论（置顶展示，可删除） */
  mine?: boolean;
};

export type SortMode = "hot" | "new";

/* --------------------------------------------------------------------------
   种子配置
   -------------------------------------------------------------------------- */

export type SeedConfig = {
  /** 该内容下的评论总数（顶层 + 子评论，精确值） */
  total: number;
  /** 顶层评论条数 */
  roots: number;
  /** 出现「火爆长贴」的概率 */
  hotChance: number;
  /** 火爆长贴的回复数上限 */
  hotMax: number;
  /** 普通评论回复数均值（指数分布参数） */
  k: number;
};

/** 文章详情页：1 万条评论 */
export const SEED_PRESETS: Record<string, SeedConfig> = {
  article: { total: 10000, roots: 1200, hotChance: 0.02, hotMax: 320, k: 4 },
  moment: { total: 480, roots: 80, hotChance: 0.03, hotMax: 60, k: 4 },
  small: { total: 120, roots: 24, hotChance: 0, hotMax: 0, k: 3 },
};

export function isSeedPreset(name: string): name is keyof typeof SEED_PRESETS {
  return name in SEED_PRESETS;
}

/** 动态页：按动态 id 生成 180 ~ 880 条不等的评论量，避免每条动态都一样 */
export function makeMomentConfig(contentId: string): SeedConfig {
  const rnd = mulberry32(hash32(contentId + "#size"));
  const total = 180 + Math.floor(rnd() * 700);
  return {
    total,
    roots: Math.max(14, Math.round(total / 6.2)),
    hotChance: 0.04,
    hotMax: 60,
    k: 4,
  };
}

/** 折叠状态下无需生成数据即可得到的总数 */
export function estimateTotal(cfg: SeedConfig): number {
  return cfg.total;
}

/* --------------------------------------------------------------------------
   确定性随机
   -------------------------------------------------------------------------- */

function hash32(str: string): number {
  let h = 2166136261 ^ 0x9e3779b9;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32：32 位确定性伪随机 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* --------------------------------------------------------------------------
   语料池
   -------------------------------------------------------------------------- */

const OWNER: CommentAuthor = {
  name: "森屿",
  avatar: "https://picsum.photos/seed/mori-avatar/80/80",
  isOwner: true,
  badge: "作者",
};

const SURNAME = [
  "林", "陈", "苏", "周", "许", "沈", "顾", "江", "黎", "温",
  "叶", "罗", "韩", "秦", "莫", "宋", "唐", "方", "白", "程",
];

const GIVEN = [
  "一鸣", "小满", "砚池", "南乔", "知遇", "晚舟", "未眠", "小鹿", "阿澈", "三土",
  "子期", "拾光", "北岛", "青白", "斯年", "见山", "听风", "半夏", "屿澄", "书棠",
  "半亩", "一勺", "木白", "云屿", "清和", "有光", "浮生", "长夏",
];

const HANDLES = [
  "code_walker", "pixel_lin", "mo_shutter", "kite_dev", "nullpointer",
  "slow_lens", "drf_zhou", "vue_lover", "night_build", "paperplane",
  "redis_fan", "aperture_f2", "rust_lite", "tiny_house", "cold_brew",
];

const LOCATIONS = [
  "广东", "浙江", "上海", "北京", "四川", "湖南", "江苏", "福建",
  "山东", "湖北", "陕西", "辽宁", "重庆", "安徽", "海外",
];

const AVATAR_POOL: string[] = Array.from(
  { length: 48 },
  (_, i) => `https://picsum.photos/seed/mori-u${i + 1}/80/80`,
);

/** 顶层评论核心句 */
const CORE = [
  "这篇把我最近卡了三天的性能问题讲透了，虚拟滚动那段我照着实现了一遍",
  "构图那段说得对，三分法是起点不是终点，真正难的是把视线请进来",
  "摄影和写代码其实是一件事，都是在做减法",
  "乐理那章什么时候更新第三部分，蹲一个调内和弦的进阶",
  "凌晨三点起来修线上问题的人，看完直接破防",
  "判断性质再动手这句应该刻在每个人工位上",
  "边缘先拦再考虑源站加固，这个顺序我踩过坑，确实是血泪教训",
  "看到「他想让我死在哪里」这行字笑出声，然后又沉默了",
  "连接池加护栏这招我明天就去加，谢谢现成的清单",
  "分表那篇的凌晨两点慢查询太真实了，我也在那个时候改过分片键",
  "这套设计系统最舒服的地方是变量收敛，改一处全站换肤",
  "很久没看到把技术过程和情绪都写清楚的博客了",
  "窗帘缝里的那束光拍得真好，构图干净",
  "练琴那段我懂，卡顿有时候不是练得不够，是太想练好",
  "一天两万步电池三块，回来还修图到凌晨，热爱是真的热爱",
  "从 Hexo 迁过来值不值，我最近也在纠结",
  "建议再补一节讲一下测量和回填，虚拟滚动的坑基本都在那儿",
  "整篇读下来像听人讲故事，比教程好看多了",
  "顺手把 Cache-Control 那个头抄走了，正好在调",
  "山与云那组照片的色调很稳，请问是什么镜头",
  "这个网站的排版太舒服了，字体和间距都很讲究",
  "读完去翻了下作者的其他文章，质量很稳定",
  "把监控盲区补上这段最容易被忽略，但往往是最关键的一环",
  "希望多写一点这类复盘，比成功案例有用",
  "收藏了，等下次值班的时候照着走一遍",
  "这个博客的速度是真快，秒开",
  "问题来了，按路径维度算同比增幅，低峰期会不会误报",
  "认真读完，比很多付费专栏写得实在",
  "做减法这句我要贴在显示器上",
  "人像前期策划那段，能出一份完整的表格模板吗",
  "这是我看过最不装的技术博客，说人话",
  "有个细节想确认：缓存和动态路由同时开会不会互相打架",
  "摄影那组片子有胶片味，好奇后期流程",
  "音乐和代码放在一起竟然不违和",
  "想问下这套设计系统有开源吗，想直接搬",
  "凌晨的告警永远比闹钟准时",
  "把复盘沉淀成清单这个习惯太重要了",
  "当年我也被封 IP 误伤过正常用户，看完想哭",
  "文字有温度，图也有，这个博客我愿意常来",
  "每次看到这种把踩坑过程写全的文章都想点个赞",
];

const CORE_PREFIX = [
  "", "", "", "", "",
  "说实话，", "有一说一，", "不懂就问，", "作为一个同行，",
  "半夜刷到，", "考古发现，", "路过，", "补充一点：", "说个题外话，",
];

const CORE_SUFFIX = [
  "。", "。", "，学到了。", "，感谢分享。", "，先码住。",
  "，回头试试。", "，等你的下一篇。", "，蹲个后续。", "！", "，已三连。",
];

/** 子评论语料 */
const REPLY = [
  "同感，我也这么觉得",
  "楼主回复得好认真，赞一个",
  "这个思路可以，我回去试试",
  "确实，我上次也是卡在这里",
  "哈哈哈这段太真实了",
  "兄弟你这句话说到我心里了",
  "请问有具体的代码示例吗",
  "我踩过一模一样的坑，浪费了一整天",
  "收藏了，回头照着改",
  "感谢解答，一下就通了",
  "刚试了一下，确实有效",
  "这个结论我要验证一下，感觉还分场景",
  "+1，我们线上也是这么处理的",
  "看起来是版本差异导致的，我是 16 上没问题",
  "有没有可能用另一种方案更省事",
  "讲得比文档清楚多了",
  "笑死，这不就是我上周的日志吗",
  "学到了，感谢",
  "博主脾气真好，一条条回",
  "请问这个在移动端表现怎么样",
  "我关注这个细节很久了，终于有人写",
  "这个点其实还可以再深挖一下",
  "照抄了，谢谢老板",
  "感觉像是给未来的自己写的一封信",
  "这套东西我用了半年，稳定",
  "我这边实测效果比想象中好",
  "突然想去看你拍的照片了",
  "顶一下，希望更多人看到",
  "别的不说，这个排版我先抄了",
  "这个问题在低版本上会报错，注意一下",
  "我记得之前有篇文章讲过类似的，可以对照看",
  "看完默默打开了自己的工程",
  "你写的东西总是让人想动手试试",
  "我们团队昨天刚讨论到这块",
  "能不能出一期视频版本",
  "确实，量化之后心里就有底了",
  "每次翻评论都能学到新东西",
  "楼上说得对，先定位再动手",
  "这类文章越少越好，都去写营销文了",
  "感谢，省了我半天时间",
  "这个结论有点反直觉，但确实成立",
  "写得真克制，没有一句废话",
  "把这段分享给了同事，他也在查这个问题",
  "一起蹲更新",
  "看完之后我去把自己的告警规则改了一遍",
  "辛苦了，凌晨还在排障",
  "有被安慰到",
  "收藏夹里又多了一篇要反复看的",
  "这个比喻很贴切，一看就懂",
  "笑，我也干过把连接池拖垮这种事",
];

/* --------------------------------------------------------------------------
   生成器
   -------------------------------------------------------------------------- */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const HOT_MIN = 60;
const NORMAL_CAP = 40;

function pick<T>(rnd: () => number, arr: T[]): T {
  return arr[Math.floor(rnd() * arr.length)];
}

function pickAuthor(rnd: () => number): CommentAuthor {
  const r = rnd();
  const avatar = pick(rnd, AVATAR_POOL);
  if (r < 0.02) return OWNER;
  if (r < 0.08) {
    return {
      name: pick(rnd, HANDLES) + (rnd() < 0.4 ? String(Math.floor(rnd() * 90) + 10) : ""),
      avatar,
    };
  }
  if (r < 0.22) {
    return { name: "网友" + (Math.floor(rnd() * 8_000_000) + 1000000), avatar };
  }
  const name = pick(rnd, SURNAME) + pick(rnd, GIVEN);
  const fan = rnd() < 0.06;
  return { name, avatar, badge: fan ? "铁粉" : undefined };
}

/** 顶层评论文本：前缀 × 核心句 × 后缀，长尾拼出长文本 */
function buildRootContent(rnd: () => number): string {
  let text = pick(rnd, CORE_PREFIX) + pick(rnd, CORE);
  // 约 12% 长评：再拼一到两句，用于验证变高行渲染
  if (rnd() < 0.12) {
    text += "。" + pick(rnd, CORE) + "。" + pick(rnd, CORE);
  }
  return text + pick(rnd, CORE_SUFFIX);
}

function buildReplyContent(rnd: () => number, withAt: boolean, atName?: string): string {
  const body = pick(rnd, REPLY);
  return withAt && atName ? `@${atName} ${body}` : body;
}

/**
 * 生成评论种子。
 * 返回扁平结构：顶层评论 parentId 为 null，其余挂在对应 rootId 下。
 * 总量严格等于 cfg.total，因此折叠态的计数与展开后一致。
 */
export function generateComments(contentId: string, cfg: SeedConfig): Comment[] {
  const rnd = mulberry32(hash32(contentId) ^ (cfg.total * 2654435761));
  const roots = cfg.roots;
  const budget = Math.max(0, cfg.total - roots);

  /* 1. 先抽每条的回复数 */
  const counts = new Array<number>(roots);
  let sum = 0;
  for (let i = 0; i < roots; i++) {
    let c: number;
    if (cfg.hotMax > HOT_MIN && rnd() < cfg.hotChance) {
      c = HOT_MIN + Math.floor(rnd() * (cfg.hotMax - HOT_MIN));
    } else {
      c = Math.min(NORMAL_CAP, Math.round(-Math.log(1 - rnd()) * cfg.k));
    }
    counts[i] = c;
    sum += c;
  }

  /* 2. 校准到精确总量 */
  let diff = sum - budget;
  let guard = 0;
  while (diff > 0 && guard++ < 400000) {
    const i = Math.floor(rnd() * roots);
    if (counts[i] > 0) {
      counts[i]--;
      diff--;
    }
  }
  guard = 0;
  while (diff < 0 && guard++ < 400000) {
    const i = Math.floor(rnd() * roots);
    const cap = counts[i] >= HOT_MIN ? cfg.hotMax : NORMAL_CAP;
    if (counts[i] < cap) {
      counts[i]++;
      diff++;
    }
  }

  /* 3. 落数据 */
  const now = Date.now();
  const out: Comment[] = [];

  for (let i = 0; i < roots; i++) {
    const author = pickAuthor(rnd);
    // 越靠近现在越密
    const age = Math.floor(Math.pow(rnd(), 2.1) * 150 * DAY);
    const createdAt = now - age - 60_000;
    const rootId = `c${i}`;
    const likeBase = Math.round(Math.pow(rnd(), 3.2) * 2400);

    const root: Comment = {
      id: rootId,
      parentId: null,
      rootId,
      author,
      content: buildRootContent(rnd),
      createdAt,
      likes: likeBase,
      liked: false,
      location: rnd() < 0.72 ? pick(rnd, LOCATIONS) : undefined,
    };
    out.push(root);

    let t = createdAt;
    let lastReplyAuthor = author.name;
    for (let j = 0; j < counts[i]; j++) {
      t = Math.min(now - 30_000, t + 60_000 + Math.floor(rnd() * 9 * HOUR));
      const rAuthor = pickAuthor(rnd);
      const withAt = j > 0 && rnd() < 0.42;
      const id = `${rootId}-r${j}`;
      out.push({
        id,
        parentId: rootId,
        rootId,
        author: rAuthor,
        content: buildReplyContent(rnd, withAt, lastReplyAuthor),
        createdAt: t,
        likes: Math.round(Math.pow(rnd(), 4) * 180),
        liked: false,
        replyToName: withAt ? lastReplyAuthor : undefined,
        location: rnd() < 0.5 ? pick(rnd, LOCATIONS) : undefined,
      });
      lastReplyAuthor = rAuthor.name;
    }

    // 热度：点赞 + 回复量 + 新鲜度
    const fresh = Math.max(0, 1 - age / (150 * DAY));
    root.hot = root.likes * 2 + counts[i] * 3 + fresh * 400;
  }

  return out;
}

/* --------------------------------------------------------------------------
   本地持久化（增量 diff）
   -------------------------------------------------------------------------- */

export type CommentOverrides = {
  added: Comment[];
  removed: string[];
  likes: string[];
};

const EMPTY: CommentOverrides = { added: [], removed: [], likes: [] };
const KEY_PREFIX = "mori-cmt-v1:";

function readOverrides(contentId: string): CommentOverrides {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + contentId);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<CommentOverrides>;
    return {
      added: Array.isArray(parsed.added) ? parsed.added : [],
      removed: Array.isArray(parsed.removed) ? parsed.removed : [],
      likes: Array.isArray(parsed.likes) ? parsed.likes : [],
    };
  } catch {
    return EMPTY;
  }
}

function writeOverrides(contentId: string, o: CommentOverrides): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY_PREFIX + contentId, JSON.stringify(o));
  } catch {
    /* 配额或隐私模式，忽略 */
  }
}

export type CommentStore = {
  /** 拉取种子并合并本地增量，同时把增量原样带出，避免二次写入时丢失 */
  load: (
    contentId: string,
    cfg: SeedConfig,
  ) => { comments: Comment[]; overrides: CommentOverrides };
  save: (contentId: string, o: CommentOverrides) => void;
};

export const localCommentStore: CommentStore = {
  load(contentId, cfg) {
    const seed = generateComments(contentId, cfg);
    const o = readOverrides(contentId);
    if (!o.removed.length && !o.likes.length && !o.added.length) {
      return { comments: seed, overrides: { added: [], removed: [], likes: [] } };
    }

    const removed = new Set(o.removed);
    const liked = new Set(o.likes);
    const merged: Comment[] = [];
    for (const c of seed) {
      if (removed.has(c.id) || (c.parentId && removed.has(c.parentId))) continue;
      merged.push(liked.has(c.id) ? { ...c, liked: true, likes: c.likes + 1 } : c);
    }
    for (const c of o.added) {
      if (removed.has(c.id) || (c.parentId && removed.has(c.parentId))) continue;
      merged.push(liked.has(c.id) ? { ...c, liked: true, likes: c.likes + 1 } : c);
    }
    return { comments: merged, overrides: o };
  },
  save(contentId, o) {
    writeOverrides(contentId, o);
  },
};

/* --------------------------------------------------------------------------
   用户身份（本地昵称 + 邮箱）
   -------------------------------------------------------------------------- */

const USER_KEY = "DAVAID_BLOG_USER";
const EMAIL_KEY = "DAVAID_BLOG_EMAIL";

export type UserIdentity = { name: string; email: string };

export function loadUserName(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(USER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveUserName(name: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(USER_KEY, name);
  } catch {
    /* ignore */
  }
}

export function loadUserEmail(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveUserEmail(email: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(EMAIL_KEY, email);
  } catch {
    /* ignore */
  }
}

/** 邮箱格式校验（宽松但能挡住明显错误：无 @、无域名点、含空格） */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email.trim());
}

/* --------------------------------------------------------------------------
   图形验证码
   --------------------------------------------------------------------------
   · 4 位字符，剔除易混字符（0/O、1/I/L 等）
   · 答案只存内存，不进 DOM；重开组件即失效
   -------------------------------------------------------------------------- */

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXY23456789";
const CODE_LEN = 4;
export const CODE_ALPHABET = CODE_CHARS;

export function createCaptchaCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LEN; i += 1) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return out;
}

/** 校验时忽略大小写与首尾空格 */
export function checkCaptcha(input: string, code: string): boolean {
  return input.trim().toUpperCase() === code.toUpperCase();
}

let uidSeq = 0;

export function createCommentId(): string {
  uidSeq += 1;
  return `u${Date.now().toString(36)}${uidSeq.toString(36)}${Math.floor(
    Math.random() * 1296,
  ).toString(36)}`;
}

/* --------------------------------------------------------------------------
   排序与格式化
   -------------------------------------------------------------------------- */

/** 顶层评论排序：新评论置顶，其余按模式排 */
export function compareRoot(a: Comment, b: Comment, mode: SortMode): number {
  if (mode === "new") return b.createdAt - a.createdAt;
  return (b.hot ?? 0) - (a.hot ?? 0) || b.createdAt - a.createdAt;
}

export function formatCount(n: number): string {
  if (n < 10_000) return String(n);
  const w = n / 10_000;
  return `${w >= 100 ? Math.round(w) : w.toFixed(1).replace(/\.0$/, "")}万`;
}

export function formatTime(ts: number, now: number = Date.now()): string {
  const d = now - ts;
  if (d < 60_000) return "刚刚";
  if (d < HOUR) return `${Math.floor(d / 60_000)}分钟前`;
  if (d < DAY) return `${Math.floor(d / HOUR)}小时前`;
  if (d < 7 * DAY) return `${Math.floor(d / DAY)}天前`;
  const dt = new Date(ts);
  if (dt.getFullYear() === new Date(now).getFullYear()) {
    return `${dt.getMonth() + 1}月${dt.getDate()}日`;
  }
  return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日`;
}

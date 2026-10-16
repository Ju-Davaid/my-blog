"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createCaptchaCode } from "@/lib/comments";
import { Icon } from "@/components/ui";

/* ==========================================================================
   图形验证码
   --------------------------------------------------------------------------
   · 用 canvas 绘制 4 位字符（随机倾斜 / 颜色 / 干扰线 / 噪点），避免纯文本被脚本直接读走
   · 答案通过 onChange 交给表单校验；点击图片或右侧按钮可刷新
   · 生成逻辑放在 effect 内（画布本身也是副作用），组件交给父级用 key 重挂载，
     刷新统一走 refreshKey 递增
   ========================================================================== */

type CaptchaProps = {
  /** 每次生成新验证码时回调，表单据此校验 */
  onChange: (code: string) => void;
  /** 父组件递增该值即可换一张 */
  refreshKey?: number;
  /** 有错误时描红 */
  error?: string;
  compact?: boolean;
};

const W = 108;
const H = 38;

function drawCaptcha(canvas: HTMLCanvasElement, text: string, compact: boolean) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 底色：跟随主题卡片色，深浅模式都不会突兀
  const bg =
    getComputedStyle(canvas).getPropertyValue("--card").trim() || "#ffffff";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 干扰线
  for (let i = 0; i < 4; i += 1) {
    ctx.strokeStyle = `hsl(${Math.random() * 360} 62% 62% / 0.5)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.random() * W, Math.random() * H);
    ctx.quadraticCurveTo(
      Math.random() * W,
      Math.random() * H,
      Math.random() * W,
      Math.random() * H,
    );
    ctx.stroke();
  }

  // 噪点
  for (let i = 0; i < 26; i += 1) {
    ctx.fillStyle = `hsl(${Math.random() * 360} 55% 55% / 0.55)`;
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 字符
  const step = W / (text.length + 0.6);
  text.split("").forEach((ch, i) => {
    ctx.save();
    ctx.translate(step * (i + 0.8), H / 2);
    ctx.rotate(((Math.random() * 34 - 17) * Math.PI) / 180);
    ctx.font = `bold ${compact ? 20 : 22}px "Menlo", "Consolas", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `hsl(${Math.random() * 360} 68% 38%)`;
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
}

export default function Captcha({
  onChange,
  refreshKey = 0,
  error,
  compact = false,
}: CaptchaProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  /* 换图计数：变化即重新生成并向父级同步答案 */
  const [ticks, setTicks] = useState(0);

  const regenerate = useCallback(() => setTicks((n) => n + 1), []);

  /* 生成 + 绘制 + 同步答案：全部在 effect 内完成（外部系统 = canvas 与父级表单） */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const code = createCaptchaCode();
    drawCaptcha(canvas, code, compact);
    onChange(code);
    // refreshKey 变化 = 父级要求换一张；ticks 变化 = 用户点击换一张
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, ticks, compact]);

  return (
    <div className="flex items-center gap-2">
      <canvas
        ref={canvasRef}
        onClick={regenerate}
        title="看不清？点击换一张"
        aria-label="图形验证码，点击可更换"
        style={{ width: W, height: H }}
        className={`cursor-pointer rounded-md border bg-card ${
          error ? "border-destructive/70" : "border-border"
        }`}
      />
      <button
        type="button"
        onClick={regenerate}
        aria-label="换一张验证码"
        title="换一张"
        className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
      >
        <Icon name="refresh-cw" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

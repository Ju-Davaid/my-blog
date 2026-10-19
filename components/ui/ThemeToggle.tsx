"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";

const THEME_KEY = "mori-theme";

export type ThemePref = "light" | "dark" | "system";

/**
 * 解析用户偏好：根据系统主题或查询参数返回实际主题。
 * @param pref 用户偏好
 * @returns 实际主题
 */
function resolveTheme(pref: ThemePref): "light" | "dark" {
  if (pref === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return pref;
}

function readPref(): ThemePref {
  if (typeof window === "undefined") return "system";
  const fromQuery = new URLSearchParams(window.location.search).get("theme");
  if (fromQuery === "light" || fromQuery === "dark" || fromQuery === "system") {
    return fromQuery;
  }
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function applyTheme(pref: ThemePref) {
  const resolved = resolveTheme(pref);
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
  localStorage.setItem(THEME_KEY, pref);
}

const ORDER: ThemePref[] = ["light", "dark", "system"];

/**
 * 主题切换按钮：light → dark → system 三态循环。
 * 依赖根布局中的防闪烁脚本确保首帧正确。
 */
export default function ThemeToggle() {
  const [pref, setPref] = useState<ThemePref>("system");

  useEffect(() => {
    setPref(readPref());
    // 跟随系统时，监听系统主题变化
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readPref() === "system") applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const cycle = () => {
    const idx = ORDER.indexOf(pref);
    const next = ORDER[(idx + 1) % ORDER.length];
    applyTheme(next);
    setPref(next);
  };

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label="切换主题"
      title="切换主题：浅色 / 深色 / 跟随系统"
      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-primary"
    >
      {pref === "light" && <Icon name="sun" className="h-4 w-4" />}
      {pref === "dark" && <Icon name="moon" className="h-4 w-4" />}
      {pref === "system" && <Icon name="monitor" className="h-4 w-4" />}
    </button>
  );
}

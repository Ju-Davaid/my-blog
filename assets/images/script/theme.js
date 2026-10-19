/**
 * 主题防闪烁脚本：在首帧渲染前确定 light / dark / system 并写入 <html>。
 * 导出为字符串，由 layout.tsx 通过 <script dangerouslySetInnerHTML> 在浏览器端注入执行。
 */
const themeInitScript = `(function () {
  try {
    var p =
      new URLSearchParams(location.search).get("theme") ||
      localStorage.getItem("mori-theme") ||
      "system";
    var d =
      p === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : p;
    var el = document.documentElement;
    el.classList.remove("light", "dark");
    el.classList.add(d);
    el.style.colorScheme = d;
  } catch (e) {}
})();`;

export default themeInitScript;

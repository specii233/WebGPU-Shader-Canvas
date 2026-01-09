# WebGPU-Shader-Canvas
A simple canvas effect with WebGPU shader

&gt; 最小可运行 **WebGPU** 示例 —— 无打包器，裸跑 `index.html`，浏览器里直接画色块，完整走完 **device → pipeline → draw** 全程。

---

## 一、在线试玩（零安装）
[https://specii233.github.io/WebGPU-Shader-Canvas/](https://specii233.github.io/WebGPU-Shader-Canvas/)  
（Chrome 123+ / Edge 116+ / Firefox Nightly 已测）

---

## 二、一键本地跑
```bash
git clone https://github.com/specii233/WebGPU-Shader-Canvas.git
cd WebGPU-Shader-Canvas
# 任意静态文件工具
npx serve .      # python -m http.server 8000 也行

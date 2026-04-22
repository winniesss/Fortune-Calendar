# 🌿 运势日历 Fortune Calendar

> 一款基于传统八字与二十四节气的每日运势 PWA 台历

## ✨ 功能特色

- 📅 每日运势评分（60-99分）
- 🌱 二十四节气自动切换，配套植物插画
- ☯️ 天干地支、生肖年份展示
- 📋 每日宜忌指引
- 📱 PWA 支持，可添加到 iPad / iPhone 主屏幕
- 🎨 节气主题色动态切换

## 🚀 快速开始

```bash
npm install
npm run dev
```

## 📦 部署

推送到 `main` 分支后，GitHub Actions 自动构建并部署到 GitHub Pages。

**部署地址：** https://winniesss.github.io/Fortune-Calendar/

### 首次部署设置

1. 进入 repo Settings → Pages → Source → 选择 **GitHub Actions**
2. 推送代码，等待 Actions 完成

## 🖼️ 插画准备

24 张节气插画放在 `public/illustrations/` 目录，文件名对应节气英文 key：

`xiaohan.png`, `dahan.png`, `lichun.png`, `yushui.png`, `jingzhe.png`, `chunfen.png`,
`qingming.png`, `guyu.png`, `lixia.png`, `xiaoman.png`, `mangzhong.png`, `xiazhi.png`,
`xiaoshu.png`, `dashu.png`, `liqiu.png`, `chushu.png`, `bailu.png`, `qiufen.png`,
`hanlu.png`, `shuangjiang.png`, `lidong.png`, `xiaoxue.png`, `daxue.png`, `dongzhi.png`

可以用 `scripts/generate-illustrations.mjs` 调用 DALL-E API 批量生成，
或参考 `scripts/solar-term-prompt.md` 的 prompt 在 ChatGPT 中手动生成。

## 🗂️ 项目结构

```
Fortune-Calendar/
├── .github/workflows/deploy.yml   # 自动部署
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── icon-192.png / icon-512.png
│   └── illustrations/             # 24 张节气 PNG
├── src/
│   ├── main.jsx
│   └── DeskCalendar.jsx           # 核心组件
├── index.html
├── vite.config.js
└── package.json
```

## 📱 iPad 添加到主屏幕

1. Safari 打开 https://winniesss.github.io/Fortune-Calendar/
2. 点击底部分享按钮 → 添加到主屏幕
3. 即可作为独立 App 使用

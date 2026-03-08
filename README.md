# OpenClaw 桌面助手

基于 Electron 的 OpenClaw 安装与配置桌面应用，支持 Windows 和 macOS。面向中国大陆用户，默认 Minimax，推荐 DeepSeek，飞书配置优先。

## 功能特性

- 一键安装 OpenClaw
- 环境检测（Node.js、OpenClaw）
- 配置向导：Minimax（默认）/ DeepSeek（推荐）
- 飞书集成优先配置
- 简体中文 / 英文双语
- 浅色（白蓝）/ 深色（黑蓝）主题
- 现代 UI 与动效

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build        # 当前平台
npm run build:win    # Windows
npm run build:mac    # macOS
```

## 技术栈

- Electron + React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- i18next

## 参考项目

- [ClawX](https://github.com/ValueCell-ai/ClawX) - OpenClaw 桌面 GUI

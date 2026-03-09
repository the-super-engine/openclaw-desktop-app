# 开放龙虾宝-桌面版 OpenClaw Desktop

面向中国大陆用户的 OpenClaw AI 智能体桌面应用。  
这份 README 同时作为「产品说明书」，按真实用户流程说明从安装到长期使用的完整步骤。

## 1. 产品简介

开放龙虾宝-桌面版（OpenClaw Desktop）是一个跨平台 Electron 客户端，提供统一的 AI 助手工作台：

- **Chat**：与 AI 对话、查看会话记录
- **Channels**：接入飞书、钉钉等渠道
- **Skills**：管理与扩展智能体能力
- **Cron**：配置定时任务
- **Settings**：管理模型、偏好与系统设置

核心特点：

- 默认可用 **MiniMax**，推荐 **DeepSeek**
- 优先支持中国大陆常见使用场景
- 支持中英双语与深浅主题
- 本地数据存储（`electron-store`），无需额外数据库

---

## 2. 用户使用流程（从安装到上线）

### 第 1 步：下载安装包

1. 打开仓库的 **Releases** 页面。
2. 根据系统下载对应安装包：
   - **Windows**：`.exe`
   - **macOS**：`.dmg`
   - **Linux**：`.AppImage` / `.deb` / `.rpm`
3. 推荐优先选择文件名为 `openclaw-desktop-...` 的最新版本产物。

### 第 2 步：安装应用

- **Windows**：双击 `.exe` 安装，可选择安装目录。
- **macOS**：打开 `.dmg`，拖入 Applications。
- **Linux**：
  - Ubuntu/Debian：`sudo dpkg -i *.deb`
  - RHEL/CentOS/Fedora：`sudo rpm -ivh *.rpm`
  - 或直接给 AppImage 执行权限后运行。

### 第 3 步：首次启动

1. 启动应用后进入初始化流程。
2. 选择界面语言与主题（可在 Settings 里随时改）。
3. 确认本地工作目录与默认偏好。

### 第 4 步：配置 AI Provider（关键步骤）

1. 进入 **Settings > AI Providers**。
2. 至少配置 1 个可用模型提供商 API Key（例如 MiniMax 或 DeepSeek）。
3. 保存后返回 Chat 页面测试一条消息，确认响应正常。

> 未配置 API Key 时，界面可正常浏览，但无法进行真实模型对话。

### 第 5 步：开始日常使用

建议按以下顺序逐步启用功能：

1. **Chat**：先完成基础对话验证。
2. **Channels**：按需接入飞书/钉钉等外部渠道。
3. **Skills**：添加你需要的工具能力。
4. **Cron**：把高频操作变成定时任务。

这样可以先保证核心功能可用，再逐步扩展复杂能力。

### 第 6 步：升级与回滚

1. 定期关注 Releases 的新版本。
2. 升级前建议备份本地配置目录（见下方“数据与备份”）。
3. 若升级后不符合预期，可下载上一版本安装包回滚。

### 第 7 步：数据与备份建议

- 应用使用本地存储，不依赖外部数据库。
- 建议定期备份：
  - 应用配置目录
  - 关键渠道配置
  - 重要会话/自动化配置

---

## 3. 常见问题（FAQ）

### Q1：为什么打开后无法对话？
通常是未配置 AI Provider API Key。  
请到 `Settings > AI Providers` 检查是否已保存可用密钥。

### Q2：可以只当本地界面用吗？
可以。即使没有 Key，也可以浏览和配置大部分界面功能。

### Q3：是否需要先安装数据库？
不需要。默认使用本地文件存储。

---

## 4. 开发者指南（可选）

如果你是开发者，需要从源码运行：

```bash
pnpm install
pnpm run dev
```

构建安装包：

```bash
pnpm run package        # 当前平台
pnpm run package:win    # Windows
pnpm run package:mac    # macOS
pnpm run package:linux  # Linux
```

---

## 5. 致谢

本项目参考 [ClawX](https://github.com/ValueCell-ai/ClawX) 的架构与实现，感谢 ValueCell-ai 团队的开源贡献。

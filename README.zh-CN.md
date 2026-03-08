# 开放龙虾宝-桌面版

面向中国大陆用户的 OpenClaw AI 智能体图形界面。

## 特性

- **默认 Minimax**：MiniMax 国内版作为默认 AI 模型
- **推荐 DeepSeek**：DeepSeek 官方 API 作为推荐选项
- **飞书优先**：飞书、钉钉等国内渠道优先展示
- **中英双语**：默认简体中文，支持英文切换
- **白蓝/黑蓝主题**：企业风格配色

## 开发

```bash
pnpm install
pnpm run dev
```

## 打包

```bash
pnpm run package        # 当前平台
pnpm run package:mac    # macOS
pnpm run package:win    # Windows
pnpm run package:linux  # Linux
```

## 致谢

本项目参考 [ClawX](https://github.com/ValueCell-ai/ClawX) 开发，感谢 ValueCell-ai 团队。

# 🧭 找到你想做的事 — 交互式自我认知工具

基于《如何找到你想做的事》（八木仁平）一书，将书中方法论转化为交互式网站，帮助你用逻辑而非直觉找到真正想做的事。

## ✨ 功能

- **🧭 模块1：价值观（Why）** — 5步找到你的人生指南针
- **⚡ 模块2：才能（How）** — 发现你的无意识天赋
- **❤️ 模块3：热情（What）** — 探索真正好奇的领域
- **🔗 模块4：组合筛选** — What × How × Why 组合成想做的事
- **🤖 AI 辅助分析** — 输入自然语言，AI 自动提取关键词
- **👥 多用户支持** — 多人共用，数据独立隔离
- **📊 仪表盘** — 完整自我认知报告

## 🚀 快速开始

```bash
npm install
npm run dev
```

打开 http://localhost:3000

## 🔧 配置

在项目根目录创建 `.env` 文件：

```env
LLM_API_BASE=https://api.minimax.chat/v1
LLM_API_KEY=your_api_key_here
LLM_MODEL=minimax-text-01
```

支持任何 OpenAI 兼容格式的 API（DeepSeek、OpenAI、通义千问等）。

可选环境变量：

| 变量 | 说明 |
|------|------|
| `ALLOWED_ORIGINS` | 生产环境限制 API 调用来源，逗号分隔（如 `https://mydomain.com`）|

## 📦 部署

### 自托管

```bash
npm run build
npm start
```

推荐使用 PM2 管理进程：

```bash
npm install -g pm2
pm2 start npm --name "find-purpose" -- start
```

### 注意事项

- 用户数据存储在浏览器 localStorage，服务器不保存用户数据
- API Key 通过环境变量配置，不要提交到 Git

## 🗂 项目结构

```
src/
├── app/
│   ├── page.tsx              # 首页路线图
│   ├── layout.tsx            # 布局（侧边栏 + 用户管理）
│   ├── module1-4/            # 4个核心模块
│   ├── dashboard/            # 仪表盘
│   └── api/analyze/route.ts  # AI 代理接口
├── components/               # 可复用组件
├── store.ts                  # 答题数据状态
├── userStore.ts              # 用户管理
└── lib/ai.ts                 # AI API 封装
```

## 📄 其他文档

- [OPS.md](OPS.md) — 运维手册（服务器维护、更新、配置）

## 📖 参考

- 《如何找到你想做的事》八木仁平 著

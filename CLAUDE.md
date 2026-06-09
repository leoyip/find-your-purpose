# 项目开发规范

## 项目概述

基于《如何找到你想做的事》（八木仁平）的交互式自我认知工具。

## 文档体系

每次修改代码时，必须同步更新相关文档：

| 文档 | 用途 | 何时更新 |
|------|------|---------|
| `README.md` | 项目介绍给访客 | 新增功能、修改配置、变更部署方式时 |
| `ROADMAP.md` | 功能进度给用户 | 新增/完成/变更功能时 |
| `OPS.md` | 运维手册给管理员 | 修改部署流程、环境变量、端口配置时 |
| `CLAUDE.md` | 本文件—AI 开发规范 | 修改开发流程时 |

### 更新检查清单

每次提交前确认：

- [ ] ROADMAP.md 是否已更新？（新增功能 → 移到 ✅，新计划 → 加到 🔜）
- [ ] README.md 是否需更新？（新配置项、新功能说明）
- [ ] OPS.md 是否需更新？（部署方式、环境变量变更）
- [ ] 是否引入了新的敏感信息？（IP、API Key、路径 → 用占位符替代）
- [ ] `.githooks/pre-commit` 能否检测到新类型的敏感信息？

## 开发工作流

```bash
# 1. 开发
git checkout -b feat/功能名
# ...修改代码...

# 2. 更新文档
# 编辑 ROADMAP.md / README.md / OPS.md

# 3. 提交流程
git add -A                 # 会自动触发 pre-commit 安全检查
git commit -m "类型: 描述"  # 类型: feat/fix/docs/security/chore
git push                   # 推送后 GitHub Actions 自动扫描

# 4. 部署服务器
# ssh 到服务器 → git pull → npm run build → pm2 restart 0
```

### 提交信息规范

```
feat:     新功能
fix:      Bug 修复
docs:     文档变更
security: 安全加固
chore:    杂项（配置、依赖等）
```

## 安全规范

1. **绝不提交**真实 IP、API Key、密码、本地路径到 Git
2. 敏感信息一律用 `<占位符>` 替代（如 `<服务器IP>`、`sk-xxx`）
3. `.env` / `.env.local` 已在 `.gitignore` 中排除，不要手动修改
4. 提交前留意 `git status` 的输出，确认没有不该提交的文件
5. 如果历史中已存在敏感信息，用 `git filter-branch` 或 `git filter-repo` 清理

## 部署流程

```bash
# 服务器更新
ssh root@<服务器IP>
cd /path/to/find-your-purpose/site
git pull
npm run build
pm2 restart 0
```

## 用户数据

所有用户数据存储在浏览器 localStorage 中，服务器不保存用户数据。
API Key 通过环境变量或用户设置配置，切勿硬编码。

## 项目结构

```
src/
├── app/                     # 页面
│   ├── page.tsx             # 首页
│   ├── layout.tsx           # 布局
│   ├── module1-4/           # 4个核心模块
│   ├── dashboard/           # 仪表盘
│   ├── settings/            # AI 设置
│   └── api/analyze/         # AI 代理接口
├── components/              # 可复用组件
├── lib/                     # 工具库
├── store.ts                 # 答题数据
├── userStore.ts             # 用户管理
└── types.ts                 # 类型定义
```

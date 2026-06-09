# 运维手册

## 项目概述

基于《如何找到你想做的事》一书的交互式自我认知工具。

- **框架**：Next.js 16 (App Router)
- **部署方式**：自托管云服务器
- **数据存储**：浏览器 localStorage（用户数据不上传服务器）
- **AI 接口**：MiniMax API（通过服务器端 `/api/analyze` 代理）

---

## 一、如何更新代码

### 本地开发 → 推送

```bash
cd /path/to/find-your-purpose/site

# 查看改了什么
git status

# 暂存所有改动
git add -A

# 提交
git commit -m "描述本次改动"

# 推送到 GitHub
git push
```

### 服务器拉取更新

```bash
# SSH 登录服务器
ssh root@<服务器IP>

# 进入项目目录
cd /path/to/find-your-purpose/site

# 拉取最新代码
git pull

# 重新构建
npm run build

# 重启服务
pm2 restart 0
```

### 快速更新脚本（可选）

在服务器上创建 `/usr/local/bin/update-app.sh`：

```bash
#!/bin/bash
cd /path/to/find-your-purpose/site
git pull
npm run build
pm2 restart 0
echo "✅ 更新完成"
```

然后只需执行 `update-app.sh` 即可。

---

## 二、环境变量配置

环境变量定义在项目根目录的 `.env` 文件中。

### 当前配置

| 变量 | 值 | 说明 |
|------|-----|------|
| `LLM_API_BASE` | `https://api.minimax.chat/v1` | AI API 地址 |
| `LLM_API_KEY` | `sk-xxx` | API 密钥 |
| `LLM_MODEL` | `minimax-text-01` | 模型名称 |

### 修改方法

```bash
# 登录服务器
ssh root@<服务器IP>

# 编辑环境变量
cd /path/to/find-your-purpose/site
nano .env

# 改完后重启
pm2 restart 0
```

### 更换 AI 提供商

本项目兼容任何 OpenAI 格式的 API。例如：

```env
# 切换为 DeepSeek
LLM_API_BASE=https://api.deepseek.com
LLM_API_KEY=sk-xxx
LLM_MODEL=deepseek-chat

# 切换为 OpenAI
LLM_API_BASE=https://api.openai.com/v1
LLM_API_KEY=sk-xxx
LLM_MODEL=gpt-4o-mini

# 切换为阿里通义千问
LLM_API_BASE=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_API_KEY=sk-xxx
LLM_MODEL=qwen-turbo
```

> ⚠️ `.env` 文件包含 API 密钥，**不要提交到 Git**（已配置在 `.gitignore` 中）
> 首次部署需要手动在服务器上创建 `.env` 文件

---

## 三、服务器运维

### 检查服务状态

```bash
pm2 list               # 查看所有进程
pm2 logs 0             # 查看实时日志
pm2 monit              # 监控 CPU/内存
```

### 重启服务

```bash
pm2 restart 0          # 重启应用
pm2 stop 0             # 停止
pm2 start 0            # 启动
```

### 查看端口占用

```bash
lsof -i :3000          # 查看 3000 端口
netstat -tlnp | grep 3000
```

### 查看磁盘/内存

```bash
df -h                  # 磁盘空间
free -h                # 内存使用
top                    # 进程列表
```

---

## 四、常见问题

### 1. AI 分析按钮没反应 / 返回错误

**可能原因**：API Key 配置错误或额度用完

**排查**：
```bash
# 在服务器上直接测试
curl http://localhost:3000/api/analyze \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"type":"extract-values","text":"测试"}'
```

如果返回 `{"success":false,"error":"..."}`，按错误提示处理。

### 2. 页面白屏 / 500 错误

```bash
# 查看日志
pm2 logs 0 --lines 50
```

常见原因：
- 构建失败 → 重新 `npm run build`
- 端口被占用 → `kill $(lsof -ti:3000)` 再重启
- 内存不足 → `free -h` 检查，考虑加 swap

### 3. 修改代码后不生效

确保执行了完整的更新流程：
```bash
git pull
npm run build          # ✅ 必须 build
pm2 restart 0          # ✅ 必须重启
```

### 4. 如何查看用户数据

所有用户数据存储在**用户自己的浏览器 localStorage** 中，服务器上不存储任何用户数据。这意味着：
- ✅ 用户隐私安全
- ❌ 用户更换浏览器或清除缓存会丢失数据
- ❌ 无法在服务器端查看或管理用户数据

---

## 五、项目架构

```
site/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 首页路线图
│   │   ├── layout.tsx            # 布局（侧边栏 + 用户管理）
│   │   ├── module1/page.tsx      # 模块1：价值观
│   │   ├── module2/page.tsx      # 模块2：才能
│   │   ├── module3/page.tsx      # 模块3：热情
│   │   ├── module4/page.tsx      # 模块4：组合
│   │   ├── dashboard/page.tsx    # 仪表盘
│   │   └── api/analyze/route.ts  # AI 代理接口（服务器端）
│   ├── components/
│   │   ├── AIAnalyzer.tsx        # AI 分析可复用组件
│   │   └── UserMenu.tsx          # 用户管理菜单
│   ├── store.ts                  # 答题数据状态
│   ├── userStore.ts              # 用户管理状态
│   ├── lib/ai.ts                 # AI API 调用封装
│   └── types.ts                  # 类型定义
├── .env                          # 环境变量（不提交 Git）
├── OPS.md                        # 本文件
└── package.json
```

---

## 六、端口暴露说明

当前服务在 `3000` 端口运行。如需要：

### 修改端口

```bash
# 方式一：环境变量
PORT=8080 npm start

# 方式二：修改 pm2 配置
pm2 delete 0
PORT=8080 pm2 start npm --name "find-purpose" -- start
```

### 使用 Nginx 反向代理（推荐生产环境）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 七、技术栈

| 技术 | 用途 |
|------|------|
| Next.js 16 | 框架 |
| React 19 | UI |
| Tailwind CSS v4 | 样式 |
| Zustand | 状态管理 |
| MiniMax API | AI 分析 |
| Lucide React | 图标 |
| PM2 | 进程管理 |

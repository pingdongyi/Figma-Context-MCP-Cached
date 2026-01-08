# 部署文档

本文档介绍如何将 Figma-Context-MCP-Cached 部署到不同环境。

---

## 📋 目录

- [MCP 市场部署（stdio 模式）](#mcp-市场部署stdio-模式)
- [SSE 服务器部署（HTTP 模式）](#sse-服务器部署http-模式)
- [Docker 部署](#docker-部署)
- [环境变量配置](#环境变量配置)
- [命令行参数配置](#命令行参数配置)
- [生产环境注意事项](#生产环境注意事项)

---

## MCP 市场部署（stdio 模式）

适用于通过 MCP 客户端（如 Cursor）直接调用的场景。

### 方式 1：使用环境变量

在 MCP 客户端配置文件中（如 `mcp.json`）：

```json
{
  "mcpServers": {
    "Figma-Context-MCP-Cached": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp-caching-dev-fork", "--stdio"],
      "env": {
        "FIGMA_API_KEY": "your-figma-api-key",
        "FIGMA_CACHING": "{\"ttl\":{\"value\":30,\"unit\":\"d\"}}"
      }
    }
  }
}
```

### 方式 2：使用命令行参数（推荐）

通过命令行参数配置，无需依赖服务器端环境变量，更适合 MCP 市场托管：

```json
{
  "mcpServers": {
    "Figma-Context-MCP-Cached": {
      "command": "npx",
      "args": [
        "-y",
        "figma-developer-mcp-caching-dev-fork",
        "--stdio",
        "--figma-api-key=your-figma-api-key",
        "--figma-caching={\"ttl\":{\"value\":30,\"unit\":\"d\"}}"
      ]
    }
  }
}
```

### 方式 3：使用自定义 .env 文件

```json
{
  "mcpServers": {
    "Figma-Context-MCP-Cached": {
      "command": "npx",
      "args": [
        "-y",
        "figma-developer-mcp-caching-dev-fork",
        "--stdio",
        "--env=/path/to/your/.env"
      ]
    }
  }
}
```

---

## SSE 服务器部署（HTTP 模式）

适用于需要提供 HTTP/SSE 端点的场景，如远程 MCP 服务器托管。

### 1. 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 2. 构建项目

```bash
pnpm build
# 或
npm run build
```

### 3. 配置环境变量

创建 `.env` 文件：

```bash
FIGMA_API_KEY=your-figma-api-key
FIGMA_CACHING={"ttl":{"value":30,"unit":"d"}}
PORT=3333
```

### 4. 启动服务器

**方式 A：使用环境变量**

```bash
node dist/bin.js
```

**方式 B：使用命令行参数**

```bash
node dist/bin.js \
  --figma-api-key=your-figma-api-key \
  --figma-caching='{"ttl":{"value":30,"unit":"d"}}' \
  --port=3333
```

### 5. 验证部署

服务器启动后，你会看到：

```
Initializing Figma MCP Server in HTTP mode on port 3333...
HTTP server listening on port 3333
SSE endpoint available at http://localhost:3333/sse
Message endpoint available at http://localhost:3333/messages
StreamableHTTP endpoint available at http://localhost:3333/mcp
```

### 6. 客户端连接配置

在 MCP 客户端配置中：

```json
{
  "mcpServers": {
    "Figma-Context-MCP-Cached": {
      "type": "sse",
      "url": "http://your-server:3333/sse"
    }
  }
}
```

或使用 StreamableHTTP：

```json
{
  "mcpServers": {
    "Figma-Context-MCP-Cached": {
      "type": "streamable_http",
      "url": "http://your-server:3333/mcp"
    }
  }
}
```

---

## Docker 部署

### 1. 创建 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建项目
RUN pnpm build

# 暴露端口
EXPOSE 3333

# 启动服务器
CMD ["node", "dist/bin.js"]
```

### 2. 构建镜像

```bash
docker build -t figma-mcp-cached:latest .
```

### 3. 运行容器

**使用环境变量：**

```bash
docker run -d \
  -p 3333:3333 \
  -e FIGMA_API_KEY=your-figma-api-key \
  -e FIGMA_CACHING='{"ttl":{"value":30,"unit":"d"}}' \
  figma-mcp-cached:latest
```

**使用命令行参数：**

```bash
docker run -d \
  -p 3333:3333 \
  figma-mcp-cached:latest \
  --figma-api-key=your-figma-api-key \
  --figma-caching='{"ttl":{"value":30,"unit":"d"}}'
```

### 4. 使用 docker-compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  figma-mcp:
    build: .
    ports:
      - "3333:3333"
    environment:
      - FIGMA_API_KEY=${FIGMA_API_KEY}
      - FIGMA_CACHING=${FIGMA_CACHING}
    restart: unless-stopped
```

启动：

```bash
docker-compose up -d
```

---

## 环境变量配置

### 必需变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `FIGMA_API_KEY` | Figma Personal Access Token | `figd_xxxxxxxxxxxxx` |

### 可选变量

| 变量名 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `FIGMA_CACHING` | 缓存配置（JSON 字符串） | 无（禁用缓存） | `{"ttl":{"value":30,"unit":"d"}}` |
| `FIGMA_OAUTH_TOKEN` | OAuth Bearer Token（替代 API Key） | 无 | `oauth_token_xxxxx` |
| `PORT` | HTTP 服务器端口 | `3333` | `8080` |
| `OUTPUT_FORMAT` | 输出格式 | `yaml` | `json` |
| `SKIP_IMAGE_DOWNLOADS` | 跳过图片下载工具 | `false` | `true` |
| `NODE_ENV` | 运行模式 | `development` | `cli`（stdio 模式） |

### 缓存配置格式

`FIGMA_CACHING` 必须是有效的 JSON 字符串：

```json
{
  "ttl": {
    "value": 30,
    "unit": "d"
  },
  "cacheDir": "~/custom-cache"  // 可选
}
```

**时间单位：**
- `ms` - 毫秒
- `s` - 秒
- `m` - 分钟
- `h` - 小时
- `d` - 天

---

## 命令行参数配置

所有环境变量都可以通过命令行参数传入，**命令行参数优先级高于环境变量**。

### 参数列表

| 参数 | 说明 | 示例 |
|------|------|------|
| `--figma-api-key` | Figma API Key | `--figma-api-key=your-key` |
| `--figma-oauth-token` | OAuth Token | `--figma-oauth-token=your-token` |
| `--figma-caching` | 缓存配置 | `--figma-caching='{"ttl":{"value":30,"unit":"d"}}'` |
| `--port` | 服务器端口 | `--port=8080` |
| `--json` | 输出 JSON 格式 | `--json` |
| `--skip-image-downloads` | 跳过图片下载 | `--skip-image-downloads` |
| `--env` | 自定义 .env 文件路径 | `--env=/path/to/.env` |

### 使用示例

```bash
# 完整配置示例
node dist/bin.js \
  --figma-api-key=your-key \
  --figma-caching='{"ttl":{"value":30,"unit":"d"}}' \
  --port=3333 \
  --json
```

---

## 生产环境注意事项

### 1. 安全性

- ✅ **不要**在代码中硬编码 API Key
- ✅ 使用环境变量或安全的密钥管理服务
- ✅ 在生产环境中使用 HTTPS
- ✅ 限制服务器访问（防火墙、VPN 等）

### 2. 性能优化

- ✅ 启用缓存以减少 API 请求
- ✅ 根据设计文件更新频率调整 TTL
- ✅ 监控 API 请求频率，避免触发限流
- ✅ 使用反向代理（如 Nginx）进行负载均衡

### 3. 监控和日志

- ✅ 配置日志收集系统
- ✅ 监控服务器资源使用情况
- ✅ 设置错误告警
- ✅ 定期检查缓存目录大小

### 4. 缓存管理

- ✅ 定期清理过期缓存
- ✅ 监控缓存目录磁盘使用
- ✅ 根据实际需求调整缓存 TTL
- ✅ 在部署新版本时考虑清理缓存

### 5. 故障恢复

- ✅ 配置自动重启（如 systemd、PM2）
- ✅ 设置健康检查端点
- ✅ 配置备份策略
- ✅ 准备回滚方案

### 6. 使用 PM2 管理进程（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start dist/bin.js --name figma-mcp \
  -- --figma-api-key=your-key \
     --figma-caching='{"ttl":{"value":30,"unit":"d"}}'

# 保存配置
pm2 save

# 设置开机自启
pm2 startup
```

### 7. 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 故障排查

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口占用
   lsof -i :3333
   # 或使用其他端口
   --port=8080
   ```

2. **API Key 无效**
   - 检查 API Key 是否正确
   - 确认 API Key 未过期
   - 验证 API Key 权限

3. **缓存不生效**
   - 检查 `FIGMA_CACHING` 配置格式
   - 确认缓存目录有写权限
   - 查看日志确认缓存是否启用

4. **SSE 连接失败**
   - 检查防火墙设置
   - 确认服务器正在运行
   - 验证 URL 是否正确

---

## 相关资源

- [README.md](./README.md) - 项目说明和使用指南
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 贡献指南
- [Figma API 文档](https://www.figma.com/developers/api)
- [MCP 协议文档](https://modelcontextprotocol.io)


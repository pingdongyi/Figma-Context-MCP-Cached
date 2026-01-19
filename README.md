# Figma-Context-MCP-Cached

<div align="center">
  <img src="./docs/logo.png" alt="Figma Context MCP Logo" width="200" style="border-radius: 50%; border: 3px solid #e0e0e0; padding: 10px; background-color: #ffffff;">
  
  <br>

  [![MCP Badge](https://lobehub.com/badge/mcp/pactortester-figma-context-mcp-cached)](https://lobehub.com/mcp/pactortester-figma-context-mcp-cached)
</div>

基于 **Figma Context MCP** 的增强版本，通过**本地持久化缓存**显著减少对 Figma API 的请求次数，从而缓解速率限制问题，提升稳定性与响应速度。

该版本特别适合 **免费 Figma 账号**、**高频上下文请求**、以及 **Cursor / MCP 客户端** 场景。

---

## ✨ 特性

- ✅ 支持 **Figma 文件内容本地缓存**
- ✅ 显著减少 API 请求次数，缓解速率限制
- ✅ 可配置缓存有效期（TTL）
- ✅ 支持自定义缓存目录
- ✅ **新增 `figma_prepare_file` 工具**：智能准备和缓存 Figma 文件
- ✅ **支持 nodeId 检查**：确保指定的节点存在于缓存中
- ✅ **优化的 LLM 调用引导**：自动引导正确的工具调用顺序
- ✅ 完全兼容原有 MCP 接口与调用方式
- ✅ 适用于 Cursor 等 MCP 客户端

---
## 📦 Figma 缓存机制说明（重要）
> ⚠️ **请在设计相对稳定或已定稿后再启用缓存功能**
本 MCP 默认支持对 Figma API 返回结果进行缓存（可配置 TTL），以减少 API 请求次数、提升响应速度并避免触发 Figma 的限流策略。

### ✅ 缓存的优势
- 显著提升 MCP 响应速度
- 降低 Figma API 调用频率
- 适合已定稿或低频变更的设计文件

---
### ⚠️ 潜在风险（请务必注意）
由于缓存机制的存在：
- **当 Figma 页面或组件发生更新时**
- **在缓存未过期（TTL 内）**
- MCP 可能仍返回 **旧的设计数据**
- **无法立即反映最新的设计变更**

这在以下场景中尤为明显：
- 页面结构调整
- 组件属性修改
- 新增 / 删除节点
- 文案或布局的细微更新

---

### ✅ 使用建议（强烈推荐）

- ✅ **设计定稿后** 或 **变更频率较低时** 再启用缓存
- ✅ 代码生成、设计评审、设计回溯等场景非常适合缓存
- ❌ **设计频繁调整阶段不建议启用缓存**

## 📜 开发脚本说明

详细的 NPM Scripts 使用指南请查看 [SCRIPTS.md](./SCRIPTS.md)，包含：
- 构建和开发命令
- 版本管理脚本（一键更新版本号）
- 发布流程说明
- 常用工作流示例

---

## 🚀 使用方式

### 命令行参数（适合 MCP 市场托管）

```json
{
  "mcpServers": {
    "Figma-Context-MCP-Cached": {
      "command": "npx",
      "args": [
        "-y",
        "@pactortester/figma-mcp-cached",
        "--stdio",
        "--figma-api-key=YOUR-KEY",
        "--figma-caching={\"ttl\":{\"value\":30,\"unit\":\"d\"}}"
      ]
    }
  }
}
```

**优先级说明：** 命令行参数 > 环境变量

#### 字段说明：

##### `ttl`（必填）
控制缓存的有效期。

- `value`：数值
- `unit`：时间单位，可选值：
  - `ms`（毫秒）
  - `s`（秒）
  - `m`（分钟）
  - `h`（小时）
  - `d`（天）

---

### `cacheDir`（可选）

控制缓存文件的存储目录。

- 相对路径：相对于当前工作目录
- `~` 会解析为用户主目录

**默认缓存路径：**

- **Linux**：`~/.cache/figma-mcp`
- **macOS**：`~/Library/Caches/FigmaMcp`
- **Windows**：`%LOCALAPPDATA%/FigmaMcpCache`

---

## 🧠 缓存行为说明

当启用缓存后：

1. MCP Server **首次**请求某个 Figma 文件时：
   - 从 Figma API 拉取完整文件
   - 将结果写入本地缓存

2. 在缓存未过期前：
   - `get_figma_data`
   - `get_raw_node`

   等请求将直接从本地缓存返回，不再重复请求 Figma API。

3. 当缓存过期：
   - 自动重新拉取并更新缓存

🔄 **强制刷新缓存**  
如需立即刷新，只需手动删除 `cacheDir` 中对应的缓存文件即可。

---

## 🆕 新功能：figma_prepare_file 工具

### 功能说明

`figma_prepare_file` 是一个智能文件准备工具，用于在获取 Figma 数据之前确保文件已准备好。

**主要特性：**
- ✅ **自动缓存检查**：检查文件是否已缓存且有效
- ✅ **nodeId 验证**：如果提供了 nodeId，会验证该节点是否存在于缓存中
- ✅ **智能刷新**：如果缓存过期或 nodeId 不存在，自动重新拉取文件
- ✅ **缓存未启用提示**：即使缓存未启用，也会提供明确的提示信息

### 使用方式

当用户提供 Figma URL 时，LLM 会自动：
1. **首先调用** `figma_prepare_file` 准备文件
2. **然后调用** `get_figma_data` 获取数据

**示例流程：**
```
用户提供 URL → figma_prepare_file (准备文件) → get_figma_data (获取数据)
```

### 工具参数

- `figmaUrl` (必填): Figma 设计文件 URL
  - 支持格式：`https://www.figma.com/design/<fileKey>/...?node-id=<nodeId>`
  - 自动解析 fileKey 和 nodeId

### 返回值说明

- **缓存已存在且有效**：返回提示信息，不拉取数据
- **缓存不存在或过期**：自动拉取并缓存文件
- **nodeId 不存在**：重新拉取文件并验证 nodeId
- **缓存未启用**：返回警告信息，提示需要配置缓存

---

## ⚠️ 注意事项

- 如果未设置 `FIGMA_CACHING`（环境变量或命令行参数），则保持 **原始不缓存行为**
- 缓存的是 **完整 Figma 文件数据**
- 命令行参数优先级高于环境变量
- **工具调用顺序**：当用户提供 Figma URL 时，LLM 会自动先调用 `figma_prepare_file`，再调用 `get_figma_data`
- 非常适合：
  - 免费 Figma 账号
  - 频繁上下文读取
  - LLM / MCP 自动化场景
  - MCP 市场托管（通过命令行参数配置，无需服务器端环境变量）

---

## 📦 兼容性

- ✅ 完全兼容原 Figma Context MCP
- ✅ 无需修改客户端调用逻辑
- ✅ 可作为原项目的 drop-in 替换

---

## 📄 License

与原项目保持一致。

---

## 🙌 致谢

本项目基于以下开源项目进行开发与优化，在此表示感谢：

- **GLips / Figma-Context-MCP**  
  https://github.com/GLips/Figma-Context-MCP/

- **stone-w4tch3r / Figma-Context-MCP**  
  https://github.com/stone-w4tch3r/Figma-Context-MCP

感谢上述项目提供的核心实现与设计思路。本项目在其基础上引入了**本地持久化缓存机制**，以提升性能并缓解 Figma API 的速率限制问题。


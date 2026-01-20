# 更新日志

所有重要更改都将记录在此文件中。

---

## v1.1.2 (最新)

### 🐛 Bug 修复

- **修复 `get_figma_data` 处理没有 children 属性的 FRAME 节点时报错的问题**
  - 错误信息：`Cannot read properties of undefined (reading 'length')`
  - 修复位置：`src/transformers/layout.ts`
  - 原因：当 Figma API 返回的 FRAME 节点没有 `children` 属性时，代码尝试访问 `children.length` 导致报错
  - 解决方案：添加空值检查 `n.children ?? []`

### ✨ 新功能

- **`figma_prepare_file` 新增 `forceRefresh` 参数**
  - 支持强制从 Figma API 拉取最新数据，绕过缓存
  - 当用户明确要求获取最新数据或设计刚更新时使用
  - 触发方式：用户说"拉取最新数据"、"刷新设计稿"、"设计刚更新了"等

- **`download_figma_images` 优化**
  - `localPath` 参数改为可选
  - 不提供路径时默认下载到系统下载文件夹：
    - macOS: `~/Downloads`
    - Linux: `~/Downloads`
    - Windows: `C:\Users\<username>\Downloads`
  - 移除过于严格的路径限制，支持下载到任意合法绝对路径

---

## v1.0.0

### ✨ 初始版本

- 基于 Figma Context MCP 的增强版本
- 支持 Figma 文件内容本地缓存
- 可配置缓存有效期（TTL）
- 支持自定义缓存目录
- 新增 `figma_prepare_file` 工具：智能准备和缓存 Figma 文件
- 支持 nodeId 检查：确保指定的节点存在于缓存中
- 完全兼容原有 MCP 接口与调用方式

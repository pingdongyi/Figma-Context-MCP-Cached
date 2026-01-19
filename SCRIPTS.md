# 📜 NPM Scripts 使用指南

本文档详细介绍了 `package.json` 中所有可用脚本的作用和使用方法。

---

## 📦 构建相关

### `build`
```bash
pnpm build
```
**作用：** 构建项目，生成生产环境的代码  
**说明：** 
- 使用 `tsup` 进行构建
- 生成 TypeScript 类型定义文件（`.d.ts`）
- 输出到 `dist/` 目录
- 启用代码压缩（生产模式）

---

### `dev`
```bash
pnpm dev
```
**作用：** 开发模式，监听文件变化并自动重新构建  
**说明：**
- 使用 `tsup --watch` 监听文件变化
- 文件修改后自动重新构建
- 不压缩代码，便于调试
- 适合开发时使用

---

### `dev:cli`
```bash
pnpm dev:cli
```
**作用：** 开发模式 + CLI 模式，自动启动服务器  
**说明：**
- 结合了 `dev` 的监听功能
- 构建完成后自动启动 CLI 模式的服务器（`--stdio`）
- 适合测试 MCP 服务器功能

---

### `type-check`
```bash
pnpm type-check
```
**作用：** 检查 TypeScript 类型错误，不生成文件  
**说明：**
- 只进行类型检查，不输出文件
- 用于 CI/CD 流程中验证代码类型
- 比完整构建更快

---

## 🚀 运行相关

### `start`
```bash
pnpm start
```
**作用：** 启动编译后的服务器  
**说明：**
- 运行 `dist/bin.js`
- 需要先执行 `build` 构建项目
- 使用默认配置启动

---

### `start:cli`
```bash
pnpm start:cli
```
**作用：** 以 CLI 模式启动服务器（stdio 模式）  
**说明：**
- 设置 `NODE_ENV=cli` 环境变量
- 启动 stdio 模式的 MCP 服务器
- 适合与 MCP 客户端（如 Cursor）集成

---

### `start:http`
```bash
pnpm start:http
```
**作用：** 以 HTTP 模式启动服务器  
**说明：**
- 启动 HTTP 服务器模式
- 默认端口为 3333（可在配置中修改）
- 适合通过 HTTP 接口调用 MCP 服务

---

## 🧪 测试相关

### `test`
```bash
pnpm test
```
**作用：** 运行测试套件  
**说明：**
- 使用 Jest 运行所有测试
- 测试文件位于 `src/**/*.test.ts`
- 包括单元测试和集成测试

---

## 🔧 代码质量相关

### `lint`
```bash
pnpm lint
```
**作用：** 检查代码规范  
**说明：**
- 使用 ESLint 检查代码
- 检查 TypeScript/JavaScript 代码规范
- 不自动修复，只报告问题

---

### `format`
```bash
pnpm format
```
**作用：** 格式化代码  
**说明：**
- 使用 Prettier 格式化代码
- 自动修复格式问题
- 只格式化 `src/**/*.ts` 文件

---

## 🔍 调试相关

### `inspect`
```bash
pnpm inspect
```
**作用：** 启动 MCP Inspector 工具  
**说明：**
- 使用 `@modelcontextprotocol/inspector` 工具
- 用于调试和测试 MCP 服务器
- 可以查看服务器提供的工具和资源

---

## 📦 版本管理相关

### `version:patch`
```bash
pnpm version:patch
```
**作用：** 将版本号递增补丁版本（Patch）  
**示例：** `1.1.1` → `1.1.2`  
**说明：**
- 自动更新 `package.json` 中的版本号
- 同时更新 `server.json` 中的版本号（两个位置）
- 适用于修复 bug 的发布

---

### `version:minor`
```bash
pnpm version:minor
```
**作用：** 将版本号递增次版本（Minor）  
**示例：** `1.1.1` → `1.2.0`  
**说明：**
- 自动更新 `package.json` 和 `server.json` 中的版本号
- 适用于添加新功能的发布

---

### `version:major`
```bash
pnpm version:major
```
**作用：** 将版本号递增主版本（Major）  
**示例：** `1.1.1` → `2.0.0`  
**说明：**
- 自动更新 `package.json` 和 `server.json` 中的版本号
- 适用于不兼容的重大变更

---

### `version:set`
```bash
pnpm version:set 1.2.3
```
**作用：** 直接设置版本号为指定值  
**说明：**
- 可以设置任意版本号，如 `1.2.3`、`2.0.0-beta.1` 等
- 同时更新 `package.json` 和 `server.json`
- 适用于需要精确控制版本号的场景

---

## 📝 Changesets 相关（版本发布流程）

### `changeset`
```bash
pnpm changeset
```
**作用：** 创建 changeset 文件，记录变更  
**说明：**
- 交互式创建 changeset
- 选择版本类型（patch/minor/major）
- 填写变更描述
- 用于管理版本发布和生成 CHANGELOG

---

### `version`
```bash
pnpm version
```
**作用：** 应用 changesets 并更新版本号  
**说明：**
- 读取所有 changeset 文件
- 自动更新 `package.json` 版本号
- 生成 CHANGELOG
- 将变更添加到 git 暂存区

---

### `beta:start`
```bash
pnpm beta:start
```
**作用：** 进入 beta 预发布模式  
**说明：**
- 启用 changesets 的 beta 预发布流程
- 用于发布 beta 版本

---

### `beta:end`
```bash
pnpm beta:end
```
**作用：** 退出 beta 预发布模式  
**说明：**
- 结束 beta 预发布流程
- 恢复正常发布流程

---

### `beta:version`
```bash
pnpm beta:version
```
**作用：** 在 beta 模式下应用 changesets  
**说明：**
- 类似 `version`，但用于 beta 版本
- 更新版本号并安装依赖（仅更新 lockfile）

---

### `beta:publish`
```bash
pnpm beta:publish
```
**作用：** 发布 beta 版本到 npm  
**说明：**
- 使用 changesets 发布 beta 版本
- 需要先执行 `beta:version`

---

## 🚢 发布相关

### `prepack`
```bash
# 自动在 npm pack 或 npm publish 前执行
```
**作用：** 在打包前自动构建项目  
**说明：**
- 这是 npm 的钩子脚本，会在 `npm pack` 或 `npm publish` 前自动执行
- 确保发布的是最新构建的代码

---

### `prerelease`
```bash
pnpm prerelease
```
**作用：** 发布前的构建步骤  
**说明：**
- 执行 `pnpm build` 构建项目
- 用于发布前的准备工作

---

### `release`
```bash
pnpm release
```
**作用：** 完整的发布流程  
**说明：**
- 使用 changesets 发布到 npm
- 推送 git tags 到远程仓库
- 包含完整的版本管理流程

---

### `pub:release`
```bash
pnpm pub:release
```
**作用：** 构建并发布正式版本到 npm  
**说明：**
- 先执行 `pnpm build` 构建项目
- 然后执行 `npm publish` 发布到 npm
- 适用于不使用 changesets 的直接发布

---

### `pub:release:beta`
```bash
pnpm pub:release:beta
```
**作用：** 构建并发布 beta 版本到 npm  
**说明：**
- 先执行 `pnpm build` 构建项目
- 然后执行 `npm publish --tag beta` 发布 beta 版本
- 版本会标记为 beta，不会影响正式版本

---

## 📋 常用工作流

### 开发流程
```bash
# 1. 启动开发模式
pnpm dev

# 2. 在另一个终端测试
pnpm start:cli
```

### 版本发布流程（使用 Changesets）
```bash
# 1. 创建 changeset
pnpm changeset

# 2. 应用 changeset 并更新版本
pnpm version

# 3. 构建项目
pnpm build

# 4. 发布
pnpm release
```

### 快速版本更新流程
```bash
# 1. 更新版本号（自动同步 package.json 和 server.json）
pnpm version:patch  # 或 version:minor, version:major

# 2. 构建项目
pnpm build

# 3. 发布（如果需要）
pnpm pub:release
```

### 代码质量检查流程
```bash
# 1. 类型检查
pnpm type-check

# 2. 代码规范检查
pnpm lint

# 3. 格式化代码
pnpm format

# 4. 运行测试
pnpm test
```

---

## 💡 提示

1. **开发时**：使用 `pnpm dev` 或 `pnpm dev:cli` 进行开发
2. **发布前**：确保运行 `pnpm build` 构建最新代码
3. **版本管理**：
   - 使用 Changesets：`changeset` → `version` → `release`
   - 快速更新：`version:patch/minor/major` → `build` → `pub:release`
4. **代码质量**：发布前运行 `type-check`、`lint` 和 `test`
5. **版本同步**：`version:patch/minor/major/set` 会自动同步 `package.json` 和 `server.json` 的版本号

---

## 🔗 相关文档

- [项目 README](./README.md)
- [Changesets 文档](https://github.com/changesets/changesets)
- [tsup 文档](https://tsup.egoist.dev/)

